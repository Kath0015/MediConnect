<?php

namespace App\Services;

use App\Models\User;
use App\Models\Message;
use Illuminate\Support\Collection;

class MessageRoutingService
{
    /**
     * Define messaging rules based on user roles.
     */
    private const MESSAGING_RULES = [
        'admin' => ['admin', 'doctor', 'clinician', 'patient'],
        'doctor' => ['admin', 'doctor', 'clinician', 'patient'],
        'clinician' => ['admin', 'doctor', 'clinician', 'patient'],
        'patient' => ['admin', 'doctor', 'clinician'],
    ];

    /**
     * Get all users that a given user can message.
     */
    public function getAvailableContacts(User $user): Collection
    {
        $userRole = $this->getUserPrimaryRole($user);
        $allowedRoles = self::MESSAGING_RULES[$userRole] ?? [];

        if (empty($allowedRoles)) {
            return collect();
        }

        return User::with('roles')
            ->where('id', '!=', $user->id)
            ->where('is_active', true)
            ->whereHas('roles', function ($query) use ($allowedRoles) {
                $query->whereIn('name', $allowedRoles);
            })
            ->orderBy('name')
            ->get();
    }

    /**
     * Check if user A can send messages to user B.
     */
    public function canMessage(User $sender, User $receiver): bool
    {
        $senderRole = $this->getUserPrimaryRole($sender);
        $receiverRole = $this->getUserPrimaryRole($receiver);
        
        $allowedRoles = self::MESSAGING_RULES[$senderRole] ?? [];
        
        return in_array($receiverRole, $allowedRoles);
    }

    /**
     * Get users grouped by their role for better organization.
     */
    public function getContactsGroupedByRole(User $user): array
    {
        $contacts = $this->getAvailableContacts($user);
        $grouped = [];

        foreach ($contacts as $contact) {
            $role = $this->getUserPrimaryRole($contact);
            $roleLabel = $this->getRoleLabel($role);
            
            if (!isset($grouped[$role])) {
                $grouped[$role] = [
                    'role' => $role,
                    'label' => $roleLabel,
                    'users' => [],
                ];
            }
            
            $grouped[$role]['users'][] = [
                'id' => $contact->id,
                'name' => $contact->name,
                'email' => $contact->email,
                'role' => $roleLabel,
                'role_key' => $role,
                'avatar' => $this->getInitials($contact->name),
                'photo_url' => $contact->profile_photo_url,
            ];
        }

        // Order groups by priority
        $priority = ['admin', 'doctor', 'clinician', 'patient'];
        $ordered = [];
        
        foreach ($priority as $role) {
            if (isset($grouped[$role])) {
                $ordered[] = $grouped[$role];
            }
        }

        return $ordered;
    }

    /**
     * Get suggested contacts based on user's role and recent activity.
     */
    public function getSuggestedContacts(User $user, int $limit = 5): Collection
    {
        $userRole = $this->getUserPrimaryRole($user);
        
        // Get recent conversation partners
        $recentPartners = Message::where('sender_id', $user->id)
            ->orWhere('receiver_id', $user->id)
            ->with(['sender.roles', 'receiver.roles'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($message) use ($user) {
                return $message->sender_id === $user->id ? $message->receiver : $message->sender;
            })
            ->unique('id')
            ->take($limit);

        // If we don't have enough recent contacts, fill with role-based suggestions
        if ($recentPartners->count() < $limit) {
            $needed = $limit - $recentPartners->count();
            $excludeIds = $recentPartners->pluck('id')->toArray();
            $excludeIds[] = $user->id;

            $suggestions = $this->getRolePrioritizedContacts($user, $needed, $excludeIds);
            $recentPartners = $recentPartners->merge($suggestions);
        }

        return $recentPartners->take($limit);
    }

    /**
     * Get message routing statistics for analytics.
     */
    public function getRoutingStats(User $user): array
    {
        $userRole = $this->getUserPrimaryRole($user);
        $allowedRoles = self::MESSAGING_RULES[$userRole] ?? [];
        
        $stats = [];
        foreach ($allowedRoles as $role) {
            $roleUsers = User::whereHas('roles', function ($q) use ($role) {
                $q->where('name', $role);
            })->where('is_active', true)->count();
            
            $messagesSent = Message::where('sender_id', $user->id)
                ->whereHas('receiver.roles', function ($q) use ($role) {
                    $q->where('name', $role);
                })->count();
            
            $messagesReceived = Message::where('receiver_id', $user->id)
                ->whereHas('sender.roles', function ($q) use ($role) {
                    $q->where('name', $role);
                })->count();
            
            $stats[$role] = [
                'role' => $role,
                'label' => $this->getRoleLabel($role),
                'available_users' => $roleUsers,
                'messages_sent' => $messagesSent,
                'messages_received' => $messagesReceived,
            ];
        }
        
        return $stats;
    }

    /**
     * Get the primary role of a user.
     */
    private function getUserPrimaryRole(User $user): string
    {
        return $user->roles->first()?->name ?? 'patient';
    }

    /**
     * Get role label for display.
     */
    private function getRoleLabel(string $role): string
    {
        return match (strtolower($role)) {
            'doctor' => 'Doctor',
            'clinician' => 'Clinic Staff',
            'patient' => 'Patient',
            'admin' => 'Administrator',
            default => ucfirst($role),
        };
    }

    /**
     * Get contacts prioritized by role for suggestions.
     */
    private function getRolePrioritizedContacts(User $user, int $limit, array $excludeIds): Collection
    {
        $userRole = $this->getUserPrimaryRole($user);
        
        // Define priority order based on user role
        $priorities = match ($userRole) {
            'patient' => ['doctor', 'clinician', 'admin'],
            'doctor' => ['patient', 'clinician', 'admin'],
            'clinician' => ['patient', 'doctor', 'admin'],
            'admin' => ['doctor', 'clinician', 'patient'],
            default => ['doctor', 'clinician', 'admin', 'patient'],
        };

        $contacts = collect();
        foreach ($priorities as $role) {
            if ($contacts->count() >= $limit) {
                break;
            }
            
            $needed = $limit - $contacts->count();
            $roleContacts = User::with('roles')
                ->whereNotIn('id', $excludeIds)
                ->where('is_active', true)
                ->whereHas('roles', function ($q) use ($role) {
                    $q->where('name', $role);
                })
                ->limit($needed)
                ->get();
            
            $contacts = $contacts->merge($roleContacts);
        }

        return $contacts->take($limit);
    }

    /**
     * Generate initials from name.
     */
    private function getInitials(string $name): string
    {
        $words = preg_split('/\s+/', trim($name));
        $initials = '';
        foreach ($words as $word) {
            if (!empty($word)) {
                $initials .= strtoupper(mb_substr($word, 0, 1));
            }
            if (mb_strlen($initials) >= 2) break;
        }
        return $initials ?: 'U';
    }
}