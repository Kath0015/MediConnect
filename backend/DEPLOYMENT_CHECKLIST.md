# MediConnect Production Deployment Checklist

Use this checklist to ensure all critical components are configured before deploying to production.

## Pre-Deployment (Development Environment)

- [ ] All tests passing locally (`composer test`)
- [ ] No uncommitted changes in git
- [ ] Migrations are tested and reversible
- [ ] Email templates are reviewed and branded
- [ ] All TODOs and FIXMEs resolved
- [ ] Third-party API credentials obtained (mail, AWS S3, etc.)
- [ ] SSL certificates purchased/generated
- [ ] Domain name configured and DNS updated
- [ ] Database backup strategy planned

## Server Setup

- [ ] Linux server with 2GB+ RAM recommended
- [ ] PHP 8.2+ installed
- [ ] Composer installed globally
- [ ] MySQL 8.0+ or PostgreSQL 12+ installed
- [ ] Redis installed (for caching and queue)
- [ ] Nginx or Apache configured
- [ ] SSL certificates installed
- [ ] Firewall configured (allow ports 80, 443 only)
- [ ] SSH key-based authentication enabled (no password)
- [ ] Server time synchronized (NTP)
- [ ] Logrotate configured for log files

## Code Deployment

- [ ] Clone repository to production server
- [ ] Switch to production branch
- [ ] Run `composer install --no-dev --optimize-autoloader`
- [ ] Run `npm install && npm run build` (if frontend in same repo)
- [ ] Set file permissions: `chown -R www-data:www-data .`
- [ ] Set storage permissions: `chmod -R 775 storage bootstrap/cache`

## Environment Configuration

- [ ] Copy `.env.production` to `.env`
- [ ] Generate new APP_KEY: `php artisan key:generate`
- [ ] Set FRONTEND_URL correctly
- [ ] Configure SANCTUM_STATEFUL_DOMAINS
- [ ] Configure database connection
- [ ] Configure mail settings
- [ ] Configure AWS S3 credentials
- [ ] Configure Redis connection
- [ ] Test environment variables: `php artisan env`
- [ ] Review all .env values for production readiness

## Database Setup

- [ ] Create production database
- [ ] Create dedicated database user (not root)
- [ ] Run migrations: `php artisan migrate --force`
- [ ] Verify all tables created: `php artisan tinker` → `DB::select('SHOW TABLES');`
- [ ] Test database connection from application
- [ ] Backup empty production database
- [ ] Enable automated backups (daily minimum)
- [ ] Test backup restoration procedure

## Caching & Performance

- [ ] Cache configuration: `php artisan config:cache`
- [ ] Route caching: `php artisan route:cache`
- [ ] View caching: `php artisan view:cache`
- [ ] Clear all caches: `php artisan cache:clear`
- [ ] Verify Redis connection
- [ ] Configure queue worker: `supervisor` or similar
- [ ] Set up queue job monitoring

## Mail Configuration

- [ ] Test mail configuration: `php artisan tinker` → `Mail::raw('Test', fn($m) => $m->to('test@example.com'));`
- [ ] Verify sender email is configured
- [ ] Test appointment confirmation email
- [ ] Test password reset email
- [ ] Test error notification emails
- [ ] Set up email templates with production domain
- [ ] Configure email retry logic

## Authentication & Security

- [ ] Verify password reset endpoint works
- [ ] Verify OTP registration works
- [ ] Verify rate limiting is enabled
- [ ] Test login with rate limiting
- [ ] Test password reset rate limiting
- [ ] Verify CORS is restricted to frontend domain
- [ ] Test cross-origin requests from different domain (should fail)
- [ ] Enable HTTPS/SSL enforcement
- [ ] Set secure headers (HSTS, CSP, etc.)
- [ ] Verify CSRF protection is active

## File Storage

- [ ] Create S3 bucket (if using AWS)
- [ ] Configure S3 bucket policies
- [ ] Test file upload functionality
- [ ] Test file download functionality
- [ ] Verify files are not publicly accessible if they shouldn't be
- [ ] Configure S3 versioning for rollback capability
- [ ] Set up S3 lifecycle policies (delete old files)

## Logging & Monitoring

