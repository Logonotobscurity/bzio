# Vercel Deployment Guide

**Project:** bzion (B2B E-commerce Platform)  
**Date:** December 19, 2025  
**Status:** ✅ Ready for Vercel Deployment  
**Migration:** Completed from Netlify

---

## 📋 Quick Start: Deploy to Vercel (5 minutes)

### Step 1: Connect GitHub to Vercel

1. Go to https://vercel.com/new
2. Click **"Continue with GitHub"**
3. Sign in with GitHub credentials
4. Select repository: **Logonotobscurity/bzionu**
5. Click **"Import"**

### Step 2: Configure Project Settings

**Vercel will auto-detect:**
- ✅ Framework: Next.js
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `.next`

**Keep defaults** (Vercel auto-configures for Next.js)

### Step 3: Add Environment Variables

**In the "Environment Variables" section, add these 10 variables:**

#### 5 Critical Secrets
```
1. NEXTAUTH_SECRET         = [Generate: openssl rand -hex 32]
2. DATABASE_URL            = [Your PostgreSQL connection string]
3. EMAIL_SERVER_PASSWORD   = [Your Resend API key]
4. UPSTASH_REDIS_REST_TOKEN = [Your Upstash Redis token]
5. NEXTAUTH_URL            = https://bzion-shop.vercel.app
```

#### 5 Public Variables
```
6. EMAIL_SERVER_HOST       = smtp.resend.com
7. EMAIL_SERVER_PORT       = 587
8. EMAIL_SERVER_USER       = resend
9. EMAIL_FROM              = BZION <noreply@bzion.shop>
10. UPSTASH_REDIS_REST_URL = https://quality-slug-43912.upstash.io
```

### Step 4: Deploy

Click **"Deploy"** button

Vercel will:
1. Clone your repository
2. Install dependencies
3. Run `npm run build`
4. Deploy to production
5. Provide your URL

**Estimated time:** 2-3 minutes

---

## 🔗 After Deployment: Update NEXTAUTH_URL

Once Vercel deployment completes, you'll get a URL like:
```
https://bzion-shop-12345.vercel.app
```

**Update NEXTAUTH_URL** to your actual Vercel URL:

1. Go to Vercel Dashboard → **Project Settings** → **Environment Variables**
2. Edit **NEXTAUTH_URL**
3. Change from placeholder to your actual Vercel URL
4. Save
5. Redeploy (Vercel will auto-redeploy)

---

## 📁 Files Changed in Migration

### Deleted
```
netlify.toml              (Netlify build config)
.netlify/                 (Netlify artifacts)
```

### Created
```
vercel.json              (Vercel build config)
```

### Updated
```
.env.production          (Updated references to Vercel)
```

---

## 🎯 Vercel Dashboard Access

After deployment:

1. **Go to:** https://vercel.com/dashboard
2. **Select project:** bzion-shop (or whatever name)
3. **Access:**
   - **Deployments** - View build history
   - **Settings** - Manage environment variables
   - **Analytics** - Monitor performance
   - **Logs** - View build and function logs

---

## 📊 Production vs Preview Deployments

### Production Deployments
- **Trigger:** Push to `main` branch
- **URL:** https://bzion-shop.vercel.app
- **Environment Variables:** Production values

### Preview Deployments
- **Trigger:** Pull requests
- **URL:** https://[branch-name]-bzion-shop.vercel.app
- **Environment Variables:** Can override in Vercel

---

## 🔐 Secret Management in Vercel

### Production Environment
```
Vercel Dashboard → Settings → Environment Variables

Development:  (optional - overrides for local)
Preview:      (optional - for pull requests)
Production:   (required - for production deployments)
```

**Set all 10 variables in "Production" environment**

---

## 🚀 Deployment Comparison

### Netlify (Old)
```
- Custom build config: netlify.toml
- Environment variables: Netlify UI
- Build time: ~3 minutes
- Deployment URL: bzionshopfmcg.netlify.app
```

### Vercel (New)
```
- Custom build config: vercel.json
- Environment variables: Vercel Dashboard
- Build time: ~2-3 minutes (faster)
- Deployment URL: bzion-shop.vercel.app (or custom)
- Auto-scaling: ✅ Built-in
- CDN: ✅ Global edge network
```

---

## ✅ Post-Deployment Checklist

### Verify Deployment
- [ ] Application loads at Vercel URL
- [ ] No build errors in Vercel logs
- [ ] No runtime errors in console (F12)

### Test Features
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Login/Register pages accessible
- [ ] Authentication flow works
- [ ] Database queries work
- [ ] Email sending works (test signup)
- [ ] Redis caching works

### Monitor
- [ ] Check Vercel Analytics
- [ ] Review build times
- [ ] Monitor error rates
- [ ] Check performance metrics

---

## 🔧 Configuration Files Reference

### vercel.json (New)
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "nodejs": "20.x"
}
```

### .env.production (Updated)
```env
NEXTAUTH_URL=https://bzion-shop.vercel.app
# All other variables set in Vercel Dashboard
```

---

## 📝 Important Notes

1. **NEXTAUTH_URL is critical**
   - Must match your Vercel deployment URL
   - Update after getting your Vercel URL
   - Wrong value breaks authentication

2. **Secrets are encrypted**
   - Vercel encrypts all environment variables
   - Never visible in logs
   - Only used during build/runtime

3. **Database must be accessible**
   - DATABASE_URL must point to production database
   - Database must allow connections from Vercel
   - Firewall rules may need updating

4. **Email service (Resend)**
   - API key must be valid
   - Domain must be verified in Resend
   - Check Vercel logs if emails don't send

5. **Redis cache (Upstash)**
   - Token must be valid
   - Database must be accessible
   - Check logs if caching fails

---

## 🆘 Troubleshooting

### Build Fails
**Check:** Vercel Logs → Deployments → [Latest] → Logs
- Look for error messages
- Check for missing environment variables
- Verify all dependencies installed

### Authentication Not Working
**Check:**
- NEXTAUTH_URL matches Vercel URL
- NEXTAUTH_SECRET is set
- All required variables present

### Database Connection Errors
**Check:**
- DATABASE_URL is complete
- Database firewall allows Vercel IPs
- Database credentials are correct

### Email Not Sending
**Check:**
- EMAIL_SERVER_PASSWORD (Resend API key) is valid
- Email address verified in Resend
- Check Vercel function logs

### Application Loads but Shows Error
**Check:**
- Browser console (F12) for error messages
- Vercel function logs
- All environment variables set

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel CLI:** `npm install -g vercel`

---

## 🎉 You're Done!

Your application is now deployed to Vercel!

**Next steps:**
1. Monitor performance in Vercel Dashboard
2. Set up custom domain (optional)
3. Configure analytics (built-in)
4. Set up CI/CD alerts (optional)

---

**Deployment Status:** ✅ READY  
**Code Audit:** ✅ PASSED  
**Security:** ✅ EXCELLENT  
**Next Action:** Connect GitHub → Deploy on Vercel
