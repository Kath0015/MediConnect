# Two-Step Patient Registration - Testing Checklist

## Implementation Status: ✅ COMPLETE (7/8 Tasks Done)

---

## Pre-Testing Verification ✅

### Database & Migrations
- [x] OTP table migration created and executed
- [x] Migration file: `backend/database/migrations/2026_09_05_000001_create_otps_table.php`
- [x] OTP table exists with columns: `id`, `email`, `code`, `is_used`, `used_at`, `expires_at`, `created_at`, `updated_at`
- [x] Database indexes configured: `email`, `expires_at`, unique `code`

### Backend Implementation
- [x] OTP Model: `backend/app/Models/OTP.php`
  - Methods: `isValid()`, `isExpired()`, `markAsUsed()`
  - Scopes: `valid()`, `latest()`
- [x] RegistrationService: `backend/app/Services/RegistrationService.php`
  - `generateOTP()` - Creates 7-char alphanumeric OTP
  - `sendRegistrationOTP()` - Sends OTP via email, enforces 1-min cooldown
  - `verifyOTPAndCreateAccount()` - Validates OTP and creates account
  - `canResendOTP()` - Checks resend eligibility
- [x] AuthController endpoints:
  - `POST /api/auth/patient/register` - registerPatient()
  - `POST /api/auth/patient/verify-otp` - verifyRegistrationOTP()
  - `POST /api/auth/patient/resend-otp` - resendRegistrationOTP()
  - `GET /api/auth/patient/check-resend-status` - checkResendStatus()
- [x] Form validators:
  - `PatientRegistrationRequest` - Validates registration fields
  - `VerifyRegistrationOTPRequest` - Validates OTP format
- [x] Email template: `backend/resources/views/emails/send-otp.blade.php`
  - Professional clinic branding
  - OTP display box with 10-min expiry notice
  - Security warnings and instructions

### Frontend Implementation
- [x] PatientRegistration component: `frontend/src/pages/auth/PatientRegistration.jsx`
  - Fields: first_name, last_name, email, contact_number, date_of_birth, sex, address, password, password_confirmation
  - Client-side validation with error display
  - Password visibility toggle
  - Organized sections (Personal Information, Account Security)
- [x] PatientOTPVerification component: `frontend/src/pages/auth/PatientOTPVerification.jsx`
  - OTP input field (7 characters, alphanumeric only)
  - Expiry countdown timer (10 minutes)
  - Resend functionality with 1-minute cooldown
  - Success/error handling
  - Troubleshooting tips
- [x] Routes configured in `frontend/src/App.jsx`
  - `/auth/patient/register` → PatientRegistration
  - `/auth/patient/verify-otp` → PatientOTPVerification

---

## Test Plan

### Phase 1: Backend API Testing (Manual via Postman/Insomnia)

#### Test 1.1: Register Patient - Success Path
**Endpoint:** `POST /api/auth/patient/register`
**Request:**
```json
{
  "first_name": "Juan",
  "last_name": "Dela Cruz",
  "email": "juan@example.com",
  "contact_number": "09171234567",
  "date_of_birth": "1990-05-15",
  "sex": "Male",
  "address": "123 Main St, Manila",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!"
}
```
**Expected Response:**
- Status: 200/201
- Body:
  ```json
  {
    "success": true,
    "message": "OTP sent successfully to your email.",
    "expires_at": "2026-09-05T10:10:00Z"
  }
  ```
**Verify:**
- [ ] OTP record created in database
- [ ] OTP is 7 characters (alphanumeric mix)
- [ ] OTP email sent
- [ ] expires_at is 10 minutes from now

#### Test 1.2: Register - Validation Errors
**Test Cases:**
- [ ] Missing required field → Error: "field is required"
- [ ] Invalid email → Error: "Please enter a valid email address"
- [ ] Password too short → Error: "Password must be at least 8 characters"
- [ ] Passwords don't match → Error: "Passwords do not match"
- [ ] Already registered email → Error: "Email address is already registered"