- [ ] Configure log channel (file or centralized logging)
- [ ] Set log level to `warning` in production
- [ ] Test error logging
- [ ] Set up log rotation
- [ ] Configure server monitoring (CPU, memory, disk)
- [ ] Set up email alerts for critical errors
- [ ] Configure application performance monitoring (optional)
- [ ] Enable Laravel Telescope in debug mode only

## API Rate Limiting

- [ ] Verify rate limiting is configured on:
  - [ ] POST /api/auth/login (5 per minute)
  - [ ] POST /api/auth/forgot-password (3 per 5 minutes)
  - [ ] POST /api/auth/reset-password (3 per 5 minutes)
  - [ ] POST /api/auth/patient/register (5 per minute)
  - [ ] POST /api/auth/patient/verify-otp (5 per minute)
- [ ] Test rate limiting with curl/Postman
- [ ] Verify 429 response when limit exceeded
- [ ] Test rate limit headers in response

## Frontend Integration

- [ ] Frontend can connect to API
- [ ] Login/logout works
- [ ] Password reset flow works (email → reset → login)
- [ ] Appointment booking works
- [ ] File uploads work
- [ ] Messaging works
- [ ] Notifications work
- [ ] All forms submit successfully
- [ ] Error messages display correctly
- [ ] Loading states display

## Data Integrity

- [ ] Run database consistency checks
- [ ] Verify foreign key constraints
- [ ] Test cascade delete operations
- [ ] Verify audit logs are recording
- [ ] Check for orphaned records
- [ ] Backup before making any data changes
- [ ] Document manual interventions

## Performance Testing

- [ ] Load test with 100+ concurrent users
- [ ] Verify response times < 2 seconds
- [ ] Monitor database query performance
- [ ] Verify memory usage doesn't increase indefinitely
- [ ] Check for N+1 query problems
- [ ] Enable query optimization: `php artisan model:prune`

## Documentation

- [ ] Create deployment runbook
- [ ] Document emergency procedures
- [ ] Create rollback procedure
- [ ] Document database backup/restore
- [ ] Create admin account with strong password
- [ ] Distribute emergency contact information
- [ ] Create architecture diagram

## Go-Live

- [ ] Announce maintenance window to users
- [ ] Take application into maintenance mode: `php artisan down`
- [ ] Final database backup
- [ ] Perform final code deployment
- [ ] Run final migrations if needed
- [ ] Test critical user flows
- [ ] Monitor error logs closely
- [ ] Enable application: `php artisan up`
- [ ] Announce application is live
- [ ] Monitor for first hour for issues

## Post-Deployment (First 24 Hours)

- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Monitor user feedback channels
- [ ] Check email delivery
- [ ] Verify notifications are being sent
- [ ] Test core workflows with actual data
- [ ] Verify backups are running
- [ ] Test admin dashboard
- [ ] Verify report generation
- [ ] Check for any console errors in browser

## Post-Deployment (First Week)

- [ ] Review security logs
- [ ] Verify all scheduled jobs are running
- [ ] Monitor database growth
- [ ] Check cache hit rates
- [ ] Verify queue jobs are processing
- [ ] Review performance metrics
- [ ] Collect user feedback
- [ ] Make performance adjustments if needed
- [ ] Update runbook with lessons learned

## Ongoing Maintenance

- [ ] Weekly backup verification
- [ ] Monthly security updates
- [ ] Monthly database optimization
- [ ] Quarterly code reviews
- [ ] Semi-annual disaster recovery drills
- [ ] Update dependencies quarterly
- [ ] Monitor storage usage
- [ ] Archive old logs
- [ ] Document all changes

## Critical Contacts

- [ ] Database Administrator: ________________
- [ ] DevOps/Infrastructure: ________________
- [ ] Application Owner: ________________
- [ ] On-Call Support: ________________

## Notes

```
Use this section to document any special conditions or custom configurations
for your deployment.

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

## Sign-Off

- [ ] Technical Lead: __________________ Date: __________
- [ ] DevOps Engineer: __________________ Date: __________
- [ ] Product Owner: __________________ Date: __________

---

**Document Version**: 1.0  
**Last Updated**: September 6, 2026  
**Next Review**: Before first production deployment
