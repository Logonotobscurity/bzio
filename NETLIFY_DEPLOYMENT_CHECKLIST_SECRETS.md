# Netlify Secrets Controller: Production Deployment Checklist

**Last Updated:** December 19, 2025  
**Deployment Target:** https://bzionshopfmcg.netlify.app  
**Status:** Ready for Implementation

---

## Pre-Deployment Phase ✅

### Code Review

- [x] Security audit completed - PASSED
- [x] All secrets use `process.env`
- [x] No hardcoded credentials in code
- [x] `.env` files contain only placeholders
- [x] `netlify.toml` has no secrets
- [x] `.gitignore` includes `.env.local` files
- [x] Documentation created and reviewed

### Local Testing

- [ ] Clone repository locally
- [ ] Create `.env.local` with test values
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Test authentication flow
- [ ] Test email sending (optional)
- [ ] Test database connectivity
- [ ] Confirm no build errors

### Repository

- [ ] No actual secrets committed to Git
- [ ] Run `git log --diff-filter=D --summary | grep delete` to verify
- [ ] Recent commits reviewed for accidental secrets
- [ ] `.gitignore` properly configured

---

## Phase 1: Gather Production Secrets ⏳

### Required Secrets to Collect

**Before accessing Netlify UI, prepare these values:**

#### 1. NEXTAUTH_SECRET
- **What:** JWT signing key for NextAuth
- **Where to get:** Generate new
  ```bash
  # Run this command to generate a secure random value
  openssl rand -hex 32
  # Output: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p1a2b3c4d5e6f7g8h9i0j1k2l3m (example)
  ```
- **Status:** ⏳ Need to generate
- **Sensitive:** 🔴 YES - Mark as secret in Netlify

#### 2. NEXTAUTH_URL
- **What:** NextAuth callback URL (your deployed domain)
- **Value:** `https://bzionshopfmcg.netlify.app`
- **Where to get:** Already have (your Netlify domain)
- **Status:** ✅ Ready
- **Sensitive:** 🟢 NO - Public URL

#### 3. DATABASE_URL
- **What:** PostgreSQL connection string
- **Format:** `postgres://user:password@host:port/database?sslmode=require`
- **Where to get:** Your database provider (e.g., AWS RDS, Render, Supabase)
- **Status:** ⏳ Need to obtain from provider
- **Examples:**
  - Supabase: Found in project settings → Database → Connection string
  - AWS RDS: Found in RDS console → Databases → your database → Connectivity
  - Render: Found in PostgreSQL database → Internal Database URL
- **Sensitive:** 🔴 YES - Mark as secret in Netlify

#### 4. EMAIL_SERVER_PASSWORD (Resend API Key)
- **What:** Resend SMTP authentication key (same as RESEND_API_KEY)
- **Where to get:** https://resend.com → Your Account → API Keys
- **Status:** ⏳ Need to obtain from Resend
- **Instructions:**
  1. Log in to https://resend.com
  2. Go to **API Keys** in the sidebar
  3. Copy your API key (starts with `re_`)
  4. Keep it safe - don't share or commit
- **Sensitive:** 🔴 YES - Mark as secret in Netlify

#### 5. UPSTASH_REDIS_REST_TOKEN
- **What:** Upstash Redis authentication token
- **Where to get:** https://console.upstash.com
- **Status:** ⏳ Need to obtain from Upstash
- **Instructions:**
  1. Log in to https://console.upstash.com
  2. Select your Redis database
  3. Go to **Details**
  4. Copy the **REST Token** (starts with `ABBs...`)
  5. Keep it safe - don't share or commit
- **Sensitive:** 🔴 YES - Mark as secret in Netlify

#### 6. UPSTASH_REDIS_REST_URL (Public - already have)
- **What:** Upstash Redis REST endpoint
- **Value:** `https://quality-slug-43912.upstash.io` (already in `.env.production`)
- **Sensitive:** 🟢 NO - Public
- **Status:** ✅ Ready

### Checklist: Secrets Gathered

