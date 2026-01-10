# Netlify Secrets Controller: Quick Reference Card

**Print this and keep it handy during deployment!**

---

## 📋 5-Minute Checklist

```
BEFORE DEPLOYMENT:
☐ Gathered NEXTAUTH_SECRET (openssl rand -hex 32)
☐ Have DATABASE_URL ready
☐ Have EMAIL_SERVER_PASSWORD (Resend API key)
☐ Have UPSTASH_REDIS_REST_TOKEN ready
☐ Verified no secrets in git: git status
☐ All 4 secrets are safe and secure

NETLIFY UI SETUP:
☐ Logged in to app.netlify.com
☐ Selected site: bzionshopfmcg
☐ Navigated to: Site configuration → Build & Deploy → Environment
☐ Added 4 critical secrets with "Contains secret values" toggle
☐ Added 8 public variables (no secret toggle)
☐ Saved all 12 variables

DEPLOYMENT:
☐ Ran: git push origin main
☐ Checked Netlify build logs
☐ Confirmed secrets masked with ***
☐ Verified application loads
☐ Tested core features

POST-DEPLOYMENT:
☐ Application is live and working
☐ No error messages in logs
☐ All integrations functioning
```

---

## 🔑 The 4 Secrets to Add (Mark as Secret)

### 1. NEXTAUTH_SECRET
```
Variable Name: NEXTAUTH_SECRET
Value: [Your openssl output]
Toggle: ✅ "Contains secret values"
Purpose: JWT signing key
```

### 2. DATABASE_URL
```
Variable Name: DATABASE_URL
Value: postgres://user:pass@host:port/db?sslmode=require
Toggle: ✅ "Contains secret values"
Purpose: PostgreSQL connection
```

### 3. EMAIL_SERVER_PASSWORD
```
Variable Name: EMAIL_SERVER_PASSWORD
Value: [Your Resend API key]
Toggle: ✅ "Contains secret values"
Purpose: SMTP authentication
```

### 4. UPSTASH_REDIS_REST_TOKEN
```
Variable Name: UPSTASH_REDIS_REST_TOKEN
Value: [Your Upstash token]
Toggle: ✅ "Contains secret values"
Purpose: Redis authentication
```

---

## 📦 The 8 Public Variables (NO Secret Toggle)

```
1. NEXTAUTH_URL = https://bzionshopfmcg.netlify.app
2. EMAIL_SERVER_HOST = smtp.resend.com
3. EMAIL_SERVER_PORT = 587
4. EMAIL_SERVER_USER = resend
5. EMAIL_FROM = BZION <noreply@bzion.shop>
6. UPSTASH_REDIS_REST_URL = https://quality-slug-43912.upstash.io
7. NODE_ENV = production
8. NODE_VERSION = 20
```

---

## 🌐 Netlify UI Navigation Path

```
Step 1: Go to https://app.netlify.com

Step 2: Select site "bzionshopfmcg"

Step 3: Click "Site configuration"

Step 4: Left sidebar → "Build & Deploy"

Step 5: Click "Environment"

Step 6: Add variables (12 total)

Step 7: For critical secrets → Edit → Toggle "Contains secret values"

Step 8: Save all
```

---

## 🔧 Getting the Secrets

### NEXTAUTH_SECRET
```bash
# Run this command (Windows PowerShell):
openssl rand -hex 32

# Copy the output (example):
1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p1a2b3c4d5e6f7g8h9i0j1k2l3m
```

### DATABASE_URL
- **Supabase:** Project → Settings → Database → Connection pooler
- **AWS RDS:** RDS → Databases → your-db → Connectivity & security
- **Render:** PostgreSQL database → Internal Database URL
- **Format:** `postgres://user:password@host:port/database?sslmode=require`

### EMAIL_SERVER_PASSWORD
- Go to: https://resend.com → API Keys
- Copy your API key (starts with `re_`)
- This is the same as RESEND_API_KEY

### UPSTASH_REDIS_REST_TOKEN
- Go to: https://console.upstash.com
- Select your Redis database
- Go to Details
- Copy REST Token

---

## 🚀 Deployment Command

```bash
cd c:\Users\Baldeagle\bzionu

# Verify no secrets in staging
git status

# Should show: nothing to commit (clean working tree)
# If you see .env.local: it's gitignored, that's fine

# Push to main (triggers Netlify deploy)
git push origin main

# Monitor in Netlify UI
# Go to: Deploys tab → select latest deploy
```

---

