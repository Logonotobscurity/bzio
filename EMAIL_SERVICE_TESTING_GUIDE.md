# Email Service Setup & Testing Guide

## Quick Start

### 1. Verify Configuration
Your SMTP configuration is already set to port **465 with TLS encryption** (production-ready).

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USERNAME=resend
RESEND_API_KEY=re_your_key_here
```

---

## Testing Your Email Service

### Option 1: Test SMTP Connection (GET)

**Endpoint:** `GET /api/health/email`

**Command:**
```bash
# Test SMTP connection
curl http://localhost:3000/api/health/email
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "SMTP connection verified",
  "details": {
    "host": "smtp.resend.com",
    "port": 465,
    "secure": true,
    "timestamp": "2025-12-14T10:30:00.000Z"
  }
}
```

**Expected Response (Failure):**
```json
{
  "success": false,
  "message": "SMTP connection failed: Invalid API key",
  "details": {
    "host": "smtp.resend.com",
    "port": 465,
    "error": "Invalid API key"
  }
}
```

---

### Option 2: Send Test Email (POST)

**Endpoint:** `POST /api/health/email`

#### Development Mode (No Token Required)

```bash
# Send test email (development mode)
curl -X POST http://localhost:3000/api/health/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com"
  }'
```

#### Production Mode (Admin Token Required)

```bash
# Send test email with admin token
curl -X POST http://localhost:3000/api/health/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "adminToken": "your-admin-token"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test email sent to your-email@example.com"
}
```

---

## Environment Variables Setup

### Required Variables

```env
# REQUIRED: Resend API Key
RESEND_API_KEY=re_xxxxxxxxxxxxx

# REQUIRED: Email sender address
EMAIL_FROM="BZION <noreply@bzionshop.com>"

# OPTIONAL: SMTP Configuration (with defaults)
SMTP_HOST=smtp.resend.com                    # Default: smtp.resend.com
SMTP_PORT=465                                # Default: 465
SMTP_SECURE=true                             # Default: true (for port 465)
SMTP_USERNAME=resend                         # Default: resend
SMTP_TIMEOUT=5000                            # Default: 5000ms
```

### Optional: Admin Token for Test Endpoint

```env
# Only for production test email sending
ADMIN_EMAIL_TEST_TOKEN=your-secure-token
```

---

## Port Configuration Options

### ✅ Port 465 (Recommended - Your Current Setup)

```env
SMTP_PORT=465
SMTP_SECURE=true
```

**Features:**
- SSL/TLS encryption from connection start (implicit)
- Faster connection (no negotiation)
- Industry standard
- **Recommended for production**

### ✅ Port 587 (Alternative)

```env
SMTP_PORT=587
SMTP_SECURE=false
```

**Features:**
- STARTTLS encryption (explicit)
- More legacy system compatible
- Slightly slower (negotiation step)
- Good fallback option

### ❌ Other Ports (Not Recommended)

- **Port 25:** Unencrypted, for internal only
- **Port 2465:** Non-standard, rarely supported
- **Port 2587:** Non-standard, not supported

---

## Troubleshooting

### Issue 1: "RESEND_API_KEY not configured"

**Cause:** Missing API key

**Fix:**
1. Get your API key from https://resend.com/api-tokens
2. Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_your_actual_key
   ```
3. Restart dev server: `npm run dev`

### Issue 2: "Socket hang up" or Connection Timeout

**Cause:** Connection timeout or network issue

**Fix:**
```env
# Increase timeout
SMTP_TIMEOUT=10000    # 10 seconds
```

### Issue 3: "535 Authentication failed"

**Cause:** Invalid credentials

**Fix:**
1. Verify API key starts with `re_`
2. Check no extra spaces in `.env`
3. Make sure `SMTP_USERNAME=resend` is set

### Issue 4: "530 Must issue a STARTTLS command first"

**Cause:** Using wrong port/secure combination

**Fix:**
```env
# If using port 465:
SMTP_SECURE=true

# If using port 587:
SMTP_PORT=587
SMTP_SECURE=false
```

### Issue 5: "Certificate validation failed"

**Cause:** Production strict SSL verification

**Fix:**
```env
# This is automatic, but if needed:
NODE_ENV=development    # Temporarily for testing
```

---

## Email Functions Available

### Send Verification Email
```typescript
import { sendEmailVerificationEmail } from '@/lib/email-service';

await sendEmailVerificationEmail('user@example.com', 'token123');
```

