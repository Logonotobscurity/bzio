# Admin Routing Flow - Visual Diagrams
**Date:** January 9, 2026

---

## 1️⃣ Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ADMIN LOGIN & DASHBOARD FLOW                    │
└─────────────────────────────────────────────────────────────────────┘

START: User visits /admin/login
│
├─────────────────────────────────────────────────────────────────────
│ STEP 1: Admin Login Page (Server Component)
├─────────────────────────────────────────────────────────────────────
│ 
├─→ const session = await auth()
│
├─→ if (session?.user?.role === 'admin')
│   └─→ redirect('/admin')  [Go to Step 2]
│
├─→ if (session?.user)
│   └─→ redirect('/account')  [Exit - Customer route]
│
└─→ Return: <AdminLoginPageContent />  [Show login form]
    │
    └─────────────────────────────────────────────────────────────────
      STEP 1B: Admin Login Form (Client Component)
      └─────────────────────────────────────────────────────────────────
      │
      ├─ User enters: email + password
      ├─ Form validates: email format
      └─ Submit: signIn('credentials', {email, password, redirect: false})
         │
         └─→ HTTP POST to NextAuth handler
            │
            └─────────────────────────────────────────────────────────────
              STEP 1C: NextAuth Credentials Provider
              └─────────────────────────────────────────────────────────────
              │
              ├─ Get credentials from request
              ├─ Find user: prisma.user.findUnique({where: {email}})
              │   │
              │   ├─ Not found? → Return null [Go to Error]
              │   └─ Found?
              │
              ├─ Check role: if (user.role !== 'admin')
              │   └─ Return null [Go to Error]
              │
              ├─ Compare password: bcrypt.compare(password, hashedPassword)
              │   │
              │   ├─ No match? → Return null [Go to Error]
              │   └─ Match? → Continue
              │
              └─ Return enriched user object {id, role, email, ...}
                 │
                 └─ NextAuth JWT Callback:
                    │
                    ├─ token.id = user.id
                    ├─ token.role = 'admin'
                    ├─ token.firstName = user.firstName
                    └─ ... (other fields)
                       │
                       └─ Session created with JWT
                          │
                          └─ Response to client: {ok: true, ...}

                             [SUCCESS]
                             │
                             └─→ Router.push('/admin')  [Go to Step 2]

─────────────────────────────────────────────────────────────────────
│ STEP 2: Admin Dashboard Page (Server Component - Protected)
─────────────────────────────────────────────────────────────────────
│
├─ Middleware intercepts request to /admin
│  │
│  ├─ Check: isProtectedAdminRoute? YES
│  ├─ Check: isAuth? YES (token exists)
│  ├─ Check: isAdmin? YES (token.role === 'admin')
│  └─ Allow: NextResponse.next()
│
├─ Page component executes:
│  │
│  ├─ const session = await auth()
│  ├─ Check: if (!session?.user || role !== 'admin')
│  │   └─ Redirect('/admin/login')  [Back to Step 1]
│  │
│  └─ Fetch initial data (Server-side):
│     ├─ getRecentActivities(20)
│     ├─ getActivityStats()
│     ├─ getQuotes(undefined, 20)
│     ├─ getNewUsers(20)
│     ├─ getNewsletterSubscribers(20)
│     └─ getFormSubmissions(20)
│
└─ Render: <AdminDashboardClient {...initialData} />

   ─────────────────────────────────────────────────────────────────
   │ STEP 2B: Admin Dashboard Client (Client Component)
   ─────────────────────────────────────────────────────────────────
   │
   ├─ Render dashboard UI:
   │  ├─ Metrics cards with stats
   │  ├─ Activity feed tab
   │  ├─ Quotes tab
   │  ├─ Users tab
   │  ├─ Newsletter subscribers tab
   │  └─ Form submissions tab
   │
   ├─ User can:
   │  ├─ Click "Refresh" button → calls refreshData()
   │  │   └─ Sends: GET /api/admin/dashboard-data
   │  │      └─ API validates: getServerSession() ✓ admin role ✓
   │  │      └─ Returns: {stats, activities, quotes, ...}
   │  │
   │  └─ Toggle "Auto-refresh" → sets interval
   │      └─ Every 30 seconds: calls refreshData()
   │      └─ Uses AbortController to prevent concurrent requests
   │
   └─ [AUTHENTICATED SESSION MAINTAINED]
      └─ All requests include JWT token in cookie
      └─ API routes verify token validity

