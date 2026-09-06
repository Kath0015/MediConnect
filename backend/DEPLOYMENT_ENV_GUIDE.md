# Environment Configuration Guide for Production Deployment

This guide covers all environment variables needed to deploy MediConnect to production.

## Quick Start

1. Copy `.env.production` to `.env` on your production server
2. Update all values marked with `YOUR_*` or similar placeholders
3. Run database migrations: `php artisan migrate --force`
4. Clear configuration cache: `php artisan config:cache`

## Critical Environment Variables

### 1. Application Key (APP_KEY)
**Required**: YES | **Security**: CRITICAL

```bash
# Generate a new key on production server
php artisan key:generate --show

# Output: base64:xxxxxxxxxxxx
# Copy the output and set as APP_KEY in .env
```

**Why**: This key encrypts all sensitive data in the database (passwords, OTP tokens, etc.)

### 2. Frontend URL (FRONTEND_URL)
**Required**: YES | **Security**: HIGH

```env
# Development
FRONTEND_URL=http://localhost:5173

# Production
FRONTEND_URL=https://www.yourdomain.com
```

**Why**: Used in password reset links and email templates

### 3. Sanctum Stateful Domains (SANCTUM_STATEFUL_DOMAINS)
**Required**: YES | **Security**: CRITICAL

```env
# These are the ONLY domains allowed to make authenticated API requests
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com,api.yourdomain.com
```

**Why**: Prevents CSRF attacks by only allowing requests from trusted domains

**Format**: Comma-separated list, no protocol (http/https)

### 4. Database Configuration
**Required**: YES | **Security**: CRITICAL

```env
DB_HOST=your-database-host
DB_DATABASE=mediconnect_production
DB_USERNAME=mediconnect_user
DB_PASSWORD=VERY_SECURE_PASSWORD_HERE
```

**Security Tips**:
- Use a strong, randomly generated password (40+ characters recommended)
- Create a dedicated database user with limited privileges
- Never use `root` as the database user
- Use environment-specific databases (dev, staging, prod)

### 5. Mail Configuration
**Required**: YES | **Security**: MEDIUM

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=clinic-email@gmail.com
MAIL_PASSWORD=app-specific-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=clinic-email@gmail.com
MAIL_FROM_NAME="MediConnect - Your Clinic Name"
```

**Gmail Setup**:
1. Enable 2-Factor Authentication on Gmail account
2. Generate App Password (not your regular password)
3. Use App Password in MAIL_PASSWORD

**Alternative Email Providers**:
- SendGrid: `MAIL_HOST=smtp.sendgrid.net`, `MAIL_USERNAME=apikey`, `MAIL_PASSWORD=your-api-key`
- AWS SES: Requires additional AWS configuration
- Mailgun: `MAIL_HOST=smtp.mailgun.org`, requires API key

### 6. File Storage (S3 for Production)
**Required**: YES (for production) | **Security**: HIGH

```env
FILESYSTEM_DISK=s3

AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=mediconnect-files
AWS_URL=https://mediconnect-files.s3.us-east-1.amazonaws.com
```

**Why S3**: 
- Scalable file storage
- CDN integration for fast downloads
- Backup and disaster recovery
- Separate from application server

**Setup**:
1. Create S3 bucket in AWS
2. Create IAM user with S3 access
3. Generate access keys for IAM user
4. Set bucket policies for public/private access as needed

### 7. Cache & Queue Configuration
**Required**: YES | **Security**: MEDIUM

#### Using Redis (Recommended for Production):
```env
CACHE_STORE=redis
QUEUE_CONNECTION=database  # or redis
SESSION_DRIVER=cookie

REDIS_HOST=your-redis-host
REDIS_PASSWORD=redis-password
REDIS_PORT=6379
```

#### Using File-based (Development only):
```env
CACHE_STORE=file
QUEUE_CONNECTION=database
SESSION_DRIVER=file
```

**Why Redis**: Better performance, distributed caching, session sharing across servers

## Environment-Specific Configurations

### Development (.env)
```env
APP_ENV=local
APP_DEBUG=true
LOG_LEVEL=debug
CACHE_STORE=file
QUEUE_CONNECTION=sync
```

### Staging (.env.staging)
```env
APP_ENV=staging
APP_DEBUG=false
LOG_LEVEL=warning
CACHE_STORE=redis
QUEUE_CONNECTION=database
```

### Production (.env or from .env.production)
```env
APP_ENV=production
APP_DEBUG=false
LOG_LEVEL=warning
CACHE_STORE=redis
QUEUE_CONNECTION=database
```

## Security Checklist

- [ ] APP_DEBUG is set to `false` in production
- [ ] APP_KEY is a unique, strong value generated with `key:generate`
- [ ] Database password is 40+ characters, randomly generated
- [ ] All passwords use environment variables (never hardcoded)
- [ ] SANCTUM_STATEFUL_DOMAINS only includes your actual domain
- [ ] FRONTEND_URL points to your production frontend domain
- [ ] Mail credentials use app-specific passwords (not account passwords)
- [ ] SSL certificates are valid (HTTPS only, no HTTP)
- [ ] Environment file (.env) is not committed to git
- [ ] .env file permissions are restricted (644 or less)

## Post-Deployment Steps

After setting environment variables:

```bash
# 1. Clear all caches
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 2. Run database migrations
php artisan migrate --force

# 3. Seed initial data if needed
php artisan db:seed --class=DatabaseSeeder

# 4. Generate app key (if not already done)
php artisan key:generate

# 5. Test email configuration
php artisan tinker
# Then run: Mail::raw('Test', fn($m) => $m->to('test@example.com'));

# 6. Test database connection
php artisan tinker
# Then run: DB::connection()->getPdo();
```

## Troubleshooting

### "CORS policy: No 'Access-Control-Allow-Origin' header"
- **Cause**: SANCTUM_STATEFUL_DOMAINS not set correctly
- **Fix**: Check that your frontend domain is listed exactly (including subdomains)

### "Unauthenticated" on all API requests
- **Cause**: Session domain mismatch
- **Fix**: Verify SANCTUM_STATEFUL_DOMAINS includes your domain without protocol

### "Swift_TransportException" or "SMTP Error"
- **Cause**: Mail configuration incorrect
- **Fix**: Test credentials separately, check firewall rules for port 587

### "No such file or directory" on file uploads
- **Cause**: Storage driver misconfigured
- **Fix**: Ensure S3 credentials are correct or local storage is writable

## Monitoring Environment Variables

Monitor these in production:

```bash
# View app environment
php artisan env

# Check configuration
php artisan config:show

# Verify database connection
php artisan tinker
DB::connection()->getPdo();
```

## References

- [Laravel Environment Documentation](https://laravel.com/docs/configuration#environment-configuration)
- [Sanctum CORS Documentation](https://laravel.com/docs/sanctum#cors-and-stateful-requests)
- [AWS S3 Setup Guide](https://docs.aws.amazon.com/s3/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
