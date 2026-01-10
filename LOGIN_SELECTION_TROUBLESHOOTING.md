# Login Selection Routing - Troubleshooting

## Issue: "Continue as Admin" button doesn't show login form

### Root Cause
If you're already logged in as an admin, the middleware redirects you directly to `/admin` dashboard instead of showing the login form.

### Solution: Logout First

**Step 1: Logout**
```
Visit: http://localhost:3000/api/auth/signout
Click: "Sign out"
```

**Step 2: Test Flow**
```
1. Visit: http://localhost:3000/login
2. See: Two cards (Customer | Admin)
3. Click: "Continue as Admin"
4. See: Admin login form at /admin/login
5. Enter: Admin credentials
6. Result: Redirected to /admin dashboard
```

### Expected Behavior

#### When NOT Logged In
```
/login → Selection page
  ↓ Click "Continue as Admin"
/admin/login → Admin login form
  ↓ Enter credentials
/admin → Admin dashboard
```

#### When Already Logged In as Admin
```
/login → Auto-redirect to /admin (middleware)
/admin/login → Auto-redirect to /admin (middleware)
```

### Testing Commands

**1. Check Current Session**
```bash
# Open browser console
fetch('/api/auth/session').then(r => r.json()).then(console.log)
```

**2. Logout**
```bash
# Visit in browser
http://localhost:3000/api/auth/signout
```

**3. Clear Cookies**
```bash
# Browser DevTools → Application → Cookies → Clear All
```

### Verification Steps

1. **Logout completely**
   - Visit `/api/auth/signout`
   - Clear browser cookies
   - Close all tabs

2. **Test selection page**
   - Visit `/login`
   - Should see two cards
   - No automatic redirect

3. **Test admin button**
   - Click "Continue as Admin"
   - Should navigate to `/admin/login`
   - Should see login form

4. **Test login**
   - Enter admin credentials
   - Should redirect to `/admin`
   - Should see dashboard

### Common Issues

#### Issue 1: Button doesn't navigate
**Symptom**: Clicking button does nothing
**Cause**: JavaScript error
**Fix**: Check browser console for errors

#### Issue 2: Redirects to dashboard immediately
**Symptom**: Never see login form
**Cause**: Already logged in
**Fix**: Logout first

#### Issue 3: Shows "Loading..." forever
**Symptom**: Stuck on loading screen
**Cause**: Session check hanging
**Fix**: Clear cookies and refresh

### Debug Mode

Add this to browser console to see routing:

```javascript
// Monitor navigation
const originalPush = window.history.pushState;
window.history.pushState = function(...args) {
  console.log('[NAVIGATION]', args[2]);
  return originalPush.apply(this, args);
};

// Monitor session
setInterval(async () => {
  const session = await fetch('/api/auth/session').then(r => r.json());
  console.log('[SESSION]', session);
}, 5000);
```

### Quick Fix Script

Run this in browser console to force logout and test:

```javascript
// Force logout and redirect to selection
fetch('/api/auth/signout', { method: 'POST' })
  .then(() => {
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = '/login';
  });
```

### Expected Console Logs

When clicking "Continue as Admin":

```
[ROUTER] Navigating to /admin/login
[MIDDLEWARE] Checking auth for /admin/login
[MIDDLEWARE] No session found, allowing access
[COMPONENT] AdminLoginPageContent mounted
[COMPONENT] Showing login form
```

When already logged in:

```
[ROUTER] Navigating to /admin/login
[MIDDLEWARE] Checking auth for /admin/login
[MIDDLEWARE] Admin session detected
[MIDDLEWARE] Redirecting to /admin
[ADMIN_PAGE] Loading dashboard
```

### Files to Check

1. **Selection Page**: `/src/app/login/login-selection-content.tsx`
   - Line 157: `onClick={() => router.push('/admin/login')}`

2. **Middleware**: `/middleware.ts`
   - Lines 59-77: Admin login redirect logic

3. **Admin Login**: `/src/app/admin/login/admin-login-content.tsx`
   - Lines 47-82: Session check and redirect

### Contact Support

If issue persists after logout:
1. Share browser console logs
2. Share network tab (filter: /api/auth)
3. Share current URL when clicking button
4. Share session data from `/api/auth/session`