- [ ] Generated NEXTAUTH_SECRET
- [ ] Confirmed NEXTAUTH_URL = `https://bzionshopfmcg.netlify.app`
- [ ] Obtained DATABASE_URL from provider
- [ ] Obtained EMAIL_SERVER_PASSWORD from Resend
- [ ] Obtained UPSTASH_REDIS_REST_TOKEN from Upstash
- [ ] All secrets saved in a **SECURE** location (password manager, etc.)

---

## Phase 2: Netlify UI Configuration 🔧

### Step 1: Login to Netlify

1. Go to https://app.netlify.com
2. Log in with your credentials
3. Select site: **bzionshopfmcg**

### Step 2: Navigate to Environment Variables

1. Click **Site configuration** (or **Project configuration**)
2. Click **Build & Deploy** from left sidebar
3. Click **Environment** under "Build & Deploy"
4. You should see a list of environment variables (if any exist)

### Step 3: Add Production Context Variables

**Navigate to:** Build & Deploy → Environment → Edit variables

**For each variable below:**

1. Click **Add variable**
2. Enter variable name in left field
3. Enter variable value in right field
4. If sensitive: **Enable "Contains secret values"** toggle (see below)
5. Click **Save** (or continue adding more)

#### Critical Secrets (Mark ALL with "Contains secret values")

| # | Variable Name | Value | Secret? | Notes |
|---|---|---|---|---|
| 1 | `NEXTAUTH_SECRET` | [Your generated value] | ✅ YES | 32+ chars, generated with openssl |
| 2 | `DATABASE_URL` | [Your PostgreSQL URL] | ✅ YES | postgres://user:pass@host:port/db |
| 3 | `EMAIL_SERVER_PASSWORD` | [Your Resend API key] | ✅ YES | Starts with `re_` |
| 4 | `UPSTASH_REDIS_REST_TOKEN` | [Your Upstash token] | ✅ YES | REST Token from console |

#### Public Variables (NO secret toggle)

| # | Variable Name | Value | Secret? | Notes |
|---|---|---|---|---|
| 5 | `NEXTAUTH_URL` | `https://bzionshopfmcg.netlify.app` | ❌ NO | Your deployed domain |
| 6 | `EMAIL_SERVER_HOST` | `smtp.resend.com` | ❌ NO | Resend SMTP host |
| 7 | `EMAIL_SERVER_PORT` | `587` | ❌ NO | SMTP port |
| 8 | `EMAIL_SERVER_USER` | `resend` | ❌ NO | Resend username |
| 9 | `EMAIL_FROM` | `BZION <noreply@bzion.shop>` | ❌ NO | From address |
| 10 | `UPSTASH_REDIS_REST_URL` | `https://quality-slug-43912.upstash.io` | ❌ NO | Redis endpoint |
| 11 | `NODE_ENV` | `production` | ❌ NO | Build environment |
| 12 | `NODE_VERSION` | `20` | ❌ NO | Node.js version |

### Step 4: Enable "Contains secret values" for Sensitive Variables

**For each of the 4 critical secrets (NEXTAUTH_SECRET, DATABASE_URL, EMAIL_SERVER_PASSWORD, UPSTASH_REDIS_REST_TOKEN):**

1. Click the **Edit** icon (pencil) next to the variable
2. Scroll down to find **"Contains secret values"** toggle
3. **Enable** the toggle (should turn blue)
4. Click **Update**

**Why this matters:**
- ✅ Netlify will encrypt the value
- ✅ Secrets will be masked in logs and UI
- ✅ Secret scanning will protect against exposure
- ✅ Only production builds see the raw value

### Checklist: Netlify UI Setup

- [ ] Navigated to Site configuration → Build & Deploy → Environment
- [ ] Added 4 critical secrets
- [ ] Added 8 public variables
- [ ] Total: 12 variables added
- [ ] For all 4 critical secrets: Enabled **"Contains secret values"** toggle
- [ ] Saved all variables

---

## Phase 3: Deployment & Verification 🚀

### Pre-Deployment Verification

#### Check Git Status
```bash
cd c:\Users\Baldeagle\bzionu

# Verify no secrets in staged changes
git status
git diff --cached

# Should NOT show any real credentials (only placeholders)
```

