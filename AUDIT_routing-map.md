# Routing Map and Analysis

## Route Structure Overview

### Authentication Routes

#### Customer Authentication
```
/login                          → src/app/login/page.tsx (selection page)
  ├─ /login/customer            → src/app/login/customer/page.tsx
  └─ /auth/customer/login       → src/app/auth/customer/login/page.tsx ⚠️ DUPLICATE

Status: ⚠️ CONFLICT - Two paths for customer login
Recommendation: Keep /login/customer, redirect /auth/customer/login
```

#### Admin Authentication
```
/admin/login                    → src/app/admin/login/page.tsx
/auth/admin/login               → src/app/auth/admin/login/page.tsx ⚠️ DUPLICATE

Status: ⚠️ CONFLICT - Two paths for admin login
Recommendation: Keep /admin/login, remove /auth/admin/login
```

#### Auth Utilities
```
/auth/verify-request            → src/app/auth/verify-request/page.tsx
/auth/error                     → src/app/auth/error/page.tsx
/auth/choose-role               → src/app/auth/choose-role/page.tsx
```

---

### Admin Routes (Protected)

```
/admin                          → src/app/admin/page.tsx (redirect to dashboard)
/admin/dashboard                → src/app/admin/dashboard/page.tsx

/admin/customers                → src/app/admin/customers/page.tsx
  ├─ /admin/customers/new       → src/app/admin/customers/new/page.tsx
  └─ /admin/customers/[id]/edit → src/app/admin/customers/[id]/edit/page.tsx (dynamic)

/admin/products                 → src/app/admin/products/page.tsx
  ├─ /admin/products/new        → src/app/admin/products/new/page.tsx
  ├─ /admin/products/[id]/edit  → src/app/admin/products/[id]/edit/page.tsx (dynamic)
  └─ /admin/products/[id]/stock → src/app/admin/products/[id]/stock/page.tsx (dynamic)

/admin/crm-sync                 → src/app/admin/crm-sync/page.tsx

Middleware Protection: ✅ All /admin/* routes protected by middleware.ts
Role Check: ✅ Requires USER_ROLES.ADMIN
```

---

### Customer Routes (Protected)

```
/account                        → src/app/account/page.tsx
/dashboard                      → src/app/dashboard/page.tsx ⚠️ AMBIGUOUS

Status: ⚠️ UNCLEAR - Is /dashboard for customers or separate?
Recommendation: Clarify purpose or redirect to /account
```

---

### Product Routes (Public)

```
/products                       → src/app/products/page.tsx
  ├─ /products/[slug]           → src/app/products/[slug]/page.tsx (dynamic product detail)
  │
  ├─ /products/brand/[slug]     → src/app/products/brand/[slug]/page.tsx (products by brand)
  ├─ /products/brands           → src/app/products/brands/page.tsx (all brands)
  ├─ /products/brands/[slug]    → src/app/products/brands/[slug]/route.ts ⚠️ ROUTE HANDLER
  │
  ├─ /products/category/[slug]  → src/app/products/category/[slug]/page.tsx (products by category)
  ├─ /products/categories       → src/app/products/categories/page.tsx (all categories)
  └─ /products/categories/[slug]→ src/app/products/categories/[slug]/route.ts ⚠️ ROUTE HANDLER

Status: ⚠️ MIXED - Some use page.tsx, some use route.ts
Issue: /products/brands/[slug] has BOTH route.ts AND page.tsx pattern conflicts
```

---

### Company Routes (Public)

```
/companies                      → src/app/companies/page.tsx
  └─ /companies/[slug]          → src/app/companies/[slug]/page.tsx (dynamic)

/suppliers                      → src/app/suppliers/page.tsx
/customers                      → src/app/customers/page.tsx

Status: ⚠️ NAMING - /customers is public page, conflicts with /admin/customers
```

---

### Quote & Checkout Routes

```
/checkout                       → src/app/checkout/page.tsx
/guest-quote                    → src/app/guest-quote/page.tsx

Status: ✅ Clear separation
```

---

### Content Routes (Public)

```
/about                          → src/app/about/page.tsx
/contact                        → src/app/contact/page.tsx
/faq                            → src/app/faq/page.tsx
/careers                        → src/app/careers/page.tsx
/compliance                     → src/app/compliance/page.tsx
/news                           → src/app/news/page.tsx

/resources                      → src/app/resources/page.tsx
  └─ /resources/[slug]          → src/app/resources/[slug]/page.tsx (dynamic)

Status: ✅ Standard content pages
```

---

### API Routes

