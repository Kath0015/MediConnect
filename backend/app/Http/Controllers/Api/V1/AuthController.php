<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponses;
use App\Models\User;
use App\Http\Requests\LoginUserRequest;
use App\Http\Requests\RegisterUserRequest;
use App\Http\Requests\PatientRegistrationRequest;
use App\Http\Requests\VerifyRegistrationOTPRequest;
use App\Services\RegistrationService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\DB;

/**
 * AuthController handles user authentication and profile management
 * 
 * @package App\Http\Controllers\Api\V1
 */
class AuthController extends Controller 
{
    use ApiResponses;

    protected $registrationService;

    public function __construct(RegistrationService $registrationService)
    {
        $this->registrationService = $registrationService;
    }

    /**
     * REGISTRATION FLOW - STEP 1: Patient Registration
     * Validate registration data and send OTP
     */
    public function registerPatient(PatientRegistrationRequest $request)
    {
        try {
            $validated = $request->validated();

            // Send OTP to email
            $result = $this->registrationService->sendRegistrationOTP($validated);

            if (!$result['success']) {
                return $this->error($result['message'], 422, [
                    'wait_seconds' => $result['wait_seconds'] ?? null
                ]);
            }

            return $this->ok(
                'OTP sent successfully. Please check your email.',
                [
                    'message' => $result['message'],
                    'email' => $validated['email'],
                    'expires_at' => $result['expires_at'],
                    'resend_available_at' => $result['resend_available_at'],
                ]
            );
        } catch (\Exception $e) {
            Log::error('Registration step 1 failed: ' . $e->getMessage());
            return $this->error('Registration failed. Please try again.', 500);
        }
    }

    /**
     * REGISTRATION FLOW - STEP 2: Verify OTP and Create Account
     * Verify OTP and create the patient account
     */
    public function verifyRegistrationOTP(VerifyRegistrationOTPRequest $request)
    {
        try {
            $validated = $request->validated();
            $otp = $validated['otp'];

            // Verify OTP and create account
            $result = $this->registrationService->verifyOTPAndCreateAccount($validated, $otp);

            if (!$result['success']) {
                return $this->error($result['message'], 422);
            }

            return $this->ok(
                'Email verified successfully! Your account has been created. You can now log in.',
                [
                    'message' => $result['message'],
                    'user_id' => $result['user_id'],
                    'email' => $result['email'],
                ]
            );
        } catch (\Exception $e) {
            Log::error('OTP verification failed: ' . $e->getMessage());
            return $this->error('Verification failed. Please try again.', 500);
        }
    }

    /**
     * REGISTRATION FLOW - Resend OTP
     * Resend OTP to email during registration
     */
    public function resendRegistrationOTP(Request $request)
    {
        try {
            $request->validate([
                'email' => ['required', 'email'],
                'first_name' => ['required', 'string', 'max:50'],
            ]);

            $registrationData = [
                'email' => $request->email,
                'first_name' => $request->first_name,
            ];

            // Send OTP
            $result = $this->registrationService->sendRegistrationOTP($registrationData);

            if (!$result['success']) {
                return $this->error($result['message'], 422, [
                    'wait_seconds' => $result['wait_seconds'] ?? null
                ]);
            }

            return $this->ok(
                'New OTP sent successfully. Please check your email.',
                [
                    'message' => $result['message'],
                    'email' => $request->email,
                    'expires_at' => $result['expires_at'],
                    'resend_available_at' => $result['resend_available_at'],
                ]
            );
        } catch (\Exception $e) {
            Log::error('Resend OTP failed: ' . $e->getMessage());
            return $this->error('Failed to resend OTP. Please try again.', 500);
        }
    }

    /**
     * Check if OTP can be resent
     */
    public function checkResendStatus(Request $request)
    {
        try {
            $request->validate(['email' => ['required', 'email']]);

            $canResend = $this->registrationService->canResendOTP($request->email);

            return $this->ok(
                'Resend status retrieved',
                $canResend
            );
        } catch (\Exception $e) {
            return $this->error('Failed to check resend status', 500);
        }
    }

    /**
     * LEGACY: Old registration endpoint (kept for backward compatibility)
     */
    public function register(RegisterUserRequest $request) 
    {
        try {
            $validated = $request->validated();

            $user = DB::transaction(function () use ($validated) {
                $user = User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'phone' => $validated['phone'],
                    'date_of_birth' => $validated['date_of_birth'],
                    'address' => $validated['address'] ?? null,
                ]);

                $user->assignRole('patient');

                $user->patient()->create([
                    'date_of_birth' => $validated['date_of_birth'],
                    'phone' => $validated['phone'],
                    'address' => $validated['address'] ?? '',
                    'emergency_contact' => $validated['emergency_contact'] ?? [],
                    'is_active' => true,
                ]);

                return $user;
            });
            
            return $this->ok(
                'Registration successful. Please login to continue.',
                [
                    'message' => 'Account created successfully'
                ]
            );

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error('Validation failed', 422, $e->errors());
        } catch (\Exception $e) {
            Log::error('Registration failed: ' . $e->getMessage());
            return $this->error('Registration failed: ' . $e->getMessage(), 500);
        }
    }

    public function login(LoginUserRequest $request): \Illuminate\Http\JsonResponse
    {
        $credentials = $request->only('email', 'password');
        
        if (!Auth::attempt($credentials)) {
            return $this->error('Invalid credentials', 401);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->is_active) {
            Auth::guard('web')->logout();
            return $this->error('Your account has been deactivated. Please contact an administrator.', 403);
        }

        $user->load('roles:id,name');
        $role = $user->roles()->first()->name ?? 'patient';
        $user->setAttribute('role', $role);

        $token = $user->createToken('auth_token', ['*'], now()->addDay())->plainTextToken;

        return $this->ok('Login successful', [
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return $this->ok('Logged out successfully');
    }

    public function user(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return $this->error('Unauthenticated', 401);
        }

        $user->load('roles:id,name');
        $role = $user->roles()->first()->name ?? 'patient';
        $user->setAttribute('role', $role);

        return $this->ok('User retrieved', $user);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return $this->error('User not found', 404);
        }

        // TODO: Implement password reset logic
        return $this->ok('Password reset link sent to your email');
    }

    public function sendOtp(Request $request)
    {
        // TODO: Existing OTP implementation
        return $this->ok('OTP sent');
    }

    public function verifyOtp(Request $request)
    {
        // TODO: Existing OTP verification
        return $this->ok('OTP verified');
    }

    public function resetPassword(Request $request)
    {
        // TODO: Existing reset password
        return $this->ok('Password reset successfully');
    }

    public function updateProfile(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'phone' => 'sometimes|string|max:20',
                'date_of_birth' => 'sometimes|date',
                'address' => 'sometimes|string|max:500',
            ]);

            $user = $request->user();
            $user->update($validated);

            return $this->ok('Profile updated successfully', $user);
        } catch (\Exception $e) {
            return $this->error('Failed to update profile', 500);
        }
    }

    public function changePassword(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $validated = $request->validate([
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            $user = $request->user();

            if (!Hash::check($validated['current_password'], $user->password)) {
                return $this->error('Current password is incorrect', 422);
            }

            $user->update(['password' => Hash::make($validated['new_password'])]);

            return $this->ok('Password changed successfully');
        } catch (\Exception $e) {
            return $this->error('Failed to change password', 500);
        }
    }

    public function checkAuth(Request $request): \Illuminate\Http\JsonResponse
    {
        return $this->ok('User is authenticated', [
            'is_authenticated' => true,
            'user_id' => $request->user()?->id,
        ]);
    }
}
