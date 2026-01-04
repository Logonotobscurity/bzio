# Authentication System Refactoring - Testing and Validation Guide

## Quick Start Testing

### Prerequisites
1. Application running locally: `npm run dev`
2. Database seeded with test users:
   - Customer account: `customer@example.com` / password
   - Administrator account: `admin@example.com` / password
3. Browser developer tools ready for console logging
4. Network tab monitoring (optional)

---

## Test Scenarios

### Test Suite 1: Landing Page and Route Entry Points

#### TC1.1: Unauthenticated User Access Landing Page
**Steps:**
1. Open browser and navigate to `http://localhost:3000`
2. Verify landing page displays with two distinct pathway options
3. Verify "Customer Login" option shows blue user icon
4. Verify "Administrator Login" option shows purple shield icon
5. Verify hover states work (scale, shadow, color changes)

**Expected Results:**
- Landing page displays without authentication required
- Both pathway options are visible and interactive
- Visual differentiation is clear (blue vs purple theming)
- Hover effects enhance clickability affordance

**Pass/Fail:** ___

---

#### TC1.2: Click Customer Pathway on Landing Page
**Steps:**
1. From landing page, click the "Customer Login" option
2. Verify browser navigates to `/login`
3. Verify page title shows "Login"
4. Verify blue user icon displays above login form

**Expected Results:**
- Navigation occurs to `/login` route
- Customer login interface displays
- Page indicates customer authentication context

**Pass/Fail:** ___

---

#### TC1.3: Click Administrator Pathway on Landing Page
**Steps:**
1. From landing page, click the "Administrator Login" option
2. Verify browser navigates to `/admin/login`
3. Verify page title shows "Admin Login"
4. Verify purple shield icon displays above login form
5. Verify amber warning banner displays about restricted access

**Expected Results:**
- Navigation occurs to `/admin/login` route
- Admin login interface displays with shield icon
- Warning banner emphasizes restricted access
- Page indicates administrative context

**Pass/Fail:** ___

---

### Test Suite 2: Customer Authentication Flow

#### TC2.1: Customer Login with Valid Credentials
**Steps:**
1. Navigate to `http://localhost:3000/login`
2. Enter customer email: `customer@example.com`
3. Enter customer password: (correct password)
4. Click "Login" button
5. Wait for authentication processing
6. Verify browser navigation and final URL

**Expected Results:**
- Form submission succeeds
- User redirected to `/account`
- Customer dashboard displays
- Console shows: `[CUSTOMER_LOGIN] Customer authentication successful`

**Pass/Fail:** ___

---

#### TC2.2: Customer Login with Invalid Credentials
**Steps:**
1. Navigate to `http://localhost:3000/login`
2. Enter email: `customer@example.com`
3. Enter password: `wrongpassword`
4. Click "Login" button
5. Wait for validation

**Expected Results:**
- Error toast displays: "Invalid email or password. Please try again."
- User remains on `/login` page
- Password field is cleared
- Email field retains entered value

**Pass/Fail:** ___

---

#### TC2.3: Admin Account Attempting Customer Login
**Steps:**
1. Navigate to `http://localhost:3000/login`
2. Enter admin email: `admin@example.com`
3. Enter admin password: (correct password)
4. Click "Login" button
5. Wait for authentication and role verification
6. Observe error message

**Expected Results:**
- Authentication succeeds initially
- Role verification detects admin role
- Error message displays: "Your account has administrator privileges. Please use the administrator login interface."
- Link provided to `/admin/login`
- Password field is cleared for security
- User remains on `/login` page
- Console shows: `[CUSTOMER_LOGIN] Admin attempted customer login`

**Pass/Fail:** ___

---

#### TC2.4: Customer Login Magic Link
**Steps:**
1. Navigate to `http://localhost:3000/login`
2. Enter customer email: `customer@example.com`
3. Click "Send Magic Link" button
4. Wait for processing