#### Admin API
```
/api/admin/dashboard-data       → src/app/api/admin/dashboard-data/route.ts
/api/admin/dashboard-data-fallback → src/app/api/admin/dashboard-data-fallback/route.ts
/api/admin/customers            → src/app/api/admin/customers/route.ts
  └─ /api/admin/customers/[id]  → src/app/api/admin/customers/[id]/route.ts (dynamic)
/api/admin/customers/data       → src/app/api/admin/customers/data/route.ts
/api/admin/quotes               → src/app/api/admin/quotes/route.ts
/api/admin/quote-messages       → src/app/api/admin/quote-messages/route.ts
/api/admin/notifications        → src/app/api/admin/notifications/route.ts
  └─ /api/admin/notifications/[id] → src/app/api/admin/notifications/[id]/route.ts (dynamic)
/api/admin/forms                → src/app/api/admin/forms/route.ts
/api/admin/newsletter           → src/app/api/admin/newsletter/route.ts
/api/admin/orders               → src/app/api/admin/orders/route.ts
/api/admin/export               → src/app/api/admin/export/route.ts
/api/admin/errors               → src/app/api/admin/errors/route.ts
/api/admin/db-diagnostics       → src/app/api/admin/db-diagnostics/route.ts
/api/admin/crm-sync             → src/app/api/admin/crm-sync/route.ts
/api/admin/login                → src/app/api/admin/login/route.ts
/api/admin/setup                → src/app/api/admin/setup/route.ts
/api/admin/users                → src/app/api/admin/users/route.ts
```

#### Auth API
```
/api/auth/[...nextauth]         → src/app/api/auth/[...nextauth]/route.ts (NextAuth handler)
/api/auth/register              → src/app/api/auth/register/route.ts
/api/auth/forgot-password       → src/app/api/auth/forgot-password/route.ts
/api/auth/reset-password        → src/app/api/auth/reset-password/route.ts
/api/auth/password-changed      → src/app/api/auth/password-changed/route.ts
/api/auth/debug                 → src/app/api/auth/debug/route.ts
```

#### User API
```
/api/user/profile               → src/app/api/user/profile/route.ts
/api/user/activities            → src/app/api/user/activities/route.ts
/api/user/addresses             → src/app/api/user/addresses/route.ts
  └─ /api/user/addresses/[id]   → src/app/api/user/addresses/[id]/route.ts (dynamic)
/api/user/cart                  → src/app/api/user/cart/route.ts
  └─ /api/user/cart/items/[id]  → src/app/api/user/cart/items/[id]/route.ts (dynamic) ⚠️ BUG
/api/user/send-email            → src/app/api/user/send-email/route.ts
```

#### Product API
```
/api/products                   → src/app/api/products/route.ts
  ├─ /api/products/[slug]       → src/app/api/products/[slug]/route.ts (dynamic)
  ├─ /api/products/brand/[slug] → src/app/api/products/brand/[slug]/route.ts (dynamic)
  └─ /api/products/category/[slug] → src/app/api/products/category/[slug]/route.ts (dynamic)

/api/categories                 → src/app/api/categories/route.ts
```

#### Quote API
```
/api/quote-requests             → src/app/api/quote-requests/route.ts
  └─ /api/quote-requests/[quoteRequestId] → src/app/api/quote-requests/[quoteRequestId]/route.ts (dynamic)

/api/v1/rfq/submit              → src/app/api/v1/rfq/submit/route.ts (versioned API)
```

#### Forms & Newsletter
```
/api/forms                      → src/app/api/forms/route.ts
  └─ /api/forms/submit          → src/app/api/forms/submit/route.ts
/api/newsletter-subscribe       → src/app/api/newsletter-subscribe/route.ts
```

#### Health & Monitoring
```
/api/health                     → src/app/api/health/route.ts
  ├─ /api/health/db             → src/app/api/health/db/route.ts
  ├─ /api/health/email          → src/app/api/health/email/route.ts
  └─ /api/health/whatsapp       → src/app/api/health/whatsapp/route.ts

/api/monitoring/metrics         → src/app/api/monitoring/metrics/route.ts
/api/monitoring/errors          → src/app/api/monitoring/errors/route.ts
/api/monitoring/web-vitals      → src/app/api/monitoring/web-vitals/route.ts

/api/diagnostics/database       → src/app/api/diagnostics/database/route.ts
/api/errors                     → src/app/api/errors/route.ts
```

#### Webhooks
```
/api/webhooks/resend            → src/app/api/webhooks/resend/route.ts
/api/webhooks/whatsapp          → src/app/api/webhooks/whatsapp/route.ts
```

#### Real-time
```
/api/realtime                   → src/app/api/realtime/route.ts
```

---

## Routing Issues & Conflicts

### 🔴 Critical Issues

1. **Duplicate Login Routes**
   - `/login/customer` vs `/auth/customer/login`
   - `/admin/login` vs `/auth/admin/login`
   - **Impact**: SEO penalties, user confusion
   - **Fix**: Remove `/auth/*` variants, add redirects

2. **Cart API Bug**
   - File: `src/app/api/user/cart/items/[id]/route.ts`
   - Line 81: Variable shadowing in DELETE handler
   - **Impact**: Potential runtime errors
   - **Fix**: Remove duplicate variable declaration

### 🟡 Medium Issues

