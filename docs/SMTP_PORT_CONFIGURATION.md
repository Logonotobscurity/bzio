# Email Service Port Configuration Guide

## SMTP Port Options for Encrypted Connections

Your current setup uses the **best practice** configuration for production.

### Port Comparison

| Port | Protocol | Encryption | Status | Use Case |
|------|----------|------------|--------|----------|
| **465** | SMTPS | SSL/TLS (Implicit) | ✅ **RECOMMENDED** | Production (your current) |
| **587** | SMTP | STARTTLS (Explicit) | ✅ **Alternative** | Legacy systems |
| **2465** | SMTPS | SSL/TLS (Alternative) | ⚠️ Rare | Some providers |
| **2587** | SMTP | STARTTLS (Alternative) | ⚠️ Rare | Non-standard |
| **25** | SMTP | None | ❌ **AVOID** | Internal only, insecure |

---

## Current Configuration (✅ Production Ready)

```typescript
// src/lib/email-service.ts
const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 465,          // ✅ SSL/TLS Implicit (Recommended)
  secure: true,       // ✅ Enable TLS encryption
  auth: {
    user: 'resend',   // ✅ Resend SMTP username
    pass: process.env.RESEND_API_KEY || '',
  },
});
```

### Why Port 465 with `secure: true` is Best:
1. **Implicit encryption** - TLS starts immediately
2. **Faster connection** - No negotiation overhead
3. **Industry standard** - Most providers recommend it
4. **Better security** - Cannot downgrade to unencrypted

---

## Alternative Configuration (Port 587 - STARTTLS)

If you ever need to switch to port 587:

```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 587,          // STARTTLS (Explicit)
  secure: false,      // Start unencrypted, then upgrade
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY || '',
  },
  tls: {
    rejectUnauthorized: true,  // Verify SSL certificate
  },
});
```

### Port 587 Characteristics:
- Explicit STARTTLS handshake
- Slightly slower (negotiation step)
- Better for older systems
- Should NOT be used for modern deployments

---

## Resend SMTP Specific Recommendations

### ✅ Resend Official Recommendations:

```env
# SMTP Settings
SMTP_HOST=smtp.resend.com
SMTP_PORT=465                    # ✅ Use this
SMTP_SECURE=true                 # ✅ Always true for port 465
SMTP_USERNAME=resend
SMTP_PASSWORD=your_api_key

# Alternative (NOT recommended for Resend)
# SMTP_PORT=587
# SMTP_SECURE=false
```

### Email Configuration Template:

```typescript
// src/lib/email-service.ts - Production Configuration
import nodemailer from 'nodemailer';

const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE !== 'false', // defaults to true
  auth: {
    user: process.env.SMTP_USERNAME || 'resend',
    pass: process.env.SMTP_PASSWORD || process.env.RESEND_API_KEY,
  },
  // Optional: TLS configuration
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
};

export const transporter = nodemailer.createTransport(emailConfig);
```

---

## Testing Your Configuration

### 1. **Connection Test**
```typescript
// Add to src/lib/email-service.ts
export async function testConnection() {
  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful');
    return { success: true };
  } catch (error) {
    console.error('❌ SMTP connection failed:', error);
    return { success: false, error };
  }
}

// In your API route: src/app/api/health/route.ts
import { testConnection } from '@/lib/email-service';

export async function GET() {
  const result = await testConnection();
  return Response.json(result);
}
```

### 2. **Send Test Email**
```typescript
// Create: src/app/api/test/send-email/route.ts
import { sendEmail } from '@/lib/email-service';

export async function POST(req: Request) {
  const { to } = await req.json();
  
  const success = await sendEmail({
    to,
    subject: 'Test Email',
    html: '<p>This is a test email from BZION</p>',
  });
  
  return Response.json({ success });
}
```

---

## Environment Variables for Different Ports

### Port 465 (SSL/TLS - Your Current Setup)
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USERNAME=resend
RESEND_API_KEY=re_your_key_here
EMAIL_FROM="BZION <noreply@bzionshop.com>"
```

### Port 587 (STARTTLS - Alternative)
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=resend
RESEND_API_KEY=re_your_key_here
EMAIL_FROM="BZION <noreply@bzionshop.com>"
```

### Port 2465/2587 (Non-Standard - NOT Recommended)
Not recommended for Resend. These are rarely used and not standard for major providers.

---

## Security Checklist

✅ **Current Setup Verification:**
- [x] Using port 465 (SSL/TLS Implicit)
- [x] `secure: true` enabled
- [x] Using nodemailer (tested library)
- [x] API key in environment variables
- [x] No plain text credentials in code

### Additional Security Improvements:
```typescript
// Add certificate verification for production
const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 465,
  secure: true,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY,
  },
  // Production security
  ...(process.env.NODE_ENV === 'production' && {
    tls: {
      rejectUnauthorized: true,  // Verify SSL cert
      minVersion: 'TLSv1.2',     // Minimum TLS version
    },
  }),
});
```

---

## Common Issues & Solutions

### Issue: "Socket hang up"
```
Cause: Connection timeout
Solution: Increase timeout
```
```typescript
const transporter = nodemailer.createTransport({
  // ... existing config
  connectionTimeout: 5000,
  socketTimeout: 10000,
});
```

### Issue: "ECONNREFUSED"
```
Cause: Wrong host/port combination
Solution: Verify Resend SMTP settings
- Host: smtp.resend.com ✅
- Port: 465 ✅
- Secure: true ✅
```

### Issue: "535 Authentication failed"
```
Cause: Invalid API key
Solution: 
1. Verify RESEND_API_KEY is set
2. Check it starts with: re_
3. Ensure no extra spaces in .env
```

---

## Monitoring & Logging

### Add Email Sending Metrics:
```typescript
// src/lib/email-service.ts - Enhanced
async function sendEmail(options: EmailOptions): Promise<boolean> {
  const startTime = Date.now();
  
  try {
    const result = await transporter.sendMail({
      from: emailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Email sent in ${duration}ms`, {
      messageId: result.messageId,
      to: options.to,
      subject: options.subject,
    });
    
    // Log to monitoring service
    // await logEmailMetric('sent', duration, options.to);
    
    return true;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Email failed after ${duration}ms:`, error);
    
    // Log to error tracking
    // await logEmailError(error, options.to);
    
    return false;
  }
}
```

---

## Summary

### ✅ Your Current Configuration
```
Port: 465 ✅
Encryption: TLS (secure: true) ✅
Status: Production Ready ✅
```

### ✅ Recommended Port Priority
1. **Port 465** (SSL/TLS) - Your current ✅
2. **Port 587** (STARTTLS) - Only if needed
3. **Avoid** - Ports 25, 2465, 2587 (non-standard)

### ✅ Next Steps
1. Test connection with `testConnection()` function
2. Monitor email delivery in Resend dashboard
3. Set up error alerting for failed emails
4. Add retry logic for transient failures

