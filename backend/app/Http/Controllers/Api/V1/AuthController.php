<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponses;
use App\Models\User;
use App\Http\Requests\LoginUserRequest;
use App\Http\Requests\RegisterUserRequest;
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
                // address removed from signup; keep null or existing default
                'address' => $validated['address'] ?? null,
            ]);

            // Assign patient role by default
            $user->assignRole('patient');

            // Create associated patient record with only fields collected on signup
            $user->patient()->create([
                'date_of_birth' => $validated['date_of_birth'],
                'phone' => $validated['phone'],
                // Ensure address and emergency_contact are provided (use safe defaults)
                // so DB inserts don't fail when old migrations still have NOT NULL columns.
                'address' => $validated['address'] ?? '',
                'emergency_contact' => $validated['emergency_contact'] ?? [],
                'is_active' => true,
            ]);

            return $user;
        });

        // Don't auto-login - let user login manually after registration
        // Auth::login($user);
        
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

    // Check if user account is active
    if (!$user->is_active) {
        Auth::guard('web')->logout();
        return $this->error('Your account has been deactivated. Please contact an administrator.', 403);
    }

    // Load roles relationship for frontend computed properties
    $user->load('roles:id,name');

    // Add role attribute for consistency with user() method
    $role = $user->roles()->first()->name ?? 'patient';
    $user->setAttribute('role', $role);

    return $this->ok('Authenticated', [
        'user' => $user
    ]);
}

    public function logout(Request $request) 
{
    Auth::guard('web')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return $this->ok('Logged out successfully');
}

    public function user(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            /** @var \App\Models\User $user */
            $user = Auth::user();
            
            if (!$user) {
                return $this->error('User not authenticated', 401);
            }
            
            // Make response faster by removing unnecessary appends
            $user->makeHidden(['profile_photo_url']);
            
            // Only load patient if the user has a patient relationship
            if ($user->patient_id || method_exists($user, 'patient')) {
                $user->load('patient');
            }
            
            // Load only roles (not permissions) for faster response
            $user->load('roles:id,name');

            // Normalize role into a top-level property for frontend consistency
            $role = 'patient';
            if (method_exists($user, 'roles')) {
                $firstRole = $user->roles->first();
                $role = $firstRole ? $firstRole->name : $role;
            }

            // Attach role attribute so JSON response always includes `role`
            $user->setAttribute('role', $role);

            return $this->ok('User data retrieved successfully', ['user' => $user]);

        } catch (\Exception $e) {
            return $this->error('Failed to retrieve user data: ' . $e->getMessage(), 500);
        }
    }

    public function forgotPassword(Request $request)
    {
        try {
            $request->validate(['email' => 'required|email']);

            // Here you would typically integrate with your password reset service
            return $this->ok('Password reset link sent to your email');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error('Validation failed', 422);
        } catch (\Exception $e) {
            return $this->error('Failed to send reset link: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Generate and send a 6-digit OTP to the given email.
     * OTP is stored in Laravel Cache for 10 minutes.
     * In dev/testing mode the OTP is also returned in the response.
     */
    public function sendOtp(Request $request)
    {
        try {
            $request->validate(['email' => 'required|email|exists:users,email']);

            $email = $request->input('email');
            $otp   = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $key   = 'otp_' . md5($email);

            // Store OTP in cache for 10 minutes
            Cache::put($key, $otp, now()->addMinutes(10));

            // Attempt to send email (via dynamic MailSetting if configured, or default mailer)
            $emailSent = false;
            try {
                $mailSettings = \App\Models\MailSetting::first();
                if ($mailSettings && !empty($mailSettings->encrypted_password)) {
                    $password = null;
                    try {
                        $password = \Illuminate\Support\Facades\Crypt::decryptString($mailSettings->encrypted_password);
                    } catch (\Exception $de) {
                        try {
                            $password = decrypt($mailSettings->encrypted_password);
                        } catch (\Exception $de2) {
                            $password = null;
                        }
                    }

                    if ($password) {
                        config([
                            'mail.default' => 'smtp',
                            'mail.mailers.smtp.host' => $mailSettings->host ?? 'smtp.gmail.com',
                            'mail.mailers.smtp.port' => $mailSettings->port ?? 587,
                            'mail.mailers.smtp.username' => $mailSettings->email,
                            'mail.mailers.smtp.password' => $password,
                            'mail.mailers.smtp.encryption' => $mailSettings->encryption ?? 'tls',
                            'mail.from.address' => $mailSettings->email,
                            'mail.from.name' => 'MediConnect',
                        ]);
                    }
                }

                Mail::raw(
                    "Hello,\n\nYour MediConnect email verification code is: {$otp}\n\nThis code is valid for 10 minutes.\n\nThank you,\nMediConnect Team",
                    function ($message) use ($email) {
                        $message->to($email)->subject('MediConnect – Email Verification Code');
                    }
                );
                $emailSent = true;
            } catch (\Exception $mailEx) {
                Log::warning('OTP mail failed (check SMTP settings): ' . $mailEx->getMessage());
            }

            $responseData = ['email_sent' => $emailSent];

            // In local/testing mode, return OTP as a fallback helper
            if (app()->environment(['local', 'development', 'testing'])) {
                $responseData['otp'] = $otp;
            }

            return $this->ok('OTP sent successfully', $responseData);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error('Validation failed', 422, $e->errors());
        } catch (\Exception $e) {
            Log::error('sendOtp failed: ' . $e->getMessage());
            return $this->error('Failed to send OTP: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Verify the submitted 6-digit OTP for the given email.
     * On success, marks the user's email as verified.
     */
    public function verifyOtp(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email|exists:users,email',
                'otp'   => 'required|string|size:6',
            ]);

            $email = $request->input('email');
            $otp   = $request->input('otp');
            $key   = 'otp_' . md5($email);

            $stored = Cache::get($key);

            if (!$stored) {
                return $this->error('OTP has expired. Please request a new one.', 422);
            }

            if ($stored !== $otp) {
                return $this->error('Invalid OTP. Please check and try again.', 422);
            }

            // OTP verified — mark email as verified
            User::where('email', $email)->update(['email_verified_at' => now()]);

            // Remove OTP from cache after successful verification
            Cache::forget($key);

            return $this->ok('Email verified successfully. You can now login.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error('Validation failed', 422, $e->errors());
        } catch (\Exception $e) {
            Log::error('verifyOtp failed: ' . $e->getMessage());
            return $this->error('Verification failed: ' . $e->getMessage(), 500);
        }
    }

    public function resetPassword(Request $request)
    {
        try {
            $request->validate([
                'token' => 'required',
                'email' => 'required|email',
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ]);

            // Here you would typically handle password reset logic
            return $this->ok('Password reset successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error('Validation failed', 422);
        } catch (\Exception $e) {
            return $this->error('Password reset failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update authenticated user's profile (user + patient fields)
     */
    public function updateProfile(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            /** @var \App\Models\User $user */
            $user = Auth::user();

            if (!$user) {
                return $this->error('Unauthenticated', 401);
            }

            $rules = [
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
                'phone' => 'sometimes|nullable|string|max:20',
                'date_of_birth' => 'sometimes|nullable|date',
                // patient fields
                'patient_date_of_birth' => 'sometimes|nullable|date',
                'patient_category' => 'sometimes|nullable|in:none,pwd,senior',
                'blood_type' => 'sometimes|nullable|string|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
                'address' => 'sometimes|nullable|string|max:500',
                'emergency_contact_name' => 'sometimes|nullable|string|max:255',
                'emergency_contact_phone' => 'sometimes|nullable|string|max:20',
            ];

            $validated = $request->validate($rules);

            // Update user fields
            if (isset($validated['name'])) {
                $user->name = $validated['name'];
            }
            if (isset($validated['email'])) {
                $user->email = $validated['email'];
            }
            if (array_key_exists('phone', $validated)) {
                $user->phone = $validated['phone'];
            }
            if (array_key_exists('date_of_birth', $validated)) {
                $user->date_of_birth = $validated['date_of_birth'];
            }

            $user->save();

            // Update or create patient record
            if (
                $user->patient ||
                $request->has('patient_date_of_birth') ||
                $request->has('patient_category') ||
                $request->has('blood_type') ||
                $request->has('address') ||
                $request->has('emergency_contact_name') ||
                $request->has('emergency_contact_phone')
            ) {
                $patient = $user->patient ?: $user->patient()->create([]);

                if ($request->has('patient_date_of_birth')) {
                    $patient->date_of_birth = $validated['patient_date_of_birth'];
                }
                if ($request->has('patient_category')) {
                    $patient->patient_category = $validated['patient_category'] ?? 'none';
                }
                if ($request->has('blood_type')) {
                    $patient->blood_type = $validated['blood_type'];
                }
                if ($request->has('address')) {
                    $patient->address = $validated['address'];
                }
                if ($request->has('emergency_contact_name') || $request->has('emergency_contact_phone')) {
                    $existingEmergency = is_array($patient->emergency_contact) ? $patient->emergency_contact : [];
                    $patient->emergency_contact = array_merge($existingEmergency, [
                        'name' => $validated['emergency_contact_name'] ?? ($existingEmergency['name'] ?? null),
                        'phone' => $validated['emergency_contact_phone'] ?? ($existingEmergency['phone'] ?? null),
                    ]);
                }

                // Prefer phone on user model; keep patient.phone in sync if provided
                if ($request->has('phone')) {
                    $patient->phone = $validated['phone'];
                }

                $patient->save();
            }

            // Reload relationships for response
            $user->load('roles', 'patient');
            $role = $user->roles->first()->name ?? 'patient';
            $user->setAttribute('role', $role);

            return $this->ok('Profile updated successfully', ['user' => $user]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error('Validation failed', 422, $e->errors());
        } catch (\Exception $e) {
            Log::error('Profile update failed: ' . $e->getMessage());
            return $this->error('Failed to update profile: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Change authenticated user's password
     */
    public function changePassword(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            /** @var \App\Models\User $user */
            $user = Auth::user();

            if (!$user) {
                return $this->error('Unauthenticated', 401);
            }

            $request->validate([
                'current_password' => 'required|string',
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ]);

            $current = $request->input('current_password');

            if (!Hash::check($current, $user->password)) {
                return $this->error('Current password is incorrect', 403);
            }

            $user->password = Hash::make($request->input('password'));
            $user->save();

            return $this->ok('Password changed successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error('Validation failed', 422, $e->errors());
        } catch (\Exception $e) {
            Log::error('Change password failed: ' . $e->getMessage());
            return $this->error('Failed to change password: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Check if user is authenticated
     */
    public function checkAuth(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            if (Auth::check()) {
                /** @var \App\Models\User $user */
                $user = Auth::user();
                
                // Only load patient if needed
                if ($user->patient_id || method_exists($user, 'patient')) {
                    $user->load('patient');
                }
                
                // Load only roles (not permissions)
                $user->load('roles:id,name');

                $role = 'patient';
                if (method_exists($user, 'roles')) {
                    $firstRole = $user->roles->first();
                    $role = $firstRole ? $firstRole->name : $role;
                }

                $user->setAttribute('role', $role);

                return $this->ok('User is authenticated', ['user' => $user]);
            }

            return $this->error('User is not authenticated', 401);

        } catch (\Exception $e) {
            return $this->error('Authentication check failed: ' . $e->getMessage(), 500);
        }
    }
}