END: Admin viewing dashboard
```

---

## 2️⃣ Middleware Decision Tree

```
┌────────────────────────────────────────────────────────────────────┐
│ REQUEST ARRIVES AT MIDDLEWARE                                      │
└────────────────────────────────────────────────────────────────────┘
                             │
                             ↓
                    Extract token from session
                    (via next-auth/middleware)
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
        ↓                                         ↓
    Token exists?                            NO TOKEN
        │                                         │
       YES                                        ├─ Path is public?
        │                                         │  ├─ YES → allow ✓
        │                                         │  └─ NO → continue
        │                                         │
        │                                    Need auth?
        │                                         │
        │                                    ┌────┴────┐
        │                                   YES        NO
        │                                    │          │
        │                          Redirect to    Allow ✓
        │                          /admin/login
        │
        ├─ Extract role from token
        │
        ↓
    Check route type:
    │
    ├─────────────────────────────────────────────────────────┐
    │                                                          │
    ↓                    ↓                    ↓                ↓
ADMIN             CUSTOMER              LOGIN/AUTH         OTHER
AUTH              ROUTES                ROUTES            ROUTES
ROUTES          (/account/*)         (/login, /register)
(/admin/*)
    │                  │                    │                │
    │              Role check           Redirect          Allow ✓
    │                  │                  check
    │          ┌───────┴────────┐         │
    │          │                │      ┌──┴────┐
    │      ADMIN?           USER?    ADMIN?   OTHER?
    │        │                │        │        │
    │       YES              YES      YES      NO
    │        │                │        │        │
    │    ALLOW ✓      REDIRECT TO   Redirect  ALLOW ✓
    │                 /unauthorized  TO /admin
    │
    ├─────────────────────────────────────────────────────────┐
    │                                                          │
    ↓                                                          ↓
LOGIN PAGE                                              AUTH ROUTES
(/admin/login)                                        (/admin/login)
    │                                                          │
    ├─ Admin? → Redirect to /admin                           │
    └─ User? → Redirect to /account                          │
                                                            Always allow
                                                         (redirect handled)
```

---

## 3️⃣ API Route Authorization Flow

```
┌────────────────────────────────────────────────────────────────────┐
│ API REQUEST: GET /api/admin/dashboard-data                         │
└────────────────────────────────────────────────────────────────────┘
                             │
                             ↓
              const session = await getServerSession()
                             │
                    ┌────────┴────────┐
                    │                 │
                   YES                NO
                    │                 │
                    ↓                 ↓
            Check user exists    Return 401
                    │           (Unauthorized)
                    ↓
            Check role field
                    │
            ┌───────┴────────┐
            │                │
         ADMIN              ELSE
            │                │
           YES               NO
            │                │
            ↓                ↓
      Execute query    Return 403
      Fetch data      (Forbidden)
            │
            ↓
      Return 200 + data
      {stats, activities, ...}
```

---

## 4️⃣ Authentication Session Flow

```
┌────────────────────────────────────────────────────────────────────┐
│ INITIAL STATE: No session, user at /admin/login                    │
└────────────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌────────────────────────────────────────────────────────────────────┐
│ FORM SUBMISSION                                                    │
│ POST /api/auth/callback/credentials                                │
│ {email: "admin@example.com", password: "***"}                     │
└────────────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌────────────────────────────────────────────────────────────────────┐
│ NEXTAUTH CREDENTIALS PROVIDER FLOW                                 │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  1. const user = await prisma.user.findUnique({where: {email}})   │
│     │                                                             │
│     ├─ Found? Continue                                           │
│     └─ Not found? Return null → Error response                   │
│                                                                  │
│  2. Check: user.role === 'admin'                                 │
│     │                                                            │
│     ├─ TRUE? Continue                                            │
│     └─ FALSE? Return null → Error response                       │
│                                                                  │
│  3. const match = await bcrypt.compare(password, hashed)         │
│     │                                                            │
│     ├─ TRUE? Continue                                            │
│     └─ FALSE? Return null → Error response                       │
│                                                                  │
│  4. return {...user, id: user.id}  ✓ Authenticated              │
│                                                                  │
└────────────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌────────────────────────────────────────────────────────────────────┐
│ JWT CALLBACK                                                       │
│ token.id = user.id                                                 │
│ token.role = user.role                                             │
│ token.firstName = user.firstName                                   │
│ token.email = user.email                                           │
│ token.isNewUser = user.isNewUser                                   │
│ ... (other fields)                                                 │
└────────────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌────────────────────────────────────────────────────────────────────┐
│ SESSION CALLBACK                                                   │
│ session.user.id = token.id                                         │
│ session.user.role = token.role ← "admin"                           │
│ session.user.firstName = token.firstName                           │
│ session.user.email = token.email                                   │
│ ... (all token fields)                                             │
└────────────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌────────────────────────────────────────────────────────────────────┐
│ RESPONSE TO CLIENT                                                 │
│ Set-Cookie: next-auth.session-token=<jwt>                         │
│ Redirect: /admin                                                   │
└────────────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌────────────────────────────────────────────────────────────────────┐
│ MIDDLEWARE PROCESSES REDIRECT TO /admin                            │
│                                                                    │
│  1. Extract token from session-token cookie                       │
│  2. token.role === 'admin'? YES ✓                                 │
│  3. NextResponse.next() → Allow access                            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌────────────────────────────────────────────────────────────────────┐
│ ADMIN DASHBOARD PAGE LOADS                                         │
│                                                                    │
│  1. const session = await auth()                                  │
│  2. session.user.role === 'admin'? YES ✓                          │
│  3. Fetch all dashboard data (server-side)                        │
│  4. Pass to AdminDashboardClient component                        │
│  5. Render dashboard UI                                           │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌────────────────────────────────────────────────────────────────────┐
│ SESSION MAINTAINED                                                 │
│                                                                    │
│ Future requests include:                                           │
│ Cookie: next-auth.session-token=<jwt>                             │
│                                                                    │
│ API routes call:                                                   │
│ const session = await getServerSession()                          │
│ → Automatically decodes JWT from cookie                           │
│ → Returns session with all user fields                            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 5️⃣ Request Count Optimization

```
┌────────────────────────────────────────────────────────────────────┐
│ BEFORE FIX (200+ Requests Issue)                                   │
└────────────────────────────────────────────────────────────────────┘

useEffect(() => {
  if (!autoRefresh) return;
  
  setInterval(() => {
    refreshData(0);  // Request 1
  }, 30000);
  
}, [autoRefresh, refreshData]);  // ❌ BAD DEPENDENCY
       ↑                ↑
       └──── When autoRefresh toggles, refreshData is recreated
            because lastUpdated changed (from setLastUpdated in refreshData)

Timeline:
┌─────┬──────┬──────┬──────┬──────┬──────┐
│  T  │ T+1s │ T+2s │ T+3s │ T+4s │ T+5s │
├─────┼──────┼──────┼──────┼──────┼──────┤
│USER │      │      │      │      │      │
│TOGGLES│    │      │      │      │      │
│REFRESH  │   │      │      │      │      │
└─────┴──────┴──────┴──────┴──────┴──────┘
  │        │       │       │       │
  Effect  lastUpdated changes
  runs ↓   → refreshData recreated
  setInt   → Effect re-runs
  └─────   → New interval created
           → MULTIPLE INTERVALS NOW ACTIVE
           
Result: 3-5 intervals running simultaneously
        All triggering requests every 30 seconds
        Plus additional requests when effect re-runs
        = 200+ requests in minutes ❌


┌────────────────────────────────────────────────────────────────────┐
│ AFTER FIX (Stable Request Rate)                                    │
└────────────────────────────────────────────────────────────────────┘

useEffect(() => {
  if (!autoRefresh) return;
  
  setInterval(() => {
    refreshData(0);  // Request 1, then 2, then 3...
  }, 30000);
  
}, [autoRefresh]);  // ✅ CORRECT DEPENDENCY
    ↑
    Effect only re-runs when autoRefresh changes (toggle on/off)

Timeline:
┌──────┬────────┬────────┬────────┬────────┐
│ T=0s │ T=30s  │ T=60s  │ T=90s  │T=120s  │
├──────┼────────┼────────┼────────┼────────┤
│USER  │        │        │        │        │
│ENABLES│       │        │        │        │
│REFRESH│       │        │        │        │
└──────┴────────┴────────┴────────┴────────┘
  │      │        │        │        │
  Effect │        │        │        │
  runs   REQ→     │        │        │
  creates│        REQ→     │        │
  1      │        │        REQ→     │
  interval       │        │        REQ→
               
Result: 1 stable interval
        1 request every 30 seconds
        Total ~4 requests per 2 minutes ✅
        = Predictable, manageable load


Request Deduplication (Additional Protection):
┌─────────────────────────────────────────┐
│ if (pendingRequest) {                   │
│   pendingRequest.abort();               │
│ }                                       │
│                                         │
│ const controller = new AbortController();
│ setPendingRequest(controller);          │
│                                         │
│ await fetch(url, {                      │
│   signal: controller.signal             │
│ });                                     │
└─────────────────────────────────────────┘

Effect: Even if multiple requests start, only latest
        proceeds - previous ones are aborted
        Prevents slow/hung requests from accumulating
```

---

## 6️⃣ Error & Edge Case Handling

```
┌─────────────────────────────────────────────────────────────────────┐
│ SCENARIO 1: Invalid Credentials                                     │
└─────────────────────────────────────────────────────────────────────┘
User → /admin/login → Enter wrong password
                      │
                      ↓
                   signIn()
                      │
                      ↓
            Credentials Provider
                      │
         bcrypt.compare() returns FALSE
                      │
                      ↓
              Return null (Failed)
                      │
                      ↓
            result?.error = true
                      │
                      ↓
          Toast: "Authentication Failed"
          Form stays on login page


┌─────────────────────────────────────────────────────────────────────┐
│ SCENARIO 2: Non-Admin User Tries to Access /admin                   │
└─────────────────────────────────────────────────────────────────────┘
Authenticated customer user → Visits /admin
                              │
                              ↓
                          Middleware
                              │
              isProtectedAdminRoute? YES
              isAuth? YES
              isAdmin? NO (role === 'customer')
                              │
                              ↓
                Redirect to /unauthorized


┌─────────────────────────────────────────────────────────────────────┐
│ SCENARIO 3: Session Expires                                         │
└─────────────────────────────────────────────────────────────────────┘
Admin viewing dashboard → Session expires
                         │
                         ↓
                    Next request
                         │
              getServerSession() returns null
                         │
                         ↓
              Not authenticated anymore
                         │
                         ↓
         Redirect to /admin/login
       (User must re-authenticate)


┌─────────────────────────────────────────────────────────────────────┐
│ SCENARIO 4: Dashboard API Request Fails                             │
└─────────────────────────────────────────────────────────────────────┘
User clicks "Refresh" → Sends request to /api/admin/dashboard-data
                        │
                        ↓
                 response.ok === false
                        │
                        ↓
              Try fallback endpoint:
              /api/admin/dashboard-data-fallback
                        │
                        ↓
                  Uses cached data or
                  returns partial response
                        │
                        ↓
        Display: "Some data unavailable"
        Show: Last known values


┌─────────────────────────────────────────────────────────────────────┐
│ SCENARIO 5: Auto-Refresh Enabled, No Changes                        │
└─────────────────────────────────────────────────────────────────────┘
Auto-refresh interval triggers → Calls refreshData()
                                 │
                                 ↓
                          Fetch with ETag header:
                          If-None-Match: <lastUpdated>
                                 │
                                 ↓
                          Server returns 304
                         (Not Modified)
                                 │
                                 ↓
         Skip update, use cached data
              No re-render triggered
                   Zero latency ✓
```

---

## 7️⃣ Referer & State Validation

```
┌─────────────────────────────────────────────────────────────────────┐
│ NEXT-AUTH FLOW STATE MANAGEMENT                                     │
└─────────────────────────────────────────────────────────────────────┘

1. LOGIN INITIATION
   ├─ Form submits to signIn('credentials', {..., redirect: false})
   ├─ redirect: false = Don't auto-redirect (we handle it)
   └─ Response includes: ok (boolean), error (string)

2. ERROR HANDLING
   ├─ result?.error → Toast notification
   ├─ Validation error? → Clear form field only
   └─ Auth failed? → Request user re-enter credentials

3. SUCCESS HANDLING
   ├─ result?.ok === true
   ├─ Session automatically created
   ├─ JWT token stored in httpOnly cookie
   ├─ Session data available to all requests
   └─ Redirect to /admin dashboard

4. STATE CONSISTENCY
   ├─ Session-token cookie persists across requests
   ├─ Next.js automatically includes in all requests
   ├─ API routes access via getServerSession()
   ├─ Client-side access via useSession() hook
   └─ Client components can check: session?.user?.role

Result: Single source of truth for auth state
        ↓
        No manual state management needed
        ↓
        Consistent across entire app
```

---

**Visual Flow Diagrams Complete ✅**  
All routing, authentication, and request flows documented with ASCII diagrams