#### Test 1.3: Verify Registration OTP - Success Path
**Endpoint:** `POST /api/auth/patient/verify-otp`
**Request:**
```json
{
  "first_name": "Juan",
  "last_name": "Dela Cruz",
  "email": "juan@example.com",
  "contact_number": "09171234567",
  "date_of_birth": "1990-05-15",
  "sex": "Male",
  "address": "123 Main St, Manila",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!",
  "otp": "AbC1234"
}
```
**Expected Response:**
- Status: 200/201
- Body:
  ```json
  {
    "success": true,
    "message": "Email verified successfully! Your account has been created. You can now log in.",
    "user_id": 1,
    "email": "juan@example.com"
  }
  ```
**Verify:**
- [ ] User created in `users` table
- [ ] Patient record created in `patients` table
- [ ] User has role: "patient"
- [ ] user.email_verified_at is set to now()
- [ ] OTP marked as used (is_used = true, used_at = now())
- [ ] Can log in with this email/password

#### Test 1.4: Verify Registration OTP - Error Cases
**Test Cases:**
- [ ] Invalid OTP (wrong code) → Error: "Invalid OTP. Please check the code"
- [ ] Expired OTP (>10 min old) → Error: "This OTP has expired"
- [ ] Already used OTP → Error: "This OTP has already been used"
- [ ] Non-existent OTP → Error: "No OTP found for this email"

#### Test 1.5: Resend OTP - Success Path
**Endpoint:** `POST /api/auth/patient/resend-otp`
**Request:**
```json
{
  "email": "juan@example.com",
  "first_name": "Juan"
}
```
**Expected Response:**
- Status: 200
- Body:
  ```json
  {
    "success": true,
    "message": "New OTP sent to your email"
  }
  ```
**Verify:**
- [ ] New OTP created
- [ ] Old OTP marked as used
- [ ] New OTP is different from old OTP
- [ ] New expiry_at is 10 minutes from now
- [ ] New email sent

#### Test 1.6: Resend OTP - Cooldown Enforcement
**Test Case:**
- [ ] Request resend immediately after first OTP
- [ ] Should get error: "Please wait X seconds before requesting a new OTP"
- [ ] Wait_seconds should be accurate (≤60)

#### Test 1.7: Check Resend Status
**Endpoint:** `GET /api/auth/patient/check-resend-status?email=juan@example.com`
**Expected Response (within cooldown):**
```json
{
  "can_resend": false,
  "wait_seconds": 45
}
```
**Expected Response (after cooldown):**
```json
{
  "can_resend": true,
  "wait_seconds": 0
}
```

---

### Phase 2: Frontend UI Testing

#### Test 2.1: Patient Registration Form - Render
- [ ] Form loads without errors
- [ ] All 9 fields visible: first_name, last_name, email, contact_number, date_of_birth, sex, address, password, password_confirmation
- [ ] Header displays clinic branding
- [ ] Login link displayed
- [ ] Submit button says "Continue to Email Verification"

#### Test 2.2: Client-Side Validation
**Test Case:** Submit form with empty fields
- [ ] Required fields show red error borders
- [ ] Error messages appear below each field
- [ ] "First name is required"
- [ ] "Last name is required"
- [ ] "Email address is required"
- [ ] "Contact number is required"
- [ ] "Date of birth is required"
- [ ] "Address is required"
- [ ] "Password is required"
- [ ] "Please confirm your password"

#### Test 2.3: Email Validation
- [ ] Valid email (juan@example.com) - passes
- [ ] Invalid email (juan@invalid) - shows error "Please enter a valid email address"
- [ ] Invalid email (juan@) - shows error

#### Test 2.4: Password Validation
- [ ] Password < 8 chars - shows error "Password must be at least 8 characters"
- [ ] Passwords don't match - shows error "Passwords do not match"
- [ ] Both password fields have visibility toggle (eye icon)

#### Test 2.5: Form Submission - Success
**Steps:**
1. Fill all fields with valid data
2. Click "Continue to Email Verification"
3. **Verify:**
   - [ ] Loading state shows "Processing..."
   - [ ] No validation errors
   - [ ] API call to /auth/patient/register made
   - [ ] Toast notification: "OTP sent successfully to your email"
   - [ ] Navigates to /auth/patient/verify-otp
   - [ ] Registration data passed via location.state

#### Test 2.6: OTP Verification Form - Render
- [ ] Page loads with clinic branding
- [ ] Email displayed (masked or full)
- [ ] OTP input field visible with placeholder "ABC1234"
- [ ] "Verify Email & Create Account" button
- [ ] Expiry timer shows countdown (10:00)
- [ ] Resend section present
- [ ] Troubleshooting tips displayed
- [ ] Back button works