## ✅ What to Look for in Build Logs

### ✅ GOOD Signs
```
✅ Build starts
✅ npm run build executes
✅ Generated Prisma Client
✅ Build completes
✅ Deploy published
✅ Secrets show as: ***
✅ No error messages
```

### ❌ BAD Signs (Do NOT ignore)
```
❌ Build fails with "Secrets detected"
❌ Error: Environment variables missing
❌ Error: DATABASE_URL not set
❌ Build log shows actual API keys
❌ Application errors during build
```

---

## 🧪 Testing After Deployment

```
1. Open https://bzionshopfmcg.netlify.app
2. Check browser console (F12 → Console tab)
3. Should see NO error messages
4. Try to sign in/register
5. Check email is sent (if implemented)
6. Verify database queries work
7. Confirm rate limiting functions
```

---

## 🆘 Troubleshooting

### Build fails with "Secret detected"
```
1. Check build log for file/line reference
2. Remove hardcoded secret from source code
3. Commit and push: git push origin main
4. Netlify automatically redeploys
```

### Environment variable not found
```
1. Verify added in Netlify UI ✅
2. Check exact spelling (case-sensitive) ✅
3. Verify in "Production" context, not Deploy Preview ✅
4. Redeploy: git push origin main
```

### Application not loading
```
1. Check Netlify build logs
2. Check browser console (F12)
3. Check if all 12 variables are set
4. Verify DATABASE_URL is correct
5. Try local test: npm run dev
```

---

## 📞 Need Help?

### Check These Docs First
1. `NETLIFY_SECRETS_IMPLEMENTATION_SUMMARY.md` - Overview
2. `NETLIFY_SECRETS_CONTROLLER_GUIDE.md` - Complete setup
3. `NETLIFY_SECURITY_AUDIT_REPORT.md` - Code audit
4. `NETLIFY_DEPLOYMENT_CHECKLIST_SECRETS.md` - Step-by-step

### External Resources
- Netlify Docs: https://docs.netlify.com/build/environment-variables/
- Next.js Docs: https://nextjs.org/docs/deployment/netlify

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Gather secrets | 10 min |
| Configure Netlify UI | 10 min |
| Deploy | 5 min |
| Monitor build | 5 min |
| Test application | 5 min |
| **Total** | **~35 min** |

---

## 🎯 Success Criteria

✅ Build completes without errors  
✅ Secrets masked in logs (show as ***)  
✅ Application accessible at deployed URL  
✅ No authentication errors  
✅ Database connected  
✅ Email service working  
✅ No sensitive data in logs  

---

## 🔐 Security Reminders

```
✅ DO:
  ☑ Use process.env.VARIABLE_NAME in code
  ☑ Mark sensitive variables as secrets in Netlify
  ☑ Use strong, unique secret values
  ☑ Rotate secrets quarterly
  ☑ Monitor build logs for exposure

❌ DON'T:
  ☒ Hardcode secrets in source code
  ☒ Commit .env.local to Git
  ☒ Log or print secret values
  ☒ Share secrets in chat/email
  ☒ Use same secret across environments
```

---

## 📊 Final Checklist

```
CODE LEVEL:
✅ All secrets use process.env
✅ No hardcoded credentials
✅ Error handling is safe
✅ Configuration files are clean

NETLIFY UI LEVEL:
⏳ 4 critical secrets added (with toggle)
⏳ 8 public variables added
⏳ Total 12 variables configured

DEPLOYMENT LEVEL:
⏳ git push origin main
⏳ Build completes successfully
⏳ Secrets masked in logs
⏳ Application tested and working

POST-DEPLOYMENT:
⏳ Monitor for errors
⏳ Test core features
⏳ Document setup
```

---

## 🎉 You're Done!

Once all items above are checked, your application is:
- ✅ Secure
- ✅ Production-ready
- ✅ Following best practices
- ✅ Protected by Netlify Secrets Controller

**Congratulations! 🎊**

---

**Print this card and keep nearby during deployment!**  
**Last Updated:** December 19, 2025

---

## Quick Links on this Card

- **Netlify UI:** https://app.netlify.com
- **Your Site:** https://bzionshopfmcg.netlify.app
- **Resend API Keys:** https://resend.com
- **Upstash Console:** https://console.upstash.com
- **OpenSSL Generator:** Run `openssl rand -hex 32` in terminal

---

**Status: READY FOR DEPLOYMENT** ✅

Time to deploy! Follow the steps and you'll be done in ~30 minutes.
