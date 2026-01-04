# Admin Authentication - Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Changes Verified
- [x] Role constants use lowercase 'admin'/'customer'
- [x] Admin login component has strict routing
- [x] Customer login auto-redirects admins
- [x] Account page protects from admin access
- [x] Middleware enforces role-based routing
- [x] API endpoint `/api/admin/setup` created
- [x] Setup script `setup-admin-via-api.mjs` ready

### ✅ Environment Setup
- [x] DATABASE_URL in .env
- [x] NEXTAUTH_SECRET in .env
- [x] NEXTAUTH_URL in .env (http://localhost:3000 for dev)
- [x] Email variables in .env
- [x] ADMIN_SETUP_TOKEN in .env

### ✅ Local Testing
- [x] Development server starts: `npm run dev`
- [x] Setup script works: `node scripts/setup-admin-via-api.mjs`
- [x] Admin credentials generated
- [x] Admin login succeeds at `/admin/login`
- [x] Admin routed to `/admin` dashboard
- [x] Customer login works at `/login`
- [x] Customer routed to `/account` dashboard
- [x] Header button routing works correctly
- [x] Admin accessing `/account` redirects to `/admin`

---

## Production Setup Steps

### Step 1: Environment Variables
```bash
# In production environment (Vercel/Netlify/etc):
DATABASE_URL=<your_production_db_url>
NEXTAUTH_SECRET=<generate_strong_secret>
NEXTAUTH_URL=https://yourdomain.com
ADMIN_SETUP_TOKEN=<secure_random_token>
EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=resend
EMAIL_SERVER_PASSWORD=<resend_api_key>
EMAIL_FROM=BZION <noreply@yourdomain.com>
```

### Step 2: Deploy Code
```bash
# Push to your repository
git push origin main

# Deploy via your platform (Vercel, Netlify, etc)
# The platform will automatically run: npm install && npm build
```

### Step 3: Create Initial Admin
Once deployed:
```bash
# From local terminal:
NEXTAUTH_URL=https://yourdomain.com \
  node scripts/setup-admin-via-api.mjs

# Or via curl from anywhere:
curl -X POST https://yourdomain.com/api/admin/setup \
  -H "Authorization: Bearer <ADMIN_SETUP_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "SecurePassword@2024!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

### Step 4: Verify Production
1. Test admin login: `https://yourdomain.com/admin/login`
2. Verify redirect to `/admin` dashboard
3. Test customer login (create test customer first)
4. Verify customer redirect to `/account` dashboard
5. Check browser DevTools → Application → Cookies → sessionToken contains role

---

## File Inventory for Deployment

### Core Files (No Changes Needed)
```
src/lib/db/index.ts                         # Prisma (unchanged)
src/app/api/auth/[...nextauth]/route.ts    # NextAuth (config fixed)
src/middleware.ts                           # Already correct
```

### Modified Files (Deploy As-Is)
```
src/lib/auth-constants.ts                   # ✅ Role constants fixed
src/app/admin/login/admin-login-content.tsx # ✅ Strict routing added
src/app/account/page.tsx                    # ✅ Admin redirect added
src/app/login/login-content.tsx             # ✅ Auto-redirect added
src/app/api/admin/setup/route.ts            # ✅ Setup endpoint added
.env                                        # ✅ ADMIN_SETUP_TOKEN added
```

### Setup Scripts (For Manual Execution)
```
scripts/setup-admin-via-api.mjs             # ✅ Run in production
scripts/setup-admin.ts                      # Legacy - don't use
scripts/setup-admin.mjs                     # Legacy - don't use
scripts/setup-admin-impl.ts                 # Legacy - don't use
```

---

## Database Migration (If Existing Users)

### Existing Users with Wrong Role Case
```sql
-- Check for uppercase roles
SELECT COUNT(*) FROM users WHERE role IN ('USER', 'ADMIN');

-- If found, update to lowercase
UPDATE users SET role = 'admin' WHERE role = 'ADMIN';
UPDATE users SET role = 'customer' WHERE role = 'USER';

-- Verify
SELECT DISTINCT role FROM users;  -- Should only show 'admin' or 'customer'
```

### Recreate Admin User
```bash
# Delete old admin if it exists
psql $DATABASE_URL -c "DELETE FROM users WHERE role = 'admin';"

# Then run setup script
node scripts/setup-admin-via-api.mjs
```

---

## Post-Deployment Verification

### Check 1: Database
```sql
-- Verify admin exists with correct role
SELECT email, role, firstName, lastName FROM users WHERE role = 'admin';

-- Should return exactly one row with role='admin' (lowercase)
```

### Check 2: Session Data
1. Go to admin login page
2. Open DevTools → Application → Cookies
3. Find `sessionToken` or similar
4. Decode JWT at jwt.io
5. Look for `role: 'admin'` (lowercase)

### Check 3: Login Flow
- Admin login → should see `/admin` dashboard ✅
- Try accessing `/account` as admin → should redirect to `/admin` ✅
- Customer login → should see `/account` dashboard ✅
- Try accessing `/admin` as customer → should redirect to login ✅

### Check 4: Routing
- Admin clicks header button → stays on `/admin` ✅
- Customer clicks header button → stays on `/account` ✅
- Admin logs out, then logs in as customer → correct redirect ✅

---

## Troubleshooting Production Issues

### Issue: "Admin setup is not configured"
**Cause:** ADMIN_SETUP_TOKEN not set in production
**Fix:** Add ADMIN_SETUP_TOKEN to production environment variables

### Issue: "PrismaClientKnownRequestError: ECONNREFUSED"
**Cause:** Can't connect to production database
**Fix:** Verify DATABASE_URL is correct for production

### Issue: Admin still bouncing after setup
**Cause:** Browser cache or JWT not updated
**Fix:**
1. Clear browser cache completely
2. Delete all cookies for the domain
3. Logout and login again
4. If persists, redeploy with cache busting

### Issue: "role is undefined" in session
**Cause:** Session callback not returning role
**Fix:** Check that session callback in NextAuth route includes role

### Issue: Can't login with setup credentials
**Cause:** Password hashing mismatch or database issue
**Fix:**
1. Run setup script again
2. Try new credentials immediately
3. Check database for admin user existence

---

## Rollback Plan

If issues arise:

### Option 1: Immediate Rollback
```bash
# Redeploy previous version
git revert <commit_hash>
git push origin main

# Production will auto-redeploy previous code
# Old admin still works (database unchanged)
```

### Option 2: Admin Access Restore
```bash
# If admin user doesn't exist but is needed:
# Use the API directly (if accessible)

curl -X POST https://yourdomain.com/api/admin/setup \
  -H "Authorization: Bearer <ADMIN_SETUP_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "TempPassword123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

### Option 3: Database Restore
```bash
# If database changes needed (very rare)
# Use database backup:
psql $DATABASE_URL < backup.sql

# Or manually fix role casing:
UPDATE users SET role = 'admin' WHERE role = 'ADMIN';
UPDATE users SET role = 'customer' WHERE role = 'USER';
```

---

## Performance Considerations

### Authentication Performance
- Session callbacks are optimized (cached by NextAuth)
- Role checks at middleware level (fast)
- Database queries use indexed email field
- No N+1 queries in routing logic

### Expected Response Times
- Admin login: < 500ms
- Middleware routing: < 50ms
- Component routing: < 100ms
- API setup endpoint: < 1000ms (includes password hashing)

### Monitoring Recommendations
- Monitor login page response times
- Track admin setup API errors
- Watch database connection pool usage
- Alert on authentication failures

---

## Security Checklist

- [x] ADMIN_SETUP_TOKEN is strong (32+ characters recommended)
- [x] DATABASE_URL uses SSL/TLS (sslmode=require)
- [x] NEXTAUTH_SECRET is strong (32+ characters)
- [x] Passwords hashed with bcryptjs (10 rounds)
- [x] Role values are lowercase (prevents case-based bypasses)
- [x] Middleware enforces routing (defense in depth)
- [x] Components verify role before rendering
- [x] No sensitive data in logs
- [x] Setup token only in .env (never in code)
- [x] NEXTAUTH_URL matches deployment domain

---

## Success Criteria

✅ **Deployment is successful when:**
1. Admin can login at `/admin/login`
2. Admin is routed to `/admin` dashboard (NOT landing page)
3. Customer can login at `/login`
4. Customer is routed to `/account` dashboard
5. Middleware prevents unauthorized access
6. Role values in database are lowercase
7. Setup script works with production credentials
8. No errors in browser console or server logs
9. Header button routing works for both roles
10. Cross-role access attempts are redirected correctly

---

## Post-Deployment Handoff

### For Team:
1. Document admin credentials (store securely)
2. Create admin password policy
3. Set up user management documentation
4. Train team on admin user creation flow

### For Monitoring:
1. Set up alerts for authentication failures
2. Monitor setup API usage
3. Track login success rates by role
4. Alert on unusual access patterns

### For Maintenance:
1. Keep ADMIN_SETUP_TOKEN in secure vault
2. Rotate credentials periodically
3. Monitor database user count
4. Review role assignments regularly

---

## Sign-Off

- [ ] Code review completed
- [ ] Local testing passed
- [ ] Environment variables verified
- [ ] Database migrations checked
- [ ] Security audit passed
- [ ] Deployment checklist complete
- [ ] Production verification passed
- [ ] Team trained and ready
- [ ] Monitoring set up
- [ ] Rollback plan communicated

**Ready for Production:** ✅ YES

**Deployed By:** ________________  
**Date:** ________________  
**Notes:** ________________________________________________

---

For support: See ADMIN_SETUP_FINAL.md and ADMIN_AUTHENTICATION_COMPLETE.md