#### Test 2.7: OTP Input
**Test Cases:**
- [ ] Only alphanumeric allowed (no special chars)
- [ ] Auto-uppercase (input "abc1234" → displays "ABC1234")
- [ ] Max 7 characters (cannot type more)
- [ ] Verify button disabled if OTP < 7 chars

#### Test 2.8: OTP Verification - Success
**Steps:**
1. Enter valid 7-char OTP
2. Click "Verify Email & Create Account"
3. **Verify:**
   - [ ] Loading state: "Verifying..."
   - [ ] API call to /auth/patient/verify-otp made
   - [ ] Toast: "Account created successfully"
   - [ ] Redirects to /auth/login after 1.5 seconds
   - [ ] Email pre-filled in login form

#### Test 2.9: OTP Verification - Error Cases
**Test Case 1: Invalid OTP**
- [ ] Enter wrong OTP
- [ ] Show error: "Invalid OTP. Please check the code sent to your email"
- [ ] OTP field still editable
- [ ] Can try again

**Test Case 2: Expired OTP**
- [ ] Wait for expiry timer to reach 0:00
- [ ] Verify button disabled
- [ ] Show error: "Code has expired. Please request a new one"
- [ ] Resend option enabled

**Test Case 3: Already Used OTP**
- [ ] Verify OTP once successfully
- [ ] Try to use same OTP again (new account with same email)
- [ ] Show error: "This OTP has already been used. Please request a new one"

#### Test 2.10: Resend OTP
**Steps:**
1. In OTP verification page, wait 60 seconds OR click "Resend OTP" immediately
2. **Verify within cooldown:**
   - [ ] "Resend OTP" button disabled
   - [ ] Countdown shows "Resend available in 1:00"
   - [ ] Cannot resend before cooldown
   - [ ] Toast: "Please wait 60 seconds before resending"

3. **Verify after cooldown:**
   - [ ] "Resend OTP" button enabled and clickable
   - [ ] Click "Resend OTP"
   - [ ] Loading state: "Resending..."
   - [ ] Toast: "New OTP sent to your email"
   - [ ] OTP input cleared
   - [ ] Expiry timer reset to 10:00
   - [ ] Cooldown restarts (60 seconds)
   - [ ] New OTP different from old one

#### Test 2.11: Timer Functionality
**10-Minute Expiry Timer:**
- [ ] Starts at 10:00
- [ ] Counts down every second
- [ ] Format: M:SS (9:59, 9:58, etc.)
- [ ] At 0:00, shows error and disables verify button

**1-Minute Resend Cooldown:**
- [ ] After resend, starts at 1:00
- [ ] Counts down every second
- [ ] At 0:00, "Resend OTP" button becomes clickable

#### Test 2.12: Navigation
- [ ] Back button goes to /auth/patient/register
- [ ] Can edit email by going back
- [ ] "Go back and edit" link works
- [ ] Successful verification redirects to login

---

### Phase 3: End-to-End Flow Testing

#### Test 3.1: Complete Happy Path
**Steps:**
1. Navigate to `/auth/patient/register`
2. Fill registration form with valid data
3. Submit form
4. Verify redirected to `/auth/patient/verify-otp`
5. Check email for OTP
6. Copy OTP and paste into form
7. Submit OTP
8. Verify redirected to login
9. Log in with registered email/password
10. Verify user is authenticated and has "patient" role

**Verify:**
- [ ] User record created with correct fields
- [ ] Patient record created with correct fields
- [ ] email_verified_at is set
- [ ] is_active is true
- [ ] User can access patient dashboard
- [ ] Audit logs record registration event

#### Test 3.2: Expired OTP Flow
**Steps:**
1. Register and get OTP
2. Wait for OTP to expire (10 minutes)
3. Try to verify with expired OTP
4. Verify error: "This OTP has expired"
5. Click "Resend OTP"
6. Get new OTP
7. Verify successfully

#### Test 3.3: Invalid OTP Attempts
**Steps:**
1. Register and get OTP
2. Enter wrong OTP 3 times
3. Show appropriate error each time
4. Request new OTP
5. Verify successfully with new OTP