3. **Product Route Inconsistency**
   - `/products/brands/[slug]` has both page.tsx pattern and route.ts
   - `/products/categories/[slug]` has both page.tsx pattern and route.ts
   - **Impact**: Routing ambiguity
   - **Fix**: Decide on page.tsx OR route.ts, not both

4. **Dashboard Ambiguity**
   - `/dashboard` vs `/account` - unclear separation
   - **Impact**: User confusion
   - **Fix**: Redirect /dashboard → /account or clarify purpose

5. **Customer Page Naming**
   - `/customers` (public) vs `/admin/customers` (admin)
   - **Impact**: Naming confusion
   - **Fix**: Rename public page to `/customer-stories` or `/testimonials`

### 🟢 Low Priority

6. **API Versioning**
   - Only `/api/v1/rfq/submit` is versioned
   - **Impact**: Future breaking changes difficult
   - **Recommendation**: Consider versioning strategy for all APIs

---

## Middleware Coverage

```typescript
// From middleware.ts config.matcher
matcher: [
  "/admin/:path*",      // ✅ All admin routes protected
  "/account/:path*",    // ✅ Customer routes protected
  "/login",             // ✅ Handles auth redirects
  "/login/customer",    // ✅ Handles auth redirects
  "/admin/login",       // ✅ Handles auth redirects
]
```

**Missing from Matcher**:
- `/auth/admin/login` - Not in matcher (should be removed anyway)
- `/auth/customer/login` - Not in matcher (should be removed anyway)
- `/dashboard` - Not protected (if it's a customer route, should be)

---

## Dynamic Route Patterns

### Product Detail
```
Pattern: /products/[slug]
Example: /products/coca-cola-500ml
File: src/app/products/[slug]/page.tsx
Params: { slug: string }
```

### Brand Products
```
Pattern: /products/brand/[slug]
Example: /products/brand/coca-cola
File: src/app/products/brand/[slug]/page.tsx
Params: { slug: string }
```

### Category Products
```
Pattern: /products/category/[slug]
Example: /products/category/beverages
File: src/app/products/category/[slug]/page.tsx
Params: { slug: string }
```

### Admin Customer Edit
```
Pattern: /admin/customers/[id]/edit
Example: /admin/customers/123/edit
File: src/app/admin/customers/[id]/edit/page.tsx
Params: { id: string }
```

### API Cart Item
```
Pattern: /api/user/cart/items/[id]
Example: /api/user/cart/items/abc123
File: src/app/api/user/cart/items/[id]/route.ts
Params: { id: string }
Methods: PUT, DELETE
⚠️ BUG in DELETE handler
```

---

## Lazy Loading Analysis

**No explicit lazy loading detected** in routing structure.

**Recommendations**:
- Consider lazy loading for:
  - Admin dashboard components
  - Chart libraries (Recharts)
  - Rich text editors (if any)
  - Large product grids

**Example Implementation**:
```typescript
const AdminDashboard = dynamic(() => import('@/components/admin/Dashboard'), {
  loading: () => <LoadingSkeleton />,
  ssr: false
})
```

---

## Route Validation Checklist

- [x] All admin routes protected by middleware
- [x] Dynamic routes use proper param handling
- [ ] ⚠️ Duplicate login routes need removal
- [ ] ⚠️ Product route.ts vs page.tsx conflicts
- [ ] ⚠️ Dashboard route needs clarification
- [x] API routes follow RESTful conventions
- [x] Versioned API exists (v1)
- [ ] ⚠️ Cart API has bug in DELETE handler

---

## Recommended Route Structure

```
/
├─ /login (selection)
│  ├─ /login/customer
│  └─ /login/admin (redirect to /admin/login)
│
├─ /admin/* (protected, admin only)
│  ├─ /admin/login
│  ├─ /admin/dashboard
│  ├─ /admin/customers
│  ├─ /admin/products
│  └─ /admin/quotes
│
├─ /account/* (protected, customer only)
│  ├─ /account (dashboard)
│  ├─ /account/profile
│  ├─ /account/orders
│  └─ /account/quotes
│
├─ /products
│  ├─ /products/[slug]
│  ├─ /products/brands
│  ├─ /products/brands/[slug]
│  ├─ /products/categories
│  └─ /products/categories/[slug]
│
├─ /companies
│  └─ /companies/[slug]
│
└─ /api
   ├─ /api/v1/* (versioned)
   ├─ /api/admin/*
   ├─ /api/user/*
   └─ /api/products/*
```

---

## Migration Commands

```bash
# Find all references to duplicate routes
findstr /s /i "auth/admin/login" src\**\*.tsx
findstr /s /i "auth/customer/login" src\**\*.tsx

# Find dashboard references
findstr /s /i "href=\"/dashboard\"" src\**\*.tsx

# Find product route references
findstr /s /i "products/brands" src\**\*.tsx
findstr /s /i "products/categories" src\**\*.tsx
```