**Expected Results:**
- Toast message displays: "Magic Link Sent"
- Message indicates: "Check your email for a link to log in."
- No page navigation occurs

**Pass/Fail:** ___

---

#### TC2.5: Customer Register Link from Login Page
**Steps:**
1. Navigate to `http://localhost:3000/login`
2. Click "Register here" link below login form

**Expected Results:**
- Navigation occurs to `/register` page
- Registration interface displays

**Pass/Fail:** ___

---

#### TC2.6: Admin Login Link from Customer Login Page
**Steps:**
1. Navigate to `http://localhost:3000/login`
2. Click "Login here" link under "Are you an administrator?" text

**Expected Results:**
- Navigation occurs to `/admin/login`
- Admin login interface displays

**Pass/Fail:** ___

---

### Test Suite 3: Administrator Authentication Flow

#### TC3.1: Admin Login with Valid Credentials
**Steps:**
1. Navigate to `http://localhost:3000/admin/login`
2. Enter admin email: `admin@example.com`
3. Enter admin password: (correct password)
4. Click "Login as Administrator" button
5. Wait for authentication processing
6. Verify browser navigation and final URL

**Expected Results:**
- Form submission succeeds
- User redirected to `/admin`
- Admin dashboard displays
- Console shows: `[ADMIN_LOGIN] Admin authentication successful`
- Amber warning banner is NOT present (redirected to dashboard)

**Pass/Fail:** ___

---

#### TC3.2: Admin Login with Invalid Credentials
**Steps:**
1. Navigate to `http://localhost:3000/admin/login`
2. Enter email: `admin@example.com`
3. Enter password: `wrongpassword`
4. Click "Login as Administrator" button
5. Wait for validation

**Expected Results:**
- Error toast displays: "Authentication Failed"
- Message: "Invalid email or password. Please try again."
- User remains on `/admin/login` page
- Password field is cleared
- Email field retains entered value

**Pass/Fail:** ___

---

#### TC3.3: Customer Account Attempting Admin Login
**Steps:**
1. Navigate to `http://localhost:3000/admin/login`
2. Enter customer email: `customer@example.com`
3. Enter customer password: (correct password)
4. Click "Login as Administrator" button
5. Wait for authentication and role verification
6. Observe error message

**Expected Results:**
- Authentication succeeds initially
- Role verification detects non-admin role
- Error message displays: "Your account does not have administrator privileges. Please use the customer login interface to access your account."
- Link provided to `/login`
- Password field is cleared for security
- User remains on `/admin/login` page
- Console shows: `[ADMIN_LOGIN] Non-admin role detected`

**Pass/Fail:** ___

---

#### TC3.4: Admin Login Magic Link
**Steps:**
1. Navigate to `http://localhost:3000/admin/login`
2. Enter admin email: `admin@example.com`
3. Click "Send Magic Link" button
4. Wait for processing

**Expected Results:**
- Toast message displays: "Magic Link Sent"
- Message indicates: "Check your email for a link to log in."
- No page navigation occurs

**Pass/Fail:** ___

---

#### TC3.5: Customer Login Link from Admin Login Page
**Steps:**
1. Navigate to `http://localhost:3000/admin/login`
2. Click "Login as customer" link below login form

**Expected Results:**
- Navigation occurs to `/login`
- Customer login interface displays

**Pass/Fail:** ___

---

### Test Suite 4: Protected Route Access

#### TC4.1: Unauthenticated User Accessing Customer Dashboard
**Steps:**
1. In new browser session (no authentication), navigate to `http://localhost:3000/account`
2. Observe automatic redirection
3. Note browser URL and page displayed

**Expected Results:**
- Middleware intercepts request
- User redirected to `/login?callbackUrl=%2Faccount`
- Login page displays
- Console shows: `[MIDDLEWARE] Unauthenticated access to customer route`

**Pass/Fail:** ___

---

