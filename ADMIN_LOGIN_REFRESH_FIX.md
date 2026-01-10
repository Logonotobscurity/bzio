# Admin Login Refresh Loop - Fixed

## Issue
`/admin/login` keeps refreshing after successful login

## Root Cause
Using `router.replace()` doesn't trigger full page reload, causing middleware to not re-evaluate session properly.

## Fix Applied
Changed from:
```typescript
router.replace(REDIRECT_PATHS.ADMIN_DASHBOARD);
```

To:
```typescript
window.location.href = REDIRECT_PATHS.ADMIN_DASHBOARD;
```

## Why This Works
- `window.location.href` forces full page reload
- Middleware re-evaluates session on new request
- Session cookie is properly read
- Admin is redirected to dashboard correctly

## Testing
1. Visit `/admin/login`
2. Enter admin credentials
3. Submit form
4. Should redirect to `/admin` dashboard (no refresh loop)

## Files Modified
- `src/app/admin/login/admin-login-content.tsx`