#### Verify .gitignore
```bash
# Check that .env.local is ignored
cat .gitignore | grep -E "\.env"

# Expected output:
# .env.local
# .env.*.local
```

#### Final Code Check
```bash
# Search for any potential hardcoded secrets (should return nothing)
grep -r "postgres://" src/ --include="*.ts" || echo "✅ No hardcoded DB URLs"
grep -r "re_" src/ --include="*.ts" || echo "✅ No hardcoded Resend keys"
```

### Deployment

#### Option 1: Deploy via Git Push (Recommended)

```bash
# Ensure you're on main branch
git status

# Push to main (this triggers Netlify deploy)
git push origin main

# Monitor the deploy
# Go to: https://app.netlify.com > bzionshopfmcg > Deploys > select the latest deploy
```

#### Option 2: Manual Deploy via Netlify CLI

```bash
# If you have Netlify CLI installed
netlify deploy --prod --build

# Monitor in Netlify UI
```

### Monitoring Build Process

1. Go to https://app.netlify.com
2. Select **bzionshopfmcg**
3. Go to **Deploys** tab
4. Click the latest deploy (in progress)
5. Watch **Build log** tab for progress

**What to look for:**
```
✅ GOOD:
  - Build starts
  - npm run build executes
  - "Generated Prisma Client"
  - No errors
  - Secrets appear as "***" in logs

❌ BAD (Do not ignore):
  - Build fails with "Secrets detected"
  - Error message indicates where secret is exposed
  - Application errors during build
  - Missing environment variables
```

### Post-Deployment Verification

#### 1. Check Build Success

- [ ] Netlify shows "Deploy published" ✅
- [ ] Deployment status is green ✅
- [ ] No error messages ✅

#### 2. Verify Secrets are Masked

```
In the Netlify build log, secrets should appear as: ***
Example:
  ✅ Email configured: smtp.resend.com (no *** - public)
  ✅ Database: *** (yes *** - secret is masked)
```

- [ ] NEXTAUTH_SECRET appears as `***` in logs
- [ ] DATABASE_URL appears as `***` in logs
- [ ] EMAIL_SERVER_PASSWORD appears as `***` in logs
- [ ] UPSTASH_REDIS_REST_TOKEN appears as `***` in logs

#### 3. Test Application

Open https://bzionshopfmcg.netlify.app in browser:

- [ ] Page loads without errors
- [ ] No console errors (check browser DevTools → Console)
- [ ] Navigation works
- [ ] Authentication page loads ✅

#### 4. Test Core Features

**Authentication:**
- [ ] Sign-in page accessible
- [ ] Sign-up page accessible
- [ ] Email form appears

**Database (if applicable):**
- [ ] Data loads from database
- [ ] No "DATABASE_URL not set" errors

**Email (if applicable):**
- [ ] No SMTP errors in logs
- [ ] Emails send successfully (test with sign-up flow)

**Redis (if applicable):**
- [ ] Rate limiting works
- [ ] No Redis connection errors

---

## Phase 4: Production Monitoring 📊

### Daily Checks (First Week)

- [ ] Check Netlify deploys for any errors
- [ ] Monitor application logs for issues
- [ ] Verify no secret exposure warnings
- [ ] Confirm all features working
- [ ] Check error tracking (if using Sentry, etc.)

### Ongoing Monitoring

- [ ] Set up alerts for build failures
- [ ] Monitor Netlify billing/usage
- [ ] Schedule monthly security reviews
- [ ] Keep dependencies updated

### Troubleshooting Guide

#### Issue: Build fails with "Secrets detected in output"

**Solution:**
1. Check the build log - it shows which file/line contains the secret
2. Remove the hardcoded value from source code
3. Ensure only `process.env.VARIABLE_NAME` is used
4. Commit and push fix: `git push origin main`
5. Netlify will automatically redeploy

#### Issue: Environment variables not available

**Solution:**
1. Verify variables added in Netlify UI ✅
2. Check variable names match exactly (case-sensitive) ✅
3. Confirm you're in **Production** context, not **Deploy preview** ✅
4. Redeploy: `git push origin main` or manual `netlify deploy --prod --build`