#### TC4.2: Unauthenticated User Accessing Admin Dashboard
**Steps:**
1. In new browser session (no authentication), navigate to `http://localhost:3000/admin`
2. Observe automatic redirection
3. Note browser URL and page displayed

**Expected Results:**
- Middleware intercepts request
- User redirected to `/admin/login`
- Admin login page displays with warning banner
- Console shows: `[MIDDLEWARE] Unauthenticated access to admin route`

**Pass/Fail:** ___

---

#### TC4.3: Authenticated Customer Accessing Customer Dashboard
**Steps:**
1. Authenticate as customer (navigate `/login`, enter credentials, complete login)
2. Verify at `/account` page
3. Verify dashboard content displays

**Expected Results:**
- Authentication succeeds
- User navigates to `/account`
- Customer dashboard displays with appropriate content
- User can access all customer-specific features

**Pass/Fail:** ___

---

#### TC4.4: Authenticated Admin Accessing Admin Dashboard
**Steps:**
1. Authenticate as admin (navigate `/admin/login`, enter credentials, complete login)
2. Verify at `/admin` page
3. Verify dashboard content displays

**Expected Results:**
- Authentication succeeds
- User navigates to `/admin`
- Admin dashboard displays with admin-specific content
- User can access all administrative features

**Pass/Fail:** ___

---

#### TC4.5: Authenticated Customer Attempting Admin Dashboard Access
**Steps:**
1. Authenticate as customer
2. Manually navigate to `http://localhost:3000/admin`
3. Observe redirection behavior

**Expected Results:**
- Middleware detects customer attempting admin access
- User redirected to `/account`
- Admin dashboard is NOT accessible
- Console shows: `[MIDDLEWARE] Admin attempting to access customer route` (inverse logic)

**Pass/Fail:** ___

---

#### TC4.6: Authenticated Admin Attempting Customer Dashboard Access
**Steps:**
1. Authenticate as admin
2. Manually navigate to `http://localhost:3000/account`
3. Observe redirection behavior

**Expected Results:**
- Middleware detects admin attempting customer access
- User redirected to `/admin`
- Customer dashboard is NOT accessible
- Console shows: `[MIDDLEWARE] Admin attempting to access customer route`

**Pass/Fail:** ___

---

### Test Suite 5: Middleware Redirect Logic

#### TC5.1: Authenticated Admin Accessing `/login`
**Steps:**
1. Authenticate as admin (at `/admin`)
2. Manually navigate to `http://localhost:3000/login`
3. Observe redirection

**Expected Results:**
- Middleware intercepts request
- User redirected to `/admin`
- Admin dashboard displays
- Console shows: `[MIDDLEWARE] Admin redirected from /login to /admin`
- Login component NOT rendered

**Pass/Fail:** ___

---

#### TC5.2: Authenticated Customer Accessing `/login`
**Steps:**
1. Authenticate as customer (at `/account`)
2. Manually navigate to `http://localhost:3000/login`
3. Observe behavior

**Expected Results:**
- Middleware allows access to `/login` page
- Login component renders
- Login component's useEffect detects authenticated session
- Login component redirects to `/account`
- User ends at `/account`

**Pass/Fail:** ___

---

#### TC5.3: Authenticated Admin Accessing `/admin/login`
**Steps:**
1. Authenticate as admin (at `/admin`)
2. Manually navigate to `http://localhost:3000/admin/login`
3. Observe redirection

**Expected Results:**
- Middleware intercepts request
- User redirected to `/admin`
- Admin dashboard displays
- Console shows: `[MIDDLEWARE] Admin redirected from /admin/login to /admin`
- Admin login component NOT rendered

**Pass/Fail:** ___

---

#### TC5.4: Authenticated Customer Accessing `/admin/login`
**Steps:**
1. Authenticate as customer (at `/account`)
2. Manually navigate to `http://localhost:3000/admin/login`
3. Observe redirection

