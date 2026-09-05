<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use App\Services\MessageRoutingService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class MessageController extends Controller
{
    protected $messageRoutingService;

    public function __construct(MessageRoutingService $messageRoutingService)
    {
        $this->messageRoutingService = $messageRoutingService;
    }
    /**
     * Get list of conversations for authenticated user.
     */
    public function conversations(Request $request)
    {
        $myId = $request->user()->id;

        // Fetch all messages involving the authenticated user
        $messages = Message::with(['sender.roles', 'receiver.roles'])
            ->where('sender_id', $myId)
            ->orWhere('receiver_id', $myId)
            ->orderBy('created_at', 'desc')
            ->get();

        // Group by the conversation partner
        $grouped = [];
        foreach ($messages as $msg) {
            $partnerId = $msg->sender_id === $myId ? $msg->receiver_id : $msg->sender_id;
            if (!isset($grouped[$partnerId])) {
                $grouped[$partnerId] = [
                    'partner_id' => $partnerId,
                    'last_message' => $msg,
                    'unread_count' => 0,
                ];
            }

            // Count unread messages sent to me
            if ($msg->receiver_id === $myId && !$msg->is_read) {
                $grouped[$partnerId]['unread_count']++;
            }
        }

        // Build list with user details
        $conversations = [];
        foreach ($grouped as $partnerId => $data) {
            $partner = User::with('roles')->find($partnerId);
            if (!$partner) continue;

            $roleName = $partner->roles->first()?->name ?? 'User';
            $roleLabel = match (strtolower($roleName)) {
                'doctor' => 'Doctor',
                'clinician' => 'Clinic Staff',
                'patient' => 'Patient',
                'admin' => 'Administrator',
                default => ucfirst($roleName),
            };

            $lastMsg = $data['last_message'];
            $timeDisplay = $this->formatMessageTime($lastMsg->created_at);

            $avatar = $this->getInitials($partner->name);

            $conversations[] = [
                'id' => $partner->id,
                'name' => $partner->name,
                'email' => $partner->email,
                'role' => $roleLabel,
                'role_key' => strtolower($roleName),
                'avatar' => $avatar,
                'photo_url' => $partner->profile_photo_url,
                'last_message' => $lastMsg->message,
                'time' => $timeDisplay,
                'last_message_at' => $lastMsg->created_at,
                'unread' => $data['unread_count'],
            ];
        }

        // Sort by last message time descending
        usort($conversations, function ($a, $b) {
            return strtotime($b['last_message_at']) <=> strtotime($a['last_message_at']);
        });

        return response()->json($conversations);
    }

    /**
     * Get available contacts to start a conversation with.
     */
    public function contacts(Request $request)
    {
        $user = $request->user();
        $contacts = $this->messageRoutingService->getAvailableContacts($user);

        $contactsArray = $contacts->map(function (User $u) {
            $roleName = $u->roles->first()?->name ?? 'User';
            $roleLabel = match (strtolower($roleName)) {
                'doctor' => 'Doctor',
                'clinician' => 'Clinic Staff',
                'patient' => 'Patient',
                'admin' => 'Administrator',
                default => ucfirst($roleName),
            };

            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $roleLabel,
                'role_key' => strtolower($roleName),
                'avatar' => $this->getInitials($u->name),
                'photo_url' => $u->profile_photo_url,
            ];
        });

        return response()->json($contactsArray);
    }

    /**
     * Get contacts organized by role for better UX.
     */
    public function contactsByRole(Request $request)
    {
        $user = $request->user();
        $groupedContacts = $this->messageRoutingService->getContactsGroupedByRole($user);

        return response()->json($groupedContacts);
    }

    /**
     * Get suggested contacts based on recent activity.
     */
    public function suggestedContacts(Request $request)
    {
        $user = $request->user();
        $limit = $request->get('limit', 5);
        $suggestions = $this->messageRoutingService->getSuggestedContacts($user, $limit);

        $suggestionsArray = $suggestions->map(function (User $u) {
            $roleName = $u->roles->first()?->name ?? 'User';
            $roleLabel = match (strtolower($roleName)) {
                'doctor' => 'Doctor',
                'clinician' => 'Clinic Staff',
                'patient' => 'Patient',
                'admin' => 'Administrator',
                default => ucfirst($roleName),
            };

            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $roleLabel,
                'role_key' => strtolower($roleName),
                'avatar' => $this->getInitials($u->name),
                'photo_url' => $u->profile_photo_url,
            ];
        });

        return response()->json($suggestionsArray);
    }

    /**
     * Get message history with a specific user.
     */
    public function messages(Request $request, $otherUserId)
    {
        $user = $request->user();
        $myId = $user->id;
        $otherUser = User::with('roles')->findOrFail($otherUserId);

        // Check if the user is allowed to message this recipient
        if (!$this->messageRoutingService->canMessage($user, $otherUser) && !$this->messageRoutingService->canMessage($otherUser, $user)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to view messages with this user.',
            ], 403);
        }

        // Mark incoming messages as read
        Message::where('sender_id', $otherUserId)
            ->where('receiver_id', $myId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        // Get conversation messages
        $messages = Message::betweenUsers($myId, $otherUserId)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($m) use ($myId) {
                return [
                    'id' => $m->id,
                    'sender_id' => $m->sender_id,
                    'receiver_id' => $m->receiver_id,
                    'text' => $m->message,
                    'mine' => $m->sender_id === $myId,
                    'is_read' => $m->is_read,
                    'time' => $m->created_at ? $m->created_at->format('h:i A') : '',
                    'date' => $m->created_at ? $m->created_at->format('M d, Y') : '',
                    'created_at' => $m->created_at,
                ];
            });

        $roleName = $otherUser->roles->first()?->name ?? 'User';
        $roleLabel = match (strtolower($roleName)) {
            'doctor' => 'Doctor',
            'clinician' => 'Clinic Staff',
            'patient' => 'Patient',
            'admin' => 'Administrator',
            default => ucfirst($roleName),
        };

        return response()->json([
            'partner' => [
                'id' => $otherUser->id,
                'name' => $otherUser->name,
                'email' => $otherUser->email,
                'role' => $roleLabel,
                'role_key' => strtolower($roleName),
                'avatar' => $this->getInitials($otherUser->name),
                'photo_url' => $otherUser->profile_photo_url,
            ],
            'messages' => $messages,
        ]);
    }

    /**
     * Send a new message.
     */
    public function send(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string|max:5000',
        ]);

        $user = $request->user();
        $myId = $user->id;
        $receiverId = $request->receiver_id;

        // Check if the user is allowed to send messages to this recipient
        $receiver = User::with('roles')->findOrFail($receiverId);
        
        if (!$this->messageRoutingService->canMessage($user, $receiver)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to send messages to this user.',
            ], 403);
        }

        $message = Message::create([
            'sender_id' => $myId,
            'receiver_id' => $receiverId,
            'message' => trim($request->message),
            'is_read' => false,
        ]);

        return response()->json([
            'id' => $message->id,
            'sender_id' => $message->sender_id,
            'receiver_id' => $message->receiver_id,
            'text' => $message->message,
            'mine' => true,
            'is_read' => false,
            'time' => $message->created_at->format('h:i A'),
            'date' => $message->created_at->format('M d, Y'),
            'created_at' => $message->created_at,
        ], 201);
    }

    /**
     * Get total unread message count for the authenticated user.
     */
    public function unreadCount(Request $request)
    {
        $count = Message::where('receiver_id', $request->user()->id)
            ->where('is_read', false)
            ->count();

        return response()->json(['unread_count' => $count]);
    }

    /**
     * Mark all messages from a specific user as read.
     */
    public function markAsRead(Request $request, $otherUserId)
    {
        $myId = $request->user()->id;
        
        $updated = Message::where('sender_id', $otherUserId)
            ->where('receiver_id', $myId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'marked_read' => $updated,
        ]);
    }

    /**
     * Helper to get avatar initials from a full name.
     */
    private function getInitials($name)
    {
        $words = preg_split('/\s+/', trim($name));
        $initials = '';
        foreach ($words as $w) {
            if (!empty($w)) {
                $initials .= strtoupper(mb_substr($w, 0, 1));
            }
            if (mb_strlen($initials) >= 2) break;
        }
        return $initials ?: 'U';
    }

    /**
     * Format time nicely (e.g., Today at 09:35 AM, Yesterday, or Sep 04).
     */
    private function formatMessageTime($dateTime)
    {
        if (!$dateTime) return '';

        $carbon = Carbon::parse($dateTime);
        if ($carbon->isToday()) {
            return $carbon->format('h:i A');
        } elseif ($carbon->isYesterday()) {
            return 'Yesterday';
        } elseif ($carbon->isCurrentYear()) {
            return $carbon->format('M d');
        } else {
            return $carbon->format('M d, Y');
        }
    }

    /**
     * Get messaging statistics for the current user.
     */
    public function getMessagingStats(Request $request)
    {
        $user = $request->user();
        $userId = $user->id;
        
        $totalSent = Message::where('sender_id', $userId)->count();
        $totalReceived = Message::where('receiver_id', $userId)->count();
        $unreadReceived = Message::where('receiver_id', $userId)->where('is_read', false)->count();
        $activeConversations = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->distinct('sender_id', 'receiver_id')
            ->count();

        // Get routing stats using the service
        $routingStats = $this->messageRoutingService->getRoutingStats($user);

        return response()->json([
            'total_sent' => $totalSent,
            'total_received' => $totalReceived,
            'unread_received' => $unreadReceived,
            'active_conversations' => $activeConversations,
            'routing_stats' => $routingStats,
        ]);
    }

    /**
     * Check if two users have an existing conversation.
     */
    public function hasConversation(Request $request, $otherUserId)
    {
        $myId = $request->user()->id;
        
        $hasMessages = Message::betweenUsers($myId, $otherUserId)->exists();
        
        return response()->json([
            'has_conversation' => $hasMessages,
        ]);
    }

    /**
     * Get role-specific contact suggestions based on user's role and messaging rules.
     */
    private function getRoleBasedContacts($user)
    {
        $suggestions = [];
        
        if ($user->hasRole('patient')) {
            // Patients should primarily message their attending doctor
            $suggestions['primary'] = User::whereHas('roles', function($q) {
                $q->where('name', 'doctor');
            })->where('is_active', true)->get();
            
            $suggestions['secondary'] = User::whereHas('roles', function($q) {
                $q->where('name', 'clinician');
            })->where('is_active', true)->get();
        } elseif ($user->hasRole('doctor')) {
            // Doctors can prioritize patients, then staff
            $suggestions['patients'] = User::whereHas('roles', function($q) {
                $q->where('name', 'patient');
            })->where('is_active', true)->get();
            
            $suggestions['staff'] = User::whereHas('roles', function($q) {
                $q->whereIn('name', ['clinician', 'admin']);
            })->where('is_active', true)->get();
        } elseif ($user->hasRole('clinician')) {
            // Clinicians can message patients and doctors
            $suggestions['patients'] = User::whereHas('roles', function($q) {
                $q->where('name', 'patient');
            })->where('is_active', true)->get();
            
            $suggestions['doctors'] = User::whereHas('roles', function($q) {
                $q->where('name', 'doctor');
            })->where('is_active', true)->get();
        }
        
        return $suggestions;
    }
}