#### Issue: Application errors after deployment

**Solution:**
1. Check Netlify build logs for errors
2. Check application logs/console errors
3. Verify all environment variables are set in Netlify UI
4. Test locally: `npm run dev` with `.env.local`
5. Compare local vs production environments

#### Issue: Secrets visible in Netlify UI

**Solution:**
- This is normal for **dev** context
- For **production** context: secrets show as `***` (expected)
- If showing plaintext in production: verify **"Contains secret values"** toggle is ENABLED

---

## Rollback Procedure

If deployment fails and you need to rollback:

```bash
# Option 1: Rollback to previous deploy in Netlify UI
# Go to: Deploys > select previous successful deploy > click "Restore"

# Option 2: Rollback Git commits
git revert HEAD
git push origin main

# Option 3: Disable deployment
# Go to Site settings > Build & Deploy > Continuous Deployment > Disable
```

---

## Security Best Practices (Ongoing)

### ✅ DO

- [x] Use `process.env` for all secrets
- [x] Mark sensitive variables in Netlify UI
- [x] Rotate secrets periodically
- [x] Monitor build logs for exposure
- [x] Keep dependencies updated
- [x] Review access permissions
- [x] Use strong, unique values for secrets

### ❌ DON'T

- [ ] Hardcode secrets in source code
- [ ] Share secrets in chat/email
- [ ] Commit `.env.local` to Git
- [ ] Log or print secret values
- [ ] Share Netlify access broadly
- [ ] Disable secret scanning
- [ ] Use same secret across environments

---

## After Production Deployment

### Week 1 Follow-up

- [ ] Monitor error rates and logs
- [ ] Test all critical paths
- [ ] Verify email notifications work
- [ ] Check database queries
- [ ] Monitor Redis usage
- [ ] Check rate limiting effectiveness

### Month 1 Follow-up

- [ ] Review access logs
- [ ] Update documentation
- [ ] Train team on secret management
- [ ] Audit recent changes
- [ ] Plan for disaster recovery

---

## Quick Reference

### Netlify UI Path
`https://app.netlify.com` → Select **bzionshopfmcg** → **Site configuration** → **Build & Deploy** → **Environment**

### Secrets to Add (4 critical)
1. `NEXTAUTH_SECRET` (mark secret)
2. `DATABASE_URL` (mark secret)
3. `EMAIL_SERVER_PASSWORD` (mark secret)
4. `UPSTASH_REDIS_REST_TOKEN` (mark secret)

### Public Variables (8 variables)
5. `NEXTAUTH_URL` = `https://bzionshopfmcg.netlify.app`
6. `EMAIL_SERVER_HOST` = `smtp.resend.com`
7. `EMAIL_SERVER_PORT` = `587`
8. `EMAIL_SERVER_USER` = `resend`
9. `EMAIL_FROM` = `BZION <noreply@bzion.shop>`
10. `UPSTASH_REDIS_REST_URL` = `https://quality-slug-43912.upstash.io`
11. `NODE_ENV` = `production`
12. `NODE_VERSION` = `20`

### Deploy
```bash
git push origin main
```

### Monitor
`https://app.netlify.com` → **bzionshopfmcg** → **Deploys** → select latest

---

## Sign-Off

### Deployment Approval Checklist

- [ ] Security audit completed and passed
- [ ] All secrets gathered securely
- [ ] Netlify UI configuration verified (12 variables)
- [ ] Git repository clean (no secrets)
- [ ] Local testing completed successfully
- [ ] Build process tested and working
- [ ] Deployment procedure reviewed
- [ ] Monitoring plan in place
- [ ] Team trained on secret management
- [ ] Ready for production deployment ✅

---

## Support & Questions

**For issues or questions:**

1. Refer to `NETLIFY_SECRETS_CONTROLLER_GUIDE.md` for setup details
2. Check `NETLIFY_SECURITY_AUDIT_REPORT.md` for code audit results
3. Review this checklist for step-by-step guidance
4. Contact: [Your support contact]

---

**Document Version:** 1.0  
**Last Updated:** December 19, 2025  
**Status:** ✅ Ready for Production Deployment
