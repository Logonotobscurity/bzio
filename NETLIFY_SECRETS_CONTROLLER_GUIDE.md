# Netlify Secrets Controller Implementation Guide

**Last Updated:** December 19, 2025  
**Status:** Ready for Implementation  
**Environment:** Production (Netlify)

---

## Overview

This guide implements Netlify's **Secrets Controller** to securely manage sensitive environment variables. All secrets will be stored in Netlify UI and encrypted, preventing exposure in Git repositories or build logs.

---

## PART 1: Secrets Inventory

### Secrets to be Protected (Mark as "Contains secret values" in Netlify)

| Variable Name | Purpose | Current Location | Type | Priority |
|---|---|---|---|---|
| `NEXTAUTH_SECRET` | NextAuth.js JWT signing key | `.env.production` (placeholder) | Secret | **CRITICAL** |
| `NEXTAUTH_URL` | NextAuth callback URL | Code/`.env.production` | Public | HIGH |
| `DATABASE_URL` | PostgreSQL connection string | `.env.production` (placeholder) | Secret | **CRITICAL** |
| `EMAIL_SERVER_PASSWORD` | Resend SMTP API key | `.env.production` (placeholder) | Secret | **CRITICAL** |
| `UPSTASH_REDIS_REST_TOKEN` | Redis authentication token | `.env.production` (placeholder) | Secret | **CRITICAL** |

### Non-Secret Variables (Safe to commit / use in code)

| Variable Name | Value | Type | Location |
|---|---|---|---|
| `EMAIL_SERVER_HOST` | `smtp.resend.com` | Public | `.env.production` |
| `EMAIL_SERVER_PORT` | `587` | Public | `.env.production` |
| `EMAIL_SERVER_USER` | `resend` | Public | `.env.production` |
| `EMAIL_FROM` | `BZION <noreply@bzion.shop>` | Public | `.env.production` |
| `NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE` | `+2347010326015` | Public | `.env.production` |
| `WHATSAPP_BUSINESS_NUMBER` | `+2347010326015` | Public | `.env.production` |
| `WHATSAPP_BUSINESS_URL` | `https://wa.me/message/TOVLTP6EMAWNI1` | Public | `.env.production` |
| `NEXT_PUBLIC_APP_VERSION` | `1.0.0` | Public | `.env.production` |
| `DATA_SOURCE` | `static` | Public | `.env.production` |
| `NODE_ENV` | `production` | Public | `netlify.toml` |
| `NODE_VERSION` | `20` | Public | `netlify.toml` |

---

## PART 2: Codebase Usage Summary

### Where Secrets Are Used

#### 1. **Authentication** (`src/lib/auth/config.ts`)
```typescript
// Lines 63-67: NextAuth Email Provider
providers: [
  Email({
    server: {
      host: process.env.EMAIL_SERVER_HOST,          // Public
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),  // Public
      auth: {
        user: process.env.EMAIL_SERVER_USER,        // Public
        pass: process.env.EMAIL_SERVER_PASSWORD,    // ⚠️ SECRET
      },
    },
    from: process.env.EMAIL_FROM,                   // Public
  }),
]
```
✅ **Status:** Correctly accessing via `process.env`

#### 2. **Database** (`src/lib/db/index.ts`)
```typescript
connectionString: process.env.DATABASE_URL!  // ⚠️ SECRET
```
✅ **Status:** Correctly accessing via `process.env`

#### 3. **Email Service** (`src/lib/email-service.ts`)
```typescript
pass: process.env.RESEND_API_KEY || ''  // ⚠️ SECRET (line 37)
if (!process.env.RESEND_API_KEY) {       // Validation (line 122)
  console.error('❌ RESEND_API_KEY not configured...');
}
```
✅ **Status:** Correctly accessing via `process.env`  
⚠️ **Note:** Ensure RESEND_API_KEY is in Netlify, not committed to repo

#### 4. **Rate Limiting** (`src/lib/ratelimit.ts`)
```typescript
const url = process.env.UPSTASH_REDIS_REST_URL;    // Public
const token = process.env.UPSTASH_REDIS_REST_TOKEN;  // ⚠️ SECRET
```
✅ **Status:** Correctly accessing via `process.env`

#### 5. **Caching** (`src/lib/cache.ts`)
```typescript
const url = process.env.UPSTASH_REDIS_REST_URL;    // Public
const token = process.env.UPSTASH_REDIS_REST_TOKEN;  // ⚠️ SECRET
```
✅ **Status:** Correctly accessing via `process.env`

