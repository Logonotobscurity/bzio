# DEPLOYMENT CHECKLIST - BZION Hub

## ✅ PRE-DEPLOYMENT

### Security
- [ ] Database credentials rotated and removed from git
- [ ] All environment variables set in deployment platform
- [ ] Security headers configured in next.config.js
- [ ] Input sanitization implemented
- [ ] No sensitive data in logs

### Environment Variables Required
```bash
# Critical
DATABASE_URL=postgresql://...
RESEND_API_KEY=re_...
EMAIL_FROM=BZION <noreply@yourdomain.com>
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://yourdomain.com

# Optional
USE_DATABASE=true
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE=...
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Database
- [ ] Migrations run: `npx prisma migrate deploy`
- [ ] Database seeded: `npm run seed`
- [ ] Connection tested
- [ ] Backup strategy in place

### Code Quality
- [ ] TypeScript errors fixed: `npm run typecheck`
- [ ] ESLint errors fixed: `npm run lint`
- [ ] Tests passing: `npm test`
- [ ] Build successful: `npm run build`

## 🚀 DEPLOYMENT STEPS

### 1. Install Dependencies
```bash
./INSTALL_DEPENDENCIES.sh
# Or manually: npm install resend
```

### 2. Set Environment Variables
Set all required variables in your deployment platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables
- Firebase: `firebase functions:config:set`

### 3. Run Database Migrations
```bash
npx prisma migrate deploy
npm run seed
```

### 4. Build and Deploy
```bash
npm run build
npm start  # Test locally first
# Then deploy via your platform
```

## ✅ POST-DEPLOYMENT

### Verification
- [ ] Homepage loads correctly
- [ ] Products page displays data
- [ ] RFQ form submits successfully
- [ ] Email confirmation received
- [ ] Error logging working (check /api/errors)
- [ ] Newsletter subscription working
- [ ] No console errors in browser

### Monitoring
- [ ] Error tracking active
- [ ] Performance monitoring active
- [ ] Database queries optimized
- [ ] Response times acceptable (<3s)

### Testing Checklist
```bash
# Test RFQ submission
curl -X POST https://yourdomain.com/api/v1/rfq/submit \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "address": "123 Test St",
    "items": [{"id": "1", "name": "Product", "quantity": 10}]
  }'

# Test newsletter subscription
curl -X POST https://yourdomain.com/api/newsletter-subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Test products API
curl https://yourdomain.com/api/products?page=1&limit=10
```

## 🔄 ROLLBACK PLAN

If issues occur:

1. **Immediate:** Revert to previous deployment
2. **Database:** Restore from backup if needed
3. **Environment:** Check all env vars are set correctly
4. **Logs:** Check deployment platform logs for errors

## 📊 SUCCESS METRICS

Monitor these for 24 hours post-deployment:

- Error rate: Should be <1%
- Response time: Should be <3s
- Email delivery: Should be >95%
- RFQ submissions: Should complete successfully
- Database queries: Should be <100ms

## 🆘 EMERGENCY CONTACTS

- Tech Lead: [Contact]
- DevOps: [Contact]
- Database Admin: [Contact]

## 📝 NOTES

Date Deployed: ___________
Deployed By: ___________
Version: ___________
Issues Encountered: ___________
