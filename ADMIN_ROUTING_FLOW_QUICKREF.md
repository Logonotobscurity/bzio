# Admin Routing Flow - Quick Reference Guide
**Date:** January 9, 2026 | **Status:** ✅ VERIFIED & VALIDATED

---

## 🚀 Quick Start Reference

### Admin Login Flow (Most Common Path)
```
1. Navigate to /admin/login
   └─ Shows: AdminLoginPageContent (form component)

2. Enter credentials: email + password
   └─ Form validates: email format

3. Click "Sign In"
   └─ Calls: signIn('credentials', {email, password})

4. NextAuth validates:
   └─ Password matches with bcrypt ✓
   └─ User role is 'admin' ✓

5. Session created:
   └─ JWT token stored in httpOnly cookie
   └─ Includes: id, role, firstName, email, etc.

6. Redirect to /admin
   └─ Middleware allows (token.role === 'admin')
   └─ Page loads dashboard with initial data

7. Dashboard displays:
   └─ Metrics cards
   └─ Activity feed
   └─ Quotes, users, newsletter, forms tabs
   └─ Manual & auto-refresh controls
```

---

## 📍 Critical Files (Edit These to Change Behavior)

### Login Page
**File:** `src/app/admin/login/page.tsx`
- Server-side redirects for authenticated users
- Change: Who can see the login form

**File:** `src/app/admin/login/admin-login-content.tsx`
- Client-side login form
- Change: Form validation, error messages, styling

### Dashboard Page
**File:** `src/app/admin/page.tsx`
- Server-side data fetching
- Change: Which data loads initially, query parameters

**File:** `src/app/admin/_components/AdminDashboardClient.tsx` ⚠️ FIXED
- Client-side dashboard UI & refresh logic
- Change: Dashboard layout, refresh behavior, tabs

### Middleware & Auth
**File:** `middleware.ts`
- Route protection logic
- Change: Which routes require auth, redirect paths

**File:** `src/lib/auth/config.ts`
- NextAuth configuration
- Change: Auth providers, JWT enrichment, callbacks

**File:** `src/lib/auth-constants.ts`
- All paths and role values
- Change: Path names, role definitions

### APIs
**File:** `src/app/api/admin/dashboard-data/route.ts`
- Dashboard data endpoint
- Change: Which data included in response

**File:** `src/app/api/admin/login/route.ts`
- Admin login API (if using direct API)
- Change: Login validation, security rules

---

## 🔍 Common Debugging Steps

### Issue: User can't log in
```
1. Check: Is email in database with role='admin' (lowercase)?
   → Query: SELECT email, role FROM "User" WHERE email=...

2. Check: Is password correctly hashed with bcrypt?
   → Verify with: bcrypt.compareSync(plaintext, hash)

3. Check: Browser console for error messages
   → Look for: Toast notifications, network tab

4. Check: Database connection
   → Verify: DATABASE_URL in .env.local

5. Check: NextAuth configuration
   → Verify: providers, callbacks, session strategy
```

### Issue: Logged-in user redirected back to login
```
1. Check: Is session expired?
   → JWT tokens have expiration (default: 30 days)
   → Look for: Set-Cookie headers in Network tab

2. Check: Is middleware blocking?
   → Run middleware locally with logs
   → Check: console.log() statements

3. Check: Is role still 'admin' in database?
   → Query: SELECT role FROM "User" WHERE id=...

4. Check: Browser cookies
   → Look for: next-auth.session-token cookie
   → Verify: Cookie is readable, not expired
```

### Issue: Dashboard not loading data
```
1. Check: API endpoint is working
   → Try: curl -H "Authorization: Bearer <token>" \
            http://localhost:3000/api/admin/dashboard-data

2. Check: Database has data
   → Query: SELECT COUNT(*) FROM "Activity"
   → Query: SELECT COUNT(*) FROM "Quote"
   → etc.

3. Check: Server-side action functions
   → Verify: getRecentActivities, getActivityStats, etc.
   → Check: No errors in server logs

4. Check: Client component mounted
   → Look for: Console logs from AdminDashboardClient
   → Verify: Data passed from server component
```

### Issue: Too many requests / High API usage
```
1. Check: Auto-refresh is not toggled
   → Look for: "Auto-refreshing" button state
   → If enabled: Disable to test

2. Check: useEffect dependencies
   → Open: src/app/admin/_components/AdminDashboardClient.tsx
   → Find: useEffect with refreshData
   → Verify: dependency array is [autoRefresh] NOT [autoRefresh, refreshData]

3. Check: No duplicate components
   → Verify: AdminDashboardClient only renders once
   → Check: No parent re-renders causing child re-mount

4. Check: Network tab in DevTools
   → Count requests over time
   → Look for: Pattern of requests
   → If sporadic: Might be user clicking refresh
```

---

## 🧪 Testing Checklist

### Test Login Flow
- [ ] Navigate to /admin/login while unauthenticated → Shows form
- [ ] Already logged in as admin → Redirects to /admin
- [ ] Already logged in as customer → Redirects to /account
- [ ] Enter invalid email → Error message
- [ ] Enter wrong password → Error message
- [ ] Enter correct credentials → Redirects to /admin

### Test Dashboard Access
- [ ] Authenticated admin visits /admin → Loads dashboard
- [ ] Unauthenticated user visits /admin → Redirects to /admin/login
- [ ] Authenticated customer visits /admin → Redirects to /unauthorized
- [ ] Tokens revoked → Next request redirects to /admin/login

### Test Data Loading
- [ ] Initial data loads on page load
- [ ] Click refresh button → Updates data (look for timestamp)
- [ ] Enable auto-refresh → Sees updates every 30 seconds
- [ ] Disable auto-refresh → No automatic requests
- [ ] Network slow → Shows loading state
- [ ] API returns error → Shows fallback or error message

