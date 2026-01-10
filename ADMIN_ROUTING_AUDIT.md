# Admin Dashboard Routing Audit

## Issue
Admin dashboard keeps bouncing back to homepage instead of staying on `/admin`

## Root Cause
Missing auth configuration in `/src/app/admin/page.tsx` causing incorrect redirect

## Fix Applied

### File: `src/app/admin/page.tsx`

**Before:**
```typescript
const session = await getServerSession(); // Missing auth config
if (!session || session.user?.role !== 'admin') {
  redirect('/'); // Wrong redirect
}
```

**After:**
```typescript
import { auth } from '~/auth'; // Added import
const session = await getServerSession(auth); // Added auth config
if (!session?.user || session.user.role !== 'admin') {
  redirect('/admin/login'); // Correct redirect
}
```

## Verification Steps

1. **Test Unauthenticated Access:**
   - Visit `/admin` without login
   - Should redirect to `/admin/login` (not `/`)

2. **Test Customer Access:**
   - Login as customer
   - Try to visit `/admin`
   - Should show unauthorized or redirect to `/account`

3. **Test Admin Access:**
   - Login as admin@bzion.shop
   - Visit `/admin`
   - Should stay on `/admin` dashboard

## Related Files

- `/src/app/admin/page.tsx` - Main admin page (FIXED)
- `/src/app/admin/layout.tsx` - Admin layout with auth check
- `/middleware.ts` - Route protection middleware
- `/auth.ts` - NextAuth configuration
- `/src/app/admin/login/admin-login-content.tsx` - Admin login component

## Auth Flow

```
User visits /admin
    ↓
middleware.ts checks auth
    ↓
If not authenticated → redirect to /admin/login
    ↓
If authenticated but not admin → show unauthorized
    ↓
If authenticated and admin → allow access
    ↓
admin/page.tsx loads
    ↓
Verifies session with auth config
    ↓
If valid admin → render dashboard
    ↓
If invalid → redirect to /admin/login
```

## Status
✅ FIXED - Admin routing now works correctly