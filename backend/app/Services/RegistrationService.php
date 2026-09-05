<?php

namespace App\Services;

use App\Models\User;
use App\Models\OTP;
use App\Models\Patient;
use App\Mail\SendOTPMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;

class RegistrationService
{
    /**
     * OTP validity period in minutes
     */
    const OTP_VALIDITY_MINUTES = 10;

    /**
     * Resend cooldown in minutes
     */
    const RESEND_COOLDOWN_MINUTES = 1;

    /**
     * OTP code length
     */
    const OTP_LENGTH = 7;

    /**
     * Generate a 7-character OTP with uppercase, lowercase, and numbers
     */
    public function generateOTP(): string
    {
        $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $lowercase = 'abcdefghijklmnopqrstuvwxyz';
        $numbers = '0123456789';
        $allChars = $uppercase . $lowercase . $numbers;

        $otp = '';
        $length = strlen($allChars);

        for ($i = 0; $i < self::OTP_LENGTH; $i++) {
            $otp .= $allChars[random_int(0, $length - 1)];
        }

        return $otp;
    }

    /**
     * Send OTP to email during registration step 1
     */
    public function sendRegistrationOTP(array $registrationData): array
    {
        $email = $registrationData['email'];

        // Check if email already registered
        if (User::where('email', $email)->exists()) {
            return [
                'success' => false,
                'message' => 'Email address is already registered.',
            ];
        }

        // Check if user can resend (only 1 OTP per minute)
        $lastOTP = OTP::where('email', $email)
            ->latest()
            ->first();

        if ($lastOTP && $lastOTP->created_at->addMinutes(self::RESEND_COOLDOWN_MINUTES)->isFuture()) {
            $waitTime = $lastOTP->created_at->addMinutes(self::RESEND_COOLDOWN_MINUTES)->diffInSeconds(now());
            return [
                'success' => false,
                'message' => "Please wait {$waitTime} seconds before requesting a new OTP.",
                'wait_seconds' => $waitTime,
            ];
        }

        // Invalidate previous OTPs for this email
        OTP::where('email', $email)
            ->where('is_used', false)
            ->update(['is_used' => true, 'used_at' => now()]);

        // Generate and send new OTP
        $otp = $this->generateOTP();
        $expiresAt = now()->addMinutes(self::OTP_VALIDITY_MINUTES);

        try {
            OTP::create([
                'email' => $email,
                'code' => $otp,
                'is_used' => false,
                'expires_at' => $expiresAt,
            ]);

            // Send OTP via email
            Mail::send(
                new SendOTPMail(
                    email: $email,
                    otp: $otp,
                    patientName: $registrationData['first_name'] ?? 'Valued Patient'
                )
            );

            return [
                'success' => true,
                'message' => 'OTP sent successfully to your email.',
                'expires_at' => $expiresAt,
                'resend_available_at' => now()->addMinutes(self::RESEND_COOLDOWN_MINUTES),
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to send OTP. Please try again.',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify OTP and create user account
     */
    public function verifyOTPAndCreateAccount(array $registrationData, string $otp): array
    {
        $email = $registrationData['email'];

        // Find the latest OTP for this email
        $otpRecord = OTP::where('email', $email)
            ->latest()
            ->first();

        if (!$otpRecord) {
            return [
                'success' => false,
                'message' => 'No OTP found for this email. Please request a new OTP.',
            ];
        }

        // Check if OTP is used
        if ($otpRecord->is_used) {
            return [
                'success' => false,
                'message' => 'This OTP has already been used. Please request a new OTP.',
            ];
        }

        // Check if OTP is expired
        if ($otpRecord->isExpired()) {
            return [
                'success' => false,
                'message' => 'This OTP has expired. Please request a new OTP.',
            ];
        }

        // Check if OTP code matches exactly
        if ($otpRecord->code !== $otp) {
            return [
                'success' => false,
                'message' => 'Invalid OTP. Please check the code sent to your email.',
            ];
        }

        // All validations passed, create user account
        try {
            $user = DB::transaction(function () use ($registrationData, $otpRecord) {
                // Create user
                $user = User::create([
                    'name' => trim($registrationData['first_name'] . ' ' . $registrationData['last_name']),
                    'email' => $registrationData['email'],
                    'password' => Hash::make($registrationData['password']),
                    'phone' => $registrationData['contact_number'],
                    'date_of_birth' => $registrationData['date_of_birth'],
                    'address' => $registrationData['address'],
                    'email_verified_at' => now(),
                    'is_active' => true,
                ]);

                // Assign patient role
                $user->assignRole('patient');

                // Create patient record
                Patient::create([
                    'user_id' => $user->id,
                    'date_of_birth' => $registrationData['date_of_birth'],
                    'phone' => $registrationData['contact_number'],
                    'address' => $registrationData['address'],
                    'sex' => $registrationData['sex'] ?? null,
                    'emergency_contact' => $registrationData['emergency_contact'] ?? [],
                    'is_active' => true,
                ]);

                // Mark OTP as used
                $otpRecord->markAsUsed();

                return $user;
            });

            return [
                'success' => true,
                'message' => 'Email verified successfully! Your account has been created. You can now log in.',
                'user_id' => $user->id,
                'email' => $user->email,
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to create account. Please try again.',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check if user can resend OTP
     */
    public function canResendOTP(string $email): array
    {
        $lastOTP = OTP::where('email', $email)
            ->latest()
            ->first();

        if (!$lastOTP) {
            return [
                'can_resend' => true,
                'wait_seconds' => 0,
            ];
        }

        $nextResendTime = $lastOTP->created_at->addMinutes(self::RESEND_COOLDOWN_MINUTES);

        if ($nextResendTime->isFuture()) {
            $waitSeconds = $nextResendTime->diffInSeconds(now());
            return [
                'can_resend' => false,
                'wait_seconds' => $waitSeconds,
                'next_resend_at' => $nextResendTime,
            ];
        }

        return [
            'can_resend' => true,
            'wait_seconds' => 0,
        ];
    }
}
