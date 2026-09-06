<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PasswordReset extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'token',
        'expires_at',
        'used_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    /**
     * Generate a new reset token
     */
    public static function createToken(int $userId): string
    {
        // Invalidate any existing tokens for this user
        self::where('user_id', $userId)
            ->where('used_at', null)
            ->where('expires_at', '>', now())
            ->delete();

        $token = Str::random(60);

        self::create([
            'user_id' => $userId,
            'token' => hash('sha256', $token),
            'expires_at' => now()->addHours(1), // Token valid for 1 hour
        ]);

        return $token; // Return the unhashed token to send in email
    }

    /**
     * Find a valid reset token
     */
    public static function findValidToken(string $token): ?self
    {
        $hashedToken = hash('sha256', $token);

        return self::where('token', $hashedToken)
            ->where('expires_at', '>', now())
            ->where('used_at', null)
            ->first();
    }

    /**
     * Mark token as used
     */
    public function markAsUsed(): void
    {
        $this->update(['used_at' => now()]);
    }

    /**
     * Check if token is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Relationship to user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