**Expected Results:**
- Middleware intercepts request
- User redirected to `/account`
- Customer dashboard displays
- Console shows: `[MIDDLEWARE] Customer redirected from /admin/login to /account`
- Admin login component NOT rendered

**Pass/Fail:** ___

---

### Test Suite 6: Callback URL Handling

#### TC6.1: Callback URL After Customer Authentication
**Steps:**
1. In new session, navigate to `/account/orders` (not authenticated)
2. Middleware redirects to `/login?callbackUrl=%2Faccount%2Forders`
3. Authenticate with customer credentials
4. Observe final navigation

**Expected Results:**
- User redirected to `/login` with encoded callback URL
- After successful authentication, user navigated to original destination `/account/orders`
- Feature at original URL is accessible

**Pass/Fail:** ___

---

#### TC6.2: Callback URL After Admin Authentication
**Steps:**
1. In new session, navigate to `/admin/customers` (not authenticated)
2. Middleware redirects to `/admin/login` (no callback URL - design decision)
3. Authenticate with admin credentials
4. Observe final navigation

**Expected Results:**
- User redirected to `/admin/login`
- After successful authentication, user navigated to `/admin` dashboard
- User can then navigate to `/admin/customers`

**Pass/Fail:** ___

---

### Test Suite 7: Error Scenarios

#### TC7.1: Database Connection Error During Login
**Steps:**
1. (Simulate by temporarily stopping database service if possible)
2. Attempt customer login
3. Observe error handling

**Expected Results:**
- Error handling gracefully
- User-friendly error message displays
- Application doesn't crash
- Error logged to console

**Pass/Fail:** ___

---

#### TC7.2: Session Expiration
**Steps:**
1. Authenticate as customer
2. Wait for session to expire (or manipulate JWT if possible)
3. Attempt to access protected route

**Expected Results:**
- Middleware detects invalid/expired token
- User redirected to appropriate login page
- Previous session cleared

**Pass/Fail:** ___

---

#### TC7.3: Multiple Simultaneous Login Attempts
**Steps:**
1. Navigate to customer login page
2. Rapidly click "Login" button multiple times
3. Observe behavior

**Expected Results:**
- First request processes correctly
- Subsequent requests handled gracefully
- No duplicate authentications
- No errors in console

**Pass/Fail:** ___

---

### Test Suite 8: Cross-Browser and Device Testing

#### TC8.1: Mobile Device - Landing Page
**Steps:**
1. On mobile device, navigate to `http://localhost:3000`
2. Verify landing page layout and responsiveness
3. Test both pathway options on mobile view

**Expected Results:**
- Landing page is fully responsive
- Both pathway options are easily clickable on mobile
- Typography and spacing are appropriate for mobile
- Hover effects work on touch devices (visual feedback)

**Pass/Fail:** ___

---

#### TC8.2: Mobile Device - Login Pages
**Steps:**
1. On mobile device, navigate to `/login` and `/admin/login`
2. Verify form layout
3. Test form input fields
4. Test button responsiveness

**Expected Results:**
- Login forms are mobile-optimized
- Input fields are appropriately sized for touch
- Submit buttons are easy to tap
- Error messages display clearly

**Pass/Fail:** ___

---

#### TC8.3: Dark Mode Compatibility
**Steps:**
1. Enable dark mode in browser/OS settings
2. Navigate through all authentication pages
3. Verify visual contrast and readability

**Expected Results:**
- All pages properly styled in dark mode
- Text contrast meets accessibility standards
- Icon colors adjust appropriately
- Color-coded elements (blue/purple) remain distinct

**Pass/Fail:** ___

---

## Security Testing

### SEC1: SQL Injection Prevention
**Steps:**
1. Attempt SQL injection in login email field: `admin@test.com' OR '1'='1`
2. Submit form
3. Observe response

**Expected Results:**
- Injection attempt is safely handled
- No database error messages expose schema
- User receives generic "Invalid credentials" error
- No unauthorized access occurs