#### 6. **Email API** (`src/lib/api/email.ts`)
```typescript
return new ResendClass(process.env.RESEND_API_KEY);  // ⚠️ SECRET
```
✅ **Status:** Correctly accessing via `process.env`

---

## PART 3: Step-by-Step Implementation

### Step 1: Clean Up Repository Files ✅

**Files to Clean (Remove actual secrets):**
- ✅ `.env.production` - Already using placeholders
- ✅ `.env.example` - Template only
- ✅ `.env.local.example` - Template only
- ✅ `netlify.toml` - No secrets hardcoded

**Action:** No changes needed - all files already follow security best practices!

### Step 2: Create Variables in Netlify UI 🔧

**Navigate to:**
1. Go to https://app.netlify.com
2. Select your site: **bzionshopfmcg**
3. Click **Site configuration** (or **Project configuration**)
4. Go to **Build & Deploy** → **Environment**
5. Click **Add variable** for each entry below

**Add the following environment variables:**

#### Production Context Variables

| Variable | Value | Mark as Secret? | Notes |
|---|---|---|---|
| `NEXTAUTH_URL` | `https://bzionshopfmcg.netlify.app` | ❌ No | Netlify URL |
| `NEXTAUTH_SECRET` | `[Your 32+ char random string]` | ✅ **YES** | Generate: `openssl rand -hex 32` |
| `DATABASE_URL` | `[Your PostgreSQL connection string]` | ✅ **YES** | Format: `postgres://user:pass@host:port/db?sslmode=require` |
| `EMAIL_SERVER_PASSWORD` | `[Your Resend API key]` | ✅ **YES** | Same as RESEND_API_KEY |
| `UPSTASH_REDIS_REST_TOKEN` | `[Your Upstash token]` | ✅ **YES** | From https://console.upstash.com |
| `EMAIL_SERVER_HOST` | `smtp.resend.com` | ❌ No | Public |
| `EMAIL_SERVER_PORT` | `587` | ❌ No | Public |
| `EMAIL_SERVER_USER` | `resend` | ❌ No | Public |
| `EMAIL_FROM` | `BZION <noreply@bzion.shop>` | ❌ No | Public |
| `UPSTASH_REDIS_REST_URL` | `https://quality-slug-43912.upstash.io` | ❌ No | Public (already in `.env.production`) |
| `NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE` | `+2347010326015` | ❌ No | Public |
| `WHATSAPP_BUSINESS_NUMBER` | `+2347010326015` | ❌ No | Public |
| `NODE_ENV` | `production` | ❌ No | Public |
| `NODE_VERSION` | `20` | ❌ No | Public |

### Step 3: Mark Secrets ✅

**For each secret variable (those with ✅):**
1. After adding the variable, click **Edit**
2. Enable **"Contains secret values"** toggle
3. Click **Save**

**This enables:**
- ✅ Netlify secret scanning on build output
- ✅ Automatic masking in logs/UI
- ✅ Restricted access (only production builds see raw value)

### Step 4: Deploy & Verify 🚀

**Before deploying:**

1. **Verify local `.env` files:**
   ```bash
   # Ensure no real secrets in version control
   git status
   git diff .env.production  # Should show no secrets
   ```

2. **Verify `.gitignore`:**
   ```bash
   cat .gitignore | grep -E "\.env|\.local"
   # Should output:
   # .env.local
   # .env.*.local
   ```

3. **Trigger a production deploy:**
   ```bash
   git push origin main
   # Or manually: netlify deploy --prod
   ```

4. **Monitor build logs:**
   - Go to Netlify → **Deploys** → click latest deploy
   - Verify secrets appear as `***` in logs
   - Check for secret scanning warnings

---

## PART 4: Local Development Setup

### For Local Testing (`.env.local`)

**Create `.env.local` file:**
```dotenv
# =====================
# LOCAL DEVELOPMENT
# =====================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_local_secret_min_32_chars_for_testing
DATABASE_URL=postgres://user:pass@localhost:5432/bzion_dev
EMAIL_SERVER_PASSWORD=your_local_resend_api_key_or_test_value
UPSTASH_REDIS_REST_URL=https://your-upstash-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_local_upstash_token_or_test_value

# Public vars (same as production)
EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=resend
EMAIL_FROM=BZION Dev <dev@localhost>
NODE_ENV=development
```

**Important:**
- ⚠️ **Never commit `.env.local`** - it's in `.gitignore`
- Use fake/test values for development
- When pulling production changes, secrets come from Netlify, not `.env.local`

---

## PART 5: Security Verification Checklist

### Before Production Deployment ✅