#### Test 3.4: Duplicate Email Registration
**Steps:**
1. Register account with email: test@example.com
2. Verify and create account
3. Try to register again with same email
4. Show error: "Email address is already registered"
5. Redirect to login or show "Go to login" button

#### Test 3.5: Session State Persistence
**Steps:**
1. Start registration at `/auth/patient/register`
2. Fill form and submit
3. Redirected to `/auth/patient/verify-otp`
4. Refresh page (F5)
5. **Verify:**
   - [ ] Email still displayed
   - [ ] OTP timers preserved OR reset appropriately
   - [ ] Can still verify OTP

---

### Phase 4: Database Integrity Testing

#### Test 4.1: OTP Records
**Verify:**
- [ ] Each OTP record has: email, code (7 chars), is_used (bool), used_at (nullable datetime), expires_at (datetime)
- [ ] Indexes on email, code (unique), expires_at
- [ ] OTPs older than 10 minutes can be queried as expired
- [ ] Only latest OTP per email is active

#### Test 4.2: User & Patient Records
**Verify after successful verification:**
- [ ] User table: name, email, password (hashed), phone, date_of_birth, address, email_verified_at, is_active
- [ ] Patient table: user_id, date_of_birth, phone, address, sex, emergency_contact (JSON)
- [ ] User has role 'patient' (via roles table)
- [ ] User.email_verified_at is not null

#### Test 4.3: Data Consistency
**Verify:**
- [ ] User and Patient records match
- [ ] No orphaned records
- [ ] Timestamps (created_at, updated_at) are accurate
- [ ] OTP used_at timestamp is accurate

---

### Phase 5: Security Testing

#### Test 5.1: Password Security
- [ ] Passwords hashed (not plaintext) in database
- [ ] Minimum 8 characters enforced
- [ ] Both password fields required to match

#### Test 5.2: OTP Security
- [ ] OTP is 7 characters (sufficient entropy)
- [ ] OTP contains mix of uppercase, lowercase, numbers
- [ ] OTP is one-time use (marked as used after verification)
- [ ] OTP expires after 10 minutes
- [ ] Resend cooldown prevents brute force (1-minute wait)
- [ ] OTP not visible in URLs or logs (except backend logs)

#### Test 5.3: Email Verification
- [ ] User cannot log in until OTP verified
- [ ] email_verified_at only set after successful OTP verification
- [ ] Cannot access patient dashboard without verified email

#### Test 5.4: Rate Limiting
- [ ] Resend OTP enforces 1-minute cooldown
- [ ] Multiple resend attempts blocked during cooldown
- [ ] Wait time accurate and decrements properly

---

### Phase 6: Email Testing

#### Test 6.1: Email Delivery
**Verify:**
- [ ] Email received at registered address
- [ ] Email from: configured MAIL_FROM_ADDRESS
- [ ] Email subject line clear
- [ ] Email arrives within seconds

#### Test 6.2: Email Content
**Verify in received email:**
- [ ] Clinic branding/logo visible
- [ ] OTP code displayed prominently
- [ ] 10-minute expiry notice present
- [ ] Clear instructions how to verify
- [ ] Security warning about not sharing OTP
- [ ] Support contact information
- [ ] Professional formatting and styling

#### Test 6.3: Multiple OTPs
**Steps:**
1. Request registration
2. Get OTP 1
3. Request resend (after 1 minute)
4. Get OTP 2
5. **Verify:**
   - [ ] OTP 1 no longer works (marked as used)
   - [ ] OTP 2 works successfully
   - [ ] Both OTPs are different
   - [ ] Each email sent correctly

---

## Test Execution Checklist

### Setup
- [ ] Database migrated: `php artisan migrate --force`
- [ ] Laravel server running: `php artisan serve`
- [ ] React frontend running: `npm run dev`
- [ ] Mail service configured (Gmail SMTP)
- [ ] Test email account ready

### Phase 1 Execution
- [ ] All 7 backend API tests passed
- [ ] No database errors
- [ ] Responses match expected format

### Phase 2 Execution
- [ ] All 12 frontend UI tests passed
- [ ] No console errors
- [ ] Styling consistent across browsers

### Phase 3 Execution
- [ ] Complete flow works end-to-end
- [ ] No missing functionality
- [ ] Error handling appropriate

### Phase 4 Execution
- [ ] Database queries verified
- [ ] No data integrity issues
- [ ] All indexes working

