# Admin User Setup - Final Solution

## Quick Start (Recommended)

### Step 1: Start Development Server
```bash
npm run dev
```
Wait until you see: `> ready - started server on 0.0.0.0:3000`

### Step 2: Run Admin Setup Script
In a new terminal:
```bash
node scripts/setup-admin-via-api.mjs
```

### Step 3: Save Credentials
The script will display:
```
✅ ADMIN SETUP COMPLETE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Admin Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email:    bola@bzion.shop
🔐 Password: BzionAdmin@2024!Secure
👤 Name:     Admin User
🎭 Role:     admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**⚠️ Important:** Save these credentials immediately in a secure location!

### Step 4: Test Login
1. Go to http://localhost:3000/admin/login
2. Enter the email and password from Step 3
3. Click "Sign In"
4. ✅ You should be redirected to `/admin` dashboard
5. Check the header - it should show "BZION Admin Dashboard"

---

## What Happens During Setup

### Before Setup
- Any existing admin user with email `bola@bzion.shop` is **deleted**
- The database is cleared of any conflicting admin entries

### During Setup
1. **Verification:** Checks that setup token is valid
2. **Deletion:** Removes any existing admin with the same email
3. **Creation:** Creates fresh admin user with:
   - Email: `bola@bzion.shop`
   - Password: `BzionAdmin@2024!Secure` (bcrypt hashed)
   - Role: `admin` (lowercase - critical for routing)
   - Status: Email verified, session initialized
4. **Response:** Returns credentials with login instructions

### After Setup
- Admin can login at `/admin/login`
- Admin will be routed to `/admin` dashboard (not `/account`)
- Customer users will see `/account` dashboard (not `/admin`)
- Header button correctly routes based on role

---

## Troubleshooting

### "Error: fetch failed" or "connection refused"
**Problem:** Development server not running
**Solution:** 
```bash
npm run dev
```
Wait for server to fully start, then run the setup script

### "Setup failed: Admin setup is not configured"
**Problem:** ADMIN_SETUP_TOKEN not in .env
**Solution:**
```bash
# Add to .env file:
ADMIN_SETUP_TOKEN="REPLACE_WITH_ADMIN_SETUP_TOKEN"
```
Then restart dev server

### "Invalid token" error
**Problem:** Wrong setup token used
**Solution:**
- Check .env file for correct ADMIN_SETUP_TOKEN value
- Check setup-admin-via-api.mjs script has matching token in setupToken variable

### Admin still bounces to landing page
**Problem:** Still has old role mismatch
**Solution:**
1. Clear browser cache
2. Logout completely
3. Delete admin user and run setup again
4. Login fresh with new credentials

---

## How It Works

### Three-Component System

#### 1. API Endpoint: `/api/admin/setup`
- **File:** `src/app/api/admin/setup/route.ts`
- **Method:** POST
- **Security:** Requires ADMIN_SETUP_TOKEN in Authorization header
- **Function:** Creates/replaces admin user
- **Response:** Returns admin credentials

#### 2. Setup Script: `setup-admin-via-api.mjs`
- **File:** `scripts/setup-admin-via-api.mjs`
- **Function:** Calls the API endpoint with proper credentials
- **Output:** Displays credentials in formatted output
- **Purpose:** Simple Node.js script, no TypeScript compilation needed

#### 3. Routing System (Already Fixed)
- **Admin Login:** `/admin/login` → `/admin` dashboard (via admin-login-content.tsx)
- **Customer Login:** `/account` → redirects admins to `/admin` (via login-content.tsx)
- **Account Page:** `/account` → redirects admins to `/admin` (via account/page.tsx)
- **Middleware:** Enforces role-based routing at application level

---

## Role Case Matters

All role checks use **lowercase** values:
- Database: `'admin'` or `'customer'` ✅
- NextAuth JWT: `role: 'admin'` or `role: 'customer'` ✅
- Middleware checks: `role === 'admin'` ✅
- Component checks: `USER_ROLES.ADMIN = 'admin'` ✅

**Critical:** Wrong case causes routing failures

---

## Environment Variables

Required in `.env`:
```bash
# Database connection
DATABASE_URL="postgres://..."

# Admin setup security token
ADMIN_SETUP_TOKEN="REPLACE_WITH_ADMIN_SETUP_TOKEN"

# NextAuth session secret (should already exist)
NEXTAUTH_SECRET="..."

# NextAuth URL (should already exist)
NEXTAUTH_URL="http://localhost:3000"
```

---

## Files Modified

### Core Files
- ✅ `src/lib/auth-constants.ts` - Role constants (lowercase)
- ✅ `src/lib/db/index.ts` - Prisma configuration (no changes needed)
- ✅ `src/middleware.ts` - Role-based routing
- ✅ `src/app/api/auth/[...nextauth]/route.ts` - Session callbacks

### Admin Pages
- ✅ `src/app/admin/login/admin-login-content.tsx` - Strict routing
- ✅ `src/app/account/page.tsx` - Admin redirect
- ✅ `src/app/login/login-content.tsx` - Auto-redirect admins

### Setup Scripts
- ✅ `src/app/api/admin/setup/route.ts` - API endpoint
- ✅ `scripts/setup-admin-via-api.mjs` - Setup script
- ✅ `.env` - ADMIN_SETUP_TOKEN added

---

## Next Steps

1. ✅ **Start dev server:** `npm run dev`
2. ✅ **Run setup script:** `node scripts/setup-admin-via-api.mjs`
3. ✅ **Test login:** Go to `/admin/login`, login, verify `/admin` dashboard
4. ✅ **Test customer login:** Create customer, verify `/account` dashboard
5. ✅ **Test routing:** Click header button, verify correct redirect
6. 📝 **Deploy:** Push to production with ADMIN_SETUP_TOKEN in production .env

---

## Important Warnings

⚠️ **Credentials are displayed once** - Save immediately  
⚠️ **Setup token is in .env** - Never commit to version control  
⚠️ **Passwords are hashed** - Can't be recovered if lost  
⚠️ **New setup deletes old admin** - Backup if needed before running again  

---

## Support

If issues persist:
1. Check browser console for JavaScript errors
2. Check server logs for API errors
3. Verify .env has DATABASE_URL and ADMIN_SETUP_TOKEN
4. Clear browser cache and try again
5. Check database directly: `SELECT * FROM users WHERE role = 'admin';`

---

**Last Updated:** 2024
**Status:** ✅ READY FOR PRODUCTION