**Pass/Fail:** ___

---

### SEC2: Session Hijacking Prevention
**Steps:**
1. Authenticate and note session token
2. Copy token to another browser/incognito window
3. Attempt to use copied token

**Expected Results:**
- Copied token either:
  - Is invalid/expired
  - Cannot be directly used (signed/encrypted)
  - Provides no unauthorized access
- Current session in original browser continues normally

**Pass/Fail:** ___

---

### SEC3: Password Field Security
**Steps:**
1. After any authentication attempt that fails due to wrong password
2. Verify password field is cleared
3. Verify password is not visible in form data/network tab

**Expected Results:**
- Password field cleared after error
- Password never logged in console
- Network tab shows password is sent (POST) but not retained
- No plaintext passwords in local storage

**Pass/Fail:** ___

---

### SEC4: CSRF Protection
**Steps:**
1. (Requires CSRF test setup)
2. Attempt login request from external origin
3. Observe response

**Expected Results:**
- NextAuth CSRF protection active
- External origin requests rejected
- Only same-origin requests accepted

**Pass/Fail:** ___

---

## Performance Testing

### PERF1: Landing Page Load Time
**Steps:**
1. Clear browser cache
2. Navigate to `/`
3. Measure time to First Contentful Paint (FCP)
4. Measure time to Largest Contentful Paint (LCP)

**Expected Results:**
- FCP: < 2 seconds
- LCP: < 3 seconds
- Page interactive: < 4 seconds

**Pass/Fail:** ___

---

### PERF2: Login Page Load Time
**Steps:**
1. Clear browser cache
2. Navigate to `/login`
3. Measure page load metrics

**Expected Results:**
- Page fully interactive: < 3 seconds
- Form elements responsive immediately

**Pass/Fail:** ___

---

### PERF3: Authentication Response Time
**Steps:**
1. Authenticate with customer credentials
2. Time from form submission to page navigation

**Expected Results:**
- Response time: 1-3 seconds (depending on server response)
- No noticeable lag during processing

**Pass/Fail:** ___

---

## Summary and Sign-Off

| Test Suite | Tests | Passed | Failed | Status |
|-----------|-------|--------|--------|--------|
| TC1: Landing Page | 3 | __ | __ | ___ |
| TC2: Customer Auth | 6 | __ | __ | ___ |
| TC3: Admin Auth | 5 | __ | __ | ___ |
| TC4: Protected Routes | 6 | __ | __ | ___ |
| TC5: Middleware | 4 | __ | __ | ___ |
| TC6: Callbacks | 2 | __ | __ | ___ |
| TC7: Errors | 3 | __ | __ | ___ |
| TC8: Cross-Platform | 3 | __ | __ | ___ |
| Security Tests | 4 | __ | __ | ___ |
| Performance Tests | 3 | __ | __ | ___ |
| **TOTAL** | **39** | **__** | **__** | **___** |

### Overall Assessment
- [ ] All critical tests passed
- [ ] All security tests passed
- [ ] Performance within acceptable range
- [ ] Ready for production deployment

**Tested By:** _____________  
**Date:** _____________  
**Sign-Off:** _____________

---

## Known Issues and Workarounds

### Issue: Password field not clearing after error
**Workaround:** Manually clear or check browser's password manager settings

### Issue: Dark mode toggle not affecting auth pages
**Workaround:** Refresh page after changing theme

### Issue: Callback URL not working in mobile Safari
**Workaround:** Use alternative authentication method (magic link)

---

## Notes for Future Enhancements

1. Add 2FA for admin accounts
2. Implement rate limiting on login attempts
3. Add "Remember me" functionality for customer login
4. Implement biometric authentication on supported devices
5. Add audit logging for all authentication events
6. Implement passwordless authentication option
7. Add SSO integration (OAuth providers)

---

**Document Version:** 1.0  
**Last Updated:** January 4, 2026  
**Status:** Ready for Testing