- [ ] All 5 critical secrets added to Netlify UI
- [ ] All 5 secrets marked with **"Contains secret values"** toggle
- [ ] No real secrets in `.env.production` (all placeholders)
- [ ] No secrets in `netlify.toml` (only references)
- [ ] `.gitignore` includes `.env.local` and `.env.*.local`
- [ ] All code uses `process.env.VARIABLE_NAME` (verified below)
- [ ] No secrets hardcoded in source files
- [ ] No secrets in build output or logs (verify in Netlify build logs)
- [ ] Netlify secret scanning enabled and passing

### Code Audit Results ✅

**All secrets correctly accessed via `process.env`:**

```
✅ src/lib/auth/config.ts           - EMAIL_SERVER_PASSWORD, etc.
✅ src/lib/db/index.ts             - DATABASE_URL
✅ src/lib/email-service.ts        - RESEND_API_KEY
✅ src/lib/ratelimit.ts            - UPSTASH_REDIS_REST_TOKEN
✅ src/lib/cache.ts                - UPSTASH_REDIS_REST_TOKEN
✅ src/lib/api/email.ts            - RESEND_API_KEY
```

---

## PART 6: Troubleshooting

### Issue: Build fails with "Secret detected"
**Solution:**
- Check build logs for the file/line containing the secret
- Remove hardcoded value from source code
- Ensure you're using `process.env.VARIABLE_NAME`
- Redeploy

### Issue: Environment variables not available during build
**Solution:**
1. Verify variables added in **Project configuration** → **Environment**
2. Verify variable names match exactly (case-sensitive)
3. Check that you haven't overridden in `.netlify.toml`
4. Redeploy with `netlify deploy --prod --build`

### Issue: Secrets visible in Netlify UI
**Solution:**
- This is expected for **dev** context
- For **production** context, secrets should show as `***`
- If showing plaintext: verify **"Contains secret values"** is enabled

### Issue: Local tests fail - can't read secrets
**Solution:**
- Create `.env.local` file with test values
- Never use production secrets locally
- Use mock/fake credentials for testing

---

## PART 7: Deployment Context Configuration

### Production Context (Netlify UI)
- **All 5 critical secrets:** Encrypted, masked in logs
- **Non-secrets:** Visible in UI, plain in build output

### Deploy Preview Context
- Same as production (secrets encrypted)
- Used for pull request previews

### Branch Deploy Context
- Same as production (secrets encrypted)
- Used for branch deployments

### Dev Context (Local)
- Secrets shown in CLI (for development convenience)
- Use `.env.local` for local values

---

## PART 8: Next Steps

1. **Generate NEXTAUTH_SECRET** (if needed):
   ```bash
   openssl rand -hex 32
   # Output: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p (example)
   ```

2. **Gather secrets:**
   - PostgreSQL DATABASE_URL
   - Resend API key (EMAIL_SERVER_PASSWORD)
   - Upstash Redis token (UPSTASH_REDIS_REST_TOKEN)

3. **Login to Netlify** and add variables via UI (see Part 3, Step 2)

4. **Deploy:**
   ```bash
   git push origin main
   # Monitor: netlify site:ci-status
   ```

5. **Verify:**
   - Check Netlify build logs
   - Confirm secrets masked with `***`
   - Test deployed application

---

## PART 9: References

- [Netlify Secrets Controller](https://docs.netlify.com/build/environment-variables/secrets-controller/)
- [Netlify Environment Variables Get Started](https://docs.netlify.com/build/environment-variables/get-started/)
- [Netlify Secret Scanning](https://docs.netlify.com/build/environment-variables/secrets-controller/#configure-secrets-scanning)
- [NextAuth.js Security](https://next-auth.js.org/getting-started/deployment)
- [Best Practices: 12 Factor App](https://12factor.net/config)

---

## Appendix: Quick Reference

### Critical Secrets (5 total)
```
1. NEXTAUTH_SECRET       ← Generate new value
2. NEXTAUTH_URL          ← https://bzionshopfmcg.netlify.app
3. DATABASE_URL          ← PostgreSQL connection
4. EMAIL_SERVER_PASSWORD ← Resend API key
5. UPSTASH_REDIS_REST_TOKEN ← Redis token
```

### Status: ✅ Code is already secure
- All secrets accessed via `process.env`
- No hardcoded secrets in source
- `.env` files contain only placeholders
- Ready for Netlify UI configuration

### Once in Netlify UI:
- Netlify automatically injects during build
- Secret scanning prevents exposure
- Builds fail if secret detected in output
- Only production builds see unmasked values