### Test Request Optimization
- [ ] Monitor Network tab while auto-refresh on
- [ ] Should see ~1 request per 30 seconds (not 10+)
- [ ] Click refresh while previous still loading → Cancels old request
- [ ] No duplicate tabs open → Normal request rate

---

## 🔧 Configuration Reference

### Environment Variables (.env.local)
```env
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-string>

# Database
DATABASE_URL=postgres://...

# Email (optional, for email sign-in)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=...
EMAIL_SERVER_PASSWORD=...
EMAIL_FROM=noreply@example.com
```

### Database Schema
```sql
User table:
- id (primary key)
- email (unique)
- hashedPassword (bcrypt hash)
- role ('admin' or 'customer')
- firstName, lastName, companyName, phone
- isNewUser (boolean)
- lastLogin (timestamp)
```

---

## 📊 Performance Metrics

### Request Baseline (Expected Numbers)
```
Initial page load: 6-8 requests
- 1x getRecentActivities
- 1x getActivityStats
- 1x getQuotes
- 1x getNewUsers
- 1x getNewsletterSubscribers
- 1x getFormSubmissions
- 1-2x static assets

With auto-refresh enabled: ~1 request per 30 seconds
- Each interval triggers 1 dashboard-data call
- No dependencies re-trigger

Manual refresh click: 1 request per click
- Aborts previous if still pending
- Single request, not duplicated
```

### Performance Optimization Already Applied ✓
```
✓ Server-side data fetching (page.tsx)
✓ Promise.allSettled for parallel requests
✓ Reduced pagination: 20 items per query (from 50)
✓ Client-side request deduplication (AbortController)
✓ ETag caching support (304 Not Modified)
✓ Stable useEffect dependencies
✓ Single active interval when auto-refresh on
```

---

## 🚨 Security Best Practices

### What's Already Protected ✓
```
✓ Passwords hashed with bcryptjs (10 rounds)
✓ JWT tokens stored in httpOnly cookies
✓ Middleware validates role on every request
✓ API routes check session & admin role
✓ Email format validation
✓ CSRF protection (next-auth default)
✓ No sensitive data in JWT
```

### What You Should Do
```
⚠️ Regular password requirements for admins
⚠️ Monitor admin login attempts (logs in activity table)
⚠️ Periodic access review (who has admin role?)
⚠️ Rotate NEXTAUTH_SECRET periodically
⚠️ Use HTTPS in production
⚠️ Set secure cookie flags in production
```

---

## 🔗 Route Map

### Public Routes
```
GET  /                      → Home page
GET  /login                 → Customer login
GET  /register              → Registration page
GET  /admin/login           → Admin login
```

### Protected Customer Routes
```
GET  /account               → Customer dashboard
GET  /account/orders        → Customer orders
GET  /account/quotes        → Customer quotes
GET  /account/profile       → Profile settings
```

### Protected Admin Routes
```
GET  /admin                 → Admin dashboard (primary)
GET  /admin/products        → Product management
GET  /admin/customers       → Customer list
GET  /admin/quotes          → Quote management
GET  /admin/orders          → Order management
```

### API Routes (All require session + role)
```
POST /api/admin/login                      → Admin login (direct)
GET  /api/admin/dashboard-data             → Dashboard data (main)
GET  /api/admin/dashboard-data-fallback    → Dashboard data (backup)
GET  /api/admin/users                      → User list
GET  /api/admin/quotes                     → Quote list
GET  /api/admin/customers                  → Customer list
POST /api/admin/setup                      → Admin setup
```

---

## 🎓 Key Concepts

### JWT Token Enrichment
```javascript
// In lib/auth/config.ts callbacks.jwt
if (user) {
  token.id = user.id;
  token.role = user.role;        // ← This is critical
  token.firstName = user.firstName;
  // ... other fields
}
// Result: token.role available in middleware & API routes
```

### Middleware Pattern
```javascript
// Check is admin:
const isAdmin = token?.role === USER_ROLES.ADMIN;  // 'admin' string

// Protect route:
if (isProtectedAdminRoute && !isAdmin) {
  return NextResponse.redirect(new URL(REDIRECT_PATHS.ADMIN_LOGIN, req.url));
}
```

### useEffect Dependency Array
```javascript
// ❌ WRONG - causes infinite loops
useEffect(() => {
  setInterval(() => refreshData());
}, [autoRefresh, refreshData]);  // refreshData changes often

// ✅ CORRECT - stable interval
useEffect(() => {
  setInterval(() => refreshData());
}, [autoRefresh]);  // Only changes on toggle
```

---

## 📞 Support Resources

### Code Files
- **Routing:** `middleware.ts`, `src/lib/auth-constants.ts`
- **Login:** `src/app/admin/login/` folder
- **Dashboard:** `src/app/admin/page.tsx`, `src/app/admin/_components/`
- **Auth Config:** `src/lib/auth/config.ts`
- **API Routes:** `src/app/api/admin/`, `src/app/api/auth/`

### Documentation
- **Verification Report:** `ADMIN_ROUTING_FLOW_VERIFICATION.md`
- **Diagrams:** `ADMIN_ROUTING_FLOW_DIAGRAMS.md`
- **This Guide:** `ADMIN_ROUTING_FLOW_QUICKREF.md`

### Database
- **ORM:** Prisma (schema.prisma)
- **Tables:** User, Activity, Quote, Newsletter, FormSubmission, etc.

---

**Created:** January 9, 2026  
**Status:** ✅ PRODUCTION READY  
**Last Updated:** January 9, 2026
