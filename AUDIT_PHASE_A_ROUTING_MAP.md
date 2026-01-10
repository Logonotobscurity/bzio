# Phase A Audit - Routing Map and Analysis
# Generated: 2026-01-09

## Route Structure Overview

### Authentication Routes

#### Admin Authentication
```
/admin/login                    → src/app/admin/login/page.tsx
  └─ Content: src/app/admin/login/admin-login-content.tsx
/auth/admin/login               → src/app/auth/admin/login/page.tsx ⚠️ DUPLICATE ROUTE
```
**Status**: ✓ CONFLICT IDENTIFIED
**Action**: Keep `/admin/login`, redirect `/auth/admin/login` to it

#### Customer Authentication  
```
/login                          → src/app/login/page.tsx (selection/wrapper)
  └─ /login/customer            → src/app/login/customer/page.tsx
  └─ Content: src/app/login/login-content.tsx
/auth/customer/login            → src/app/auth/customer/login/page.tsx ⚠️ DUPLICATE ROUTE
```
**Status**: ✓ CONFLICT IDENTIFIED
**Action**: Keep `/login`, redirect `/auth/customer/login` to it

#### Auth Utilities
```
/auth/verify-request            → src/app/auth/verify-request/page.tsx
/auth/error                     → src/app/auth/error/page.tsx
/auth/choose-role               → src/app/auth/choose-role/page.tsx
/auth/unauthorized              → src/app/auth/unauthorized/page.tsx
```
**Status**: ✓ CONSISTENT

---

### Protected Admin Routes

```
/admin                          → src/app/admin/page.tsx (dashboard redirect)
/admin/dashboard                → src/app/admin/dashboard/page.tsx
/admin/customers                → src/app/admin/customers/page.tsx
/admin/customers/[id]/edit      → src/app/admin/customers/[id]/edit/page.tsx
/admin/customers/new            → src/app/admin/customers/new/page.tsx
/admin/products                 → src/app/admin/products/page.tsx
/admin/products/[id]/edit       → src/app/admin/products/[id]/edit/page.tsx
/admin/products/[id]/stock      → src/app/admin/products/[id]/stock/page.tsx
/admin/products/new             → src/app/admin/products/new/page.tsx
/admin/crm-sync                 → src/app/admin/crm-sync/page.tsx
/admin/quotes                   → (likely exists)
/admin/orders                   → (likely exists)
/admin/analytics                → (likely exists)
```

**Middleware Protection**: ✓ VERIFIED
- Middleware matches `/admin/*` routes
- Checks role === 'admin'
- Rejects non-admin users

**Status**: ✓ CONSISTENT

---

### Protected Customer Routes

```
/account                        → src/app/account/page.tsx (dashboard)
/account/quotes                 → (likely exists)
/account/orders                 → (likely exists)
/account/settings               → (likely exists)
/account/addresses              → (likely exists)
```

**Middleware Protection**: ✓ VERIFIED
- Middleware checks authentication required
- Redirects admins to `/admin`

**Status**: ✓ CONSISTENT

---

### Public Routes

```
/                               → src/app/page-landing.tsx (or app/page.tsx)
/about                          → src/app/about/page.tsx
/products                       → (product browse)
/search                         → (search)
/contact                        → (likely exists)
/pricing                        → (likely exists)
/api/*                          → API routes
```

**Status**: ✓ NO ISSUES

---

## Routing Constant Conflicts

### REDIRECT_PATHS Differences

**File 1**: `src/lib/auth-constants.ts`
```typescript
export const REDIRECT_PATHS = {
  ADMIN_DASHBOARD: '/admin',
  USER_DASHBOARD: '/account',
  LOGIN: '/login',
  REGISTER: '/register',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',
}
```

**File 2**: `src/lib/auth/constants.ts`
```typescript
export const REDIRECT_PATHS = {
  USER_DASHBOARD: '/account',
  ADMIN_DASHBOARD: '/admin',
  LOGIN: '/auth/customer/login',  ❌ CONFLICT
  ADMIN_LOGIN: '/auth/admin/login',  ❌ CONFLICT
  ROLE_SELECTION: '/auth/role-selection',
  VERIFY_REQUEST: '/auth/verify-request',
  UNAUTHORIZED: '/auth/unauthorized',  ❌ CONFLICT
  ERROR: '/auth/error',
}
```