### Phase 5 Execution
- [ ] Security best practices followed
- [ ] Rate limiting effective
- [ ] No vulnerabilities found

### Phase 6 Execution
- [ ] Email delivery confirmed
- [ ] Email content professional
- [ ] Multiple OTP test passed

---

## Test Results Summary

| Phase | Tests | Passed | Failed | Status |
|-------|-------|--------|--------|--------|
| 1: Backend API | 7 | ? | ? | ⏳ Pending |
| 2: Frontend UI | 12 | ? | ? | ⏳ Pending |
| 3: End-to-End | 5 | ? | ? | ⏳ Pending |
| 4: Database | 3 | ? | ? | ⏳ Pending |
| 5: Security | 4 | ? | ? | ⏳ Pending |
| 6: Email | 3 | ? | ? | ⏳ Pending |
| **TOTAL** | **34** | **?** | **?** | **⏳ Pending** |

---

## Known Issues / Notes

(To be filled during testing)

---

## Sign-Off

- [ ] All tests passed
- [ ] No critical issues
- [ ] Ready for production deployment

**Tested By:** ___________________  
**Date:** ___________________  
**Notes:** ___________________

---

## Troubleshooting Guide

### Email Not Arriving
1. Check `.env` MAIL_* settings
2. Verify Gmail app password (not regular password)
3. Allow "Less secure app access" if needed
4. Check spam/junk folder
5. Verify email address is correct

### OTP Not Generating
1. Check OTP table exists: `php artisan tinker` → `Schema::hasTable('otps')`
2. Verify RegistrationService has `generateOTP()` method
3. Check database connection in `.env`

### User Not Created After OTP Verification
1. Verify User model migration was run
2. Check Patient model migration was run
3. Verify user role assignment: `Spatie\Permission\Models\Role`
4. Check database transaction handling in RegistrationService

### Cooldown Not Working
1. Verify timestamps are being set correctly
2. Check timezone setting: `APP_TIMEZONE` in `.env`
3. Verify `now()` function is using correct timezone

### Frontend Routes Not Working
1. Verify routes added to `App.jsx`
2. Check component imports are correct
3. Verify file paths match
4. Clear browser cache (Ctrl+F5)

---

## Files Modified/Created

### Backend
- ✅ `backend/app/Models/OTP.php` - CREATED
- ✅ `backend/database/migrations/2026_09_05_000001_create_otps_table.php` - CREATED
- ✅ `backend/app/Services/RegistrationService.php` - CREATED
- ✅ `backend/app/Http/Requests/PatientRegistrationRequest.php` - CREATED
- ✅ `backend/app/Http/Requests/VerifyRegistrationOTPRequest.php` - CREATED
- ✅ `backend/app/Mail/SendOTPMail.php` - CREATED
- ✅ `backend/resources/views/emails/send-otp.blade.php` - CREATED
- ✅ `backend/app/Http/Controllers/Api/V1/AuthController.php` - MODIFIED (added 4 methods)
- ✅ `backend/routes/api.php` - MODIFIED (added 4 routes)

### Frontend
- ✅ `frontend/src/pages/auth/PatientRegistration.jsx` - CREATED
- ✅ `frontend/src/pages/auth/PatientOTPVerification.jsx` - CREATED
- ✅ `frontend/src/App.jsx` - MODIFIED (added 2 routes)

---

## Reference Information

### OTP Specifications
- **Length:** 7 characters
- **Character Set:** Uppercase A-Z, lowercase a-z, numbers 0-9
- **Validity:** 10 minutes (600 seconds)
- **One-Time Use:** Yes (marked as used after verification)
- **Resend Cooldown:** 1 minute (60 seconds)

### User Fields Collected
1. first_name (required)
2. last_name (required)
3. email (required, unique)
4. contact_number (required)
5. date_of_birth (required)
6. sex (optional: Male, Female, Other)
7. address (required)
8. password (required, min 8 chars)
9. password_confirmation (required, must match)

### Account Creation
- User role assigned: `patient`
- email_verified_at: Set to now() upon successful OTP verification
- is_active: Set to true
- Patient record created with all provided data

### API Response Format
**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "data": { }
}
```

---

**Last Updated:** 2026-09-05  
**Status:** Testing Checklist Created - Ready for Execution
