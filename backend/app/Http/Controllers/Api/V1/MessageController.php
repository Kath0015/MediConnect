<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class MessageController extends Controller
{
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
        $isDoctor = $user->hasRole('doctor');
        $isClinician = $user->hasRole('clinician');
        $isPatient = $user->hasRole('patient');

        $query = User::with('roles')->where('id', '!=', $user->id)->where('is_active', true);

        if ($isDoctor || $isClinician) {
            // Doctors and Clinicians can message patients, doctors, and staff
            $query->whereHas('roles', function ($q) {
                $q->whereIn('name', ['patient', 'doctor', 'clinician']);
            });
        } elseif ($isPatient) {
            // Patients can message doctors and clinic staff
            $query->whereHas('roles', function ($q) {
                $q->whereIn('name', ['doctor', 'clinician']);
            });
        }

        $contacts = $query->orderBy('name')->get()->map(function (User $u) {
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

        return response()->json($contacts);
    }

    /**
     * Get message history with a specific user.
     */
    public function messages(Request $request, $otherUserId)
    {
        $myId = $request->user()->id;
        $otherUser = User::with('roles')->findOrFail($otherUserId);

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

        $myId = $request->user()->id;

        $message = Message::create([
            'sender_id' => $myId,
            'receiver_id' => $request->receiver_id,
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
}