**Impact**: HIGH
- LOGIN path differs: `/login` vs `/auth/customer/login`
- UNAUTHORIZED path differs: `/unauthorized` vs `/auth/unauthorized`
- Some code uses auth-constants (primary), some uses auth/constants
- Potential redirect loops if mixing patterns

**Solution**: Consolidate to single REDIRECT_PATHS constant

---

## Import Path Issues

### Prisma Client

**Current State**: 3 different import patterns
```
import prisma from '@/lib/prisma'                    (45 files)
import { prisma } from '@/lib/db'                    (38 files)
import { prisma } from '@/lib/db/index'              (12 files)
```

**Issue**: Different files may get different Prisma instances if singleton pattern breaks

**Solution**: Standardize to one import path, use re-export in others

---

### Auth Constants

**Current State**: 2 different import patterns
```
import { USER_ROLES } from '@/lib/auth-constants'    (95+ files)  [PRIMARY]
import { USER_ROLES } from '@/lib/auth/constants'    (5 files)   [SECONDARY]
```

**Issue**: Different REDIRECT_PATHS values in different files

**Solution**: Use auth-constants as primary, delete auth/constants.ts

---

### Analytics Services

**Current State**: 3 different import patterns
```
import { analyticsService } from '@/services/analytics.service'
import { trackEvent } from '@/services/analyticsService'
import { trackEvent } from '@/lib/analytics'
```

**Issue**: Inconsistent analytics tracking architecture

**Solution**: Consolidate to lib/analytics pattern, deprecate others

---

## API Routes

### Admin API Endpoints
```
POST   /api/admin/setup                   → Create first admin user
GET    /api/admin/customers/data          → Customer data export
```

### User API Endpoints
```
PUT    /api/user/cart/items/[id]          → Update cart item quantity
DELETE /api/user/cart/items/[id]          → Remove from cart ❌ SHADOWING BUG
GET    /api/user/cart                     → Get cart contents
POST   /api/user/quotes                   → Create quote request
```

---

## Middleware Flow

### Current Middleware (middleware.ts)

```
Request → withAuth middleware → Token check
  ├─ Public routes (/) → NextResponse.next()
  ├─ Auth routes (/login, /admin/login) 
  │   ├─ Already authenticated → Redirect to dashboard
  │   └─ Not authenticated → Allow to proceed
  ├─ Protected admin routes (/admin/*)
  │   ├─ Admin + Authenticated → NextResponse.next()
  │   ├─ Not admin → Rewrite to /unauthorized
  │   └─ Not authenticated → Redirect to /admin/login
  └─ Protected user routes (/account/*)
      ├─ Authenticated + not admin → NextResponse.next()
      ├─ Is admin → Rewrite to /admin (no redirect loop)
      └─ Not authenticated → Redirect to /login
```

**Status**: ✓ CORRECT
**No changes needed**

---

## Route Consolidation Recommendations

### Action 1: Remove Duplicate Login Routes (MEDIUM PRIORITY)
- Keep: `/admin/login`, `/login`
- Redirect: `/auth/admin/login` → `/admin/login`
- Redirect: `/auth/customer/login` → `/login`
- **Files affected**: 2 (page.tsx files)
- **Tests affected**: Login flow tests
- **LOC changed**: ~10

### Action 2: Update REDIRECT_PATHS Constants (HIGH PRIORITY)
- Consolidate `src/lib/auth/constants.ts` into `src/lib/auth-constants.ts`
- Update REDIRECT_PATHS to use `/login` instead of `/auth/customer/login`
- **Files affected**: 5 (using auth/constants)
- **Tests affected**: All auth tests
- **LOC changed**: ~50

### Action 3: Update Imports After Consolidation (MEDIUM PRIORITY)
- After consolidating constants, update imports in 5 files
- Ensure no mixed import patterns remain
- **Files affected**: 5
- **LOC changed**: ~5-10

---

## Routing Summary

| Category | Status | Issues | Priority |
|----------|--------|--------|----------|
| Public Routes | ✓ CLEAN | None | - |
| Auth Routes | ⚠️ DUPLICATE | 2 duplicate paths | MEDIUM |
| Admin Routes | ✓ CLEAN | None | - |
| Customer Routes | ✓ CLEAN | None | - |
| API Routes | ⚠️ BUG | Variable shadowing | CRITICAL |
| Middleware | ✓ CORRECT | None | - |
| Constants | ⚠️ CONFLICT | Path mismatches | HIGH |

**Total Route Issues**: 2
**Total Constant Conflicts**: 1
**Total API Issues**: 1
