<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VerifyRegistrationOTPRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Public registration endpoint
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'contact_number' => ['required', 'string', 'max:20'],
            'date_of_birth' => ['required', 'date'],
            'sex' => ['nullable', 'string', 'in:Male,Female,Other'],
            'address' => ['required', 'string', 'max:500'],
            'password' => ['required', 'string', 'min:8'],
            'otp' => ['required', 'string', 'size:7'],
            'emergency_contact' => ['nullable', 'array'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'otp.required' => 'OTP is required.',
            'otp.size' => 'OTP must be 7 characters long.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 8 characters long.',
        ];
    }
}
