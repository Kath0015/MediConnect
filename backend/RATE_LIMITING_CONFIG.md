# Rate Limiting Configuration

This document describes the rate limiting implementation to protect the MediConnect API from abuse and brute force attacks.

## Overview

Rate limiting is implemented using Laravel's built-in throttle middleware. Different limits are applied to sensitive endpoints based on security requirements.

## Rate Limit Configuration

### Public Endpoints (Unauthenticated)

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| `POST /api/auth/login` | 5 requests | 1 minute | Prevent brute force login attempts |
| `POST /api/auth/register` | 3 requests | 1 minute | Prevent registration spam |
| `POST /api/auth/forgot-password` | 3 requests | 5 minutes | Prevent password reset abuse |
| `POST /api/auth/reset-password` | 3 requests | 5 minutes | Prevent mass password reset attempts |
| `POST /api/auth/send-otp` | 5 requests | 1 minute | Prevent OTP spam |
| `POST /api/auth/verify-otp` | 5 requests | 1 minute | Prevent OTP brute force |
| `POST /api/auth/patient/register` | 5 requests | 1 minute | Prevent registration spam |
| `POST /api/auth/patient/verify-otp` | 5 requests | 1 minute | Prevent OTP brute force |
| `POST /api/auth/patient/resend-otp` | 3 requests | 5 minutes | Prevent OTP resend spam |

### Protected Endpoints (Authenticated)

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| All authenticated endpoints | 300 requests | 1 minute | General API rate limit per user |

## How It Works

- **IP-based limiting**: Public endpoints are rate limited by IP address
- **User-based limiting**: Authenticated endpoints are rate limited per authenticated user
- **Window-based**: Limits reset after the specified time window expires
- **Response code**: Returns HTTP 429 (Too Many Requests) when limit is exceeded

## Example Error Response

When rate limit is exceeded:

```json
{
    "success": false,
    "message": "Too many requests. Please try again in 45 seconds.",
    "retry_after": 45
}
```

Response headers include:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1694067890
```

## Configuration

Rate limits are configured in `/routes/api.php` using the `throttle` middleware:

```php
Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1'); // 5 requests per 1 minute
```

Format: `throttle:requests,minutes`

## Monitoring

To monitor rate limiting in your application:

1. Check application logs for HTTP 429 responses
2. Monitor database cache hits for rate limit keys
3. Review suspicious IP addresses making repeated requests

## Development/Testing

To disable rate limiting in development:

Add to your `.env` file:
```
RATE_LIMITING_ENABLED=false
```

Then create a middleware to conditionally apply limits:

```php
if (!config('app.rate_limiting_enabled', true)) {
    return $next($request);
}
```

## Security Considerations

1. **Account Lockout**: After 5 failed login attempts, users must wait 1 minute
2. **Password Reset Abuse**: Limited to 3 requests per 5 minutes to prevent spam
3. **OTP Attacks**: Limited to 5 verification attempts per minute
4. **General API Abuse**: Authenticated users limited to 300 requests per minute

## Adjusting Limits

To adjust rate limits:

1. Edit `/routes/api.php`
2. Change the `throttle` parameter (e.g., `throttle:10,1` for 10 requests per minute)
3. Redeploy the application
4. No database migrations needed

## Future Enhancements

- [ ] Dynamic rate limits based on user subscription tier
- [ ] Whitelist/blacklist for specific IPs
- [ ] Per-endpoint fine-tuning based on usage patterns
- [ ] Rate limit alerts for suspicious activity
- [ ] Graduated response (warnings before blocking)