### Send Password Reset
```typescript
import { sendPasswordResetEmail } from '@/lib/email-service';

await sendPasswordResetEmail('user@example.com', 'reset-token');
```

### Send Welcome Email
```typescript
import { sendWelcomeEmail } from '@/lib/email-service';

await sendWelcomeEmail('user@example.com', 'John');
```

### Send Test Email
```typescript
import { sendTestEmail } from '@/lib/email-service';

await sendTestEmail('user@example.com');
```

### Test SMTP Connection
```typescript
import { testSMTPConnection } from '@/lib/email-service';

const result = await testSMTPConnection();
console.log(result);  // { success: boolean, message: string, ... }
```

---

## Monitoring Email Delivery

### Resend Dashboard
1. Go to https://resend.com/emails
2. View all sent emails
3. Check delivery status
4. Monitor bounces/complaints
5. Review analytics

### Logs in Your Application
```bash
# Check console logs for email events
npm run dev

# Look for:
# ✅ Email sent: messageId-xxx
# ❌ Failed to send email: error message
```

---

## Integration Examples

### Email Verification Flow

```typescript
// src/app/api/auth/register/route.ts
import { sendEmailVerificationEmail } from '@/lib/email-service';
import { createVerificationToken } from '@/lib/email-verification';

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  // 1. Create user
  const user = await prisma.user.create({
    data: { email, passwordHash: hashedPassword, firstName: name }
  });

  // 2. Generate verification token
  const token = await createVerificationToken(user.id, email);

  // 3. Send verification email
  if (token) {
    await sendEmailVerificationEmail(email, token);
  }

  return Response.json({ success: true });
}
```

### Password Reset Flow

```typescript
// src/app/api/auth/forgot-password/route.ts
import { sendPasswordResetEmail } from '@/lib/email-service';

export async function POST(req: Request) {
  const { email } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

  // Create reset token
  const token = await createPasswordResetToken(user.id);

  // Send email
  await sendPasswordResetEmail(email, token);

  return Response.json({ success: true });
}
```

---

## Health Check Integration

### Add to Main Health Endpoint

```typescript
// src/app/api/health/route.ts
import { testSMTPConnection } from '@/lib/email-service';

export async function GET() {
  const database = await checkDatabase();
  const redis = await checkRedis();
  const email = await testSMTPConnection();

  return Response.json({
    status: 'ok',
    checks: {
      database: database.success,
      redis: redis.success,
      email: email.success,  // ✅ Add this
    }
  });
}
```

---

## Production Checklist

- [ ] API key is set in production environment
- [ ] EMAIL_FROM is configured with your domain
- [ ] SMTP settings are port 465 with secure: true
- [ ] Test email was successfully sent
- [ ] Monitor Resend dashboard for deliverability
- [ ] Set up bounce handling via webhooks
- [ ] Add rate limiting to email endpoints
- [ ] Log all email sending attempts
- [ ] Monitor failed email attempts
- [ ] Set up alerts for email failures

---

## Security Best Practices

✅ **Already Implemented:**
- API key in environment variables (not in code)
- TLS/SSL encryption (port 465)
- Secure token generation (crypto.randomBytes)
- Token hashing before storage
- Connection timeout settings

✅ **Also Configured:**
- Certificate verification in production
- Minimum TLS version 1.2
- Proper error handling without exposing details

---

## Performance Optimization

### Rate Limiting Emails
```typescript
// src/app/api/auth/register/route.ts
import { checkRateLimit } from '@/lib/ratelimit';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  
  const { success } = await checkRateLimit(ip, 'auth');
  if (!success) {
    return Response.json(
      { error: 'Too many registration attempts' },
      { status: 429 }
    );
  }

  // Continue with email sending...
}
```

### Batch Email Sending (Future)
When you reach high volume, consider:
1. Background job queue (Bull/Quirrel)
2. Batch sending via API
3. Email templates in database
4. Scheduled delivery optimization

---

## Useful Commands

```bash
# Test email connection from CLI
npm run dev
# Then in another terminal:
curl http://localhost:3000/api/health/email

# View logs
# Check your browser console and terminal

# Restart if config changes
npm run dev
```

---

## Next Steps

1. ✅ **Verify Configuration** - Run health check
2. ✅ **Send Test Email** - Use POST endpoint
3. ✅ **Monitor Dashboard** - Check Resend
4. ✅ **Integrate in Flows** - Use in registration, password reset
5. ✅ **Set Up Alerts** - Monitor failures

**You're all set!** Your email service is production-ready with proper TLS encryption on port 465.

