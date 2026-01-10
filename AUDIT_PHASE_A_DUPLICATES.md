# Phase A Audit - Detailed Duplicates Analysis
# Generated: 2026-01-09

## CRITICAL ISSUES

### Issue 1: Variable Shadowing Bug (IMMEDIATE FIX)

**Severity**: 🔴 CRITICAL

**File**: `src/app/api/user/cart/items/[id]/route.ts`

**Problem**:
```typescript
// Line 70: DELETE function starts
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: itemId } = await params;  // Line 70: Destructures itemId
  
  try {
    const session = await getServerSession();
    // ... code ...
    
    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id;
    const itemId = params.id;  // Line 81: SHADOWS the destructured itemId from line 70
    
    // ... code uses itemId (but it's now the string 'params.id', not the destructured value)
```

**Root Cause**: 
- Line 70 correctly destructures `id` as `itemId` after awaiting params
- Line 81 redeclares `itemId` using `params.id` directly, which is a Promise
- This creates variable shadowing and uses wrong value type

**Impact**: HIGH
- DELETE handler may fail silently or delete wrong cart item
- `params.id` is accessed before await, type mismatch

**Fix**: Remove line 81, use destructured `itemId` from line 70

**Estimated LOC Change**: 1 line
**Modules Affected**: Cart API
**Rollback**: Simple revert of line 81

---

## HIGH-PRIORITY DUPLICATES

### 1. Authentication Constants Triplication

**Severity**: 🟡 HIGH

**Files**:
1. `src/lib/auth-constants.ts` (100 LOC)
   - Primary: USER_ROLES, REDIRECT_PATHS, type guards (isAdmin, isUser, etc.)
   - Used by: 95+ files

2. `src/lib/auth/constants.ts` (151 LOC)
   - Alternative: USER_ROLES, ROLE_METADATA, LOGIN_ROLE_CONFIG
   - Used by: 5 files
   - ISSUE: Contains different REDIRECT_PATHS values

3. `src/lib/constants.ts` (1 LOC)
   - Re-exports from `./config/constants` (which is unclear)
   - Usage: Minimal

**Detailed Comparison**:

| Aspect | auth-constants.ts | auth/constants.ts |
|--------|-------------------|-------------------|
| USER_ROLES.ADMIN | 'admin' | 'admin' ✓ |
| USER_ROLES.USER | 'customer' | 'customer' ✓ |
| REDIRECT_PATHS.LOGIN | '/login' | '/auth/customer/login' ❌ |
| REDIRECT_PATHS.ADMIN_LOGIN | N/A | '/auth/admin/login' ❌ |
| ROLE_METADATA | ❌ No | ✓ Yes |
| LOGIN_ROLE_CONFIG | ❌ No | ❌ No (in login-utils) |

**Root Cause**:
- Multiple developers created auth files independently
- `auth/constants.ts` uses newer `/auth/*` routing paths
- `auth-constants.ts` is more widely adopted
- No consolidation occurred

**Import Analysis**:
```typescript
// Pattern A (PRIMARY): 95+ usages
import { USER_ROLES, REDIRECT_PATHS } from '@/lib/auth-constants'

// Pattern B (ALTERNATIVE): 5 usages in newer code
import { USER_ROLES, REDIRECT_PATHS, ROLE_METADATA } from '@/lib/auth/constants'

// Pattern C: 1 usage (unclear)
import * from '@/lib/constants'
```

**Risk**: Route conflicts, role value mismatches in edge cases

**Recommendation**: 
- ✓ KEEP: `src/lib/auth-constants.ts` (primary, 95+ imports)
- 🔄 MIGRATE: Move ROLE_METADATA to auth-constants
- ❌ DELETE: `src/lib/auth/constants.ts` and `src/lib/constants.ts`
- UPDATE: 5 files using auth/constants.ts

**Estimated LOC Change**: 
- Consolidation: ~50 LOC in auth-constants.ts
- Import updates: ~10 files × 1-2 lines each
- Deletion: ~150 LOC removed

**Affected Modules**: Authentication, Routing, All components using roles

**Rollback Steps**:
1. Restore deleted files from git
2. Revert import statements
3. Run build to verify

---

### 2. Role Utilities Duplication

**Severity**: 🟡 HIGH

**Files**:
1. `src/lib/auth-constants.ts` (lines 47-100, ~50 LOC)
   - Functions: getUserDashboardPath, isAdmin, isUser, isValidRole
   - Type guards with clear semantics

2. `src/lib/auth-role-utils.ts` (260 LOC)
   - ROLE_METADATA duplicate (different structure)
   - Functions: isRolePath, getRoleProtectedRoutes, getRoleInfo, getRoleMetadata
   - Extra: Role path validation, protected routes list

3. `src/lib/auth/roles.ts` (164 LOC)
   - Functions: isValidRole, getRoleMetadata, getLoginConfig, canBeAdmin, etc.
   - Used by: Alternative auth subsystem
   - Extra: Email domain validation, role compatibility checks

**Function Comparison**:

| Function | auth-constants | auth-role-utils | auth/roles |
|----------|----------------|-----------------|-----------|
| getUserDashboardPath | ✓ | ❌ | ❌ |
| isAdmin | ✓ | ❌ | ❌ |
| isUser | ✓ | ❌ | ❌ |
| isValidRole | ✓ | ❌ | ✓ (duplicate) |
| getRoleMetadata | ❌ | ✓ | ✓ (duplicate) |
| ROLE_METADATA | ❌ | ✓ | (in constants) |
| getRoleProtectedRoutes | ❌ | ✓ | ❌ |

**Root Cause**:
- auth/roles.ts created as alternative architecture
- auth-role-utils.ts added more functions incrementally
- No consolidation occurred

**Import Analysis**:
- `auth-constants.ts`: 95+ usages (primary)
- `auth-role-utils.ts`: ~15 usages
- `auth/roles.ts`: ~5 usages

**Recommendation**: 
- ✓ KEEP: `src/lib/auth-constants.ts` as primary (most usage)
- 🔄 ENHANCE: Add missing functions from auth-role-utils
- ❌ DELETE: `src/lib/auth-role-utils.ts` and `src/lib/auth/roles.ts`

**Estimated LOC Change**:
- Consolidation: ~100 LOC added to auth-constants
- Import updates: ~20 files
- Deletion: ~400 LOC removed

**Affected Modules**: All authentication-dependent components

---

## MEDIUM-PRIORITY DUPLICATES

### 3. Analytics Service Triplication

**Severity**: 🟡 MEDIUM-HIGH

**Files**:
1. `src/services/analytics.service.ts` (120 LOC)
   - Class-based: AnalyticsService with repository pattern
   - Methods: trackEvent, trackPageView, trackUserAction, etc.
   - Used by: 15 files (older implementation)

2. `src/services/analyticsService.ts` (28 LOC)
   - Function-based: Direct Prisma calls
   - Functions: trackProductView, trackAddToCart, etc.
   - Used by: 8 files (newer implementation)

3. `src/lib/analytics.ts` (180 LOC)
   - Fire-and-forget utility functions
   - No database writes (logs only)
   - Used by: 12 files (middleware, components)

**Functional Overlap**: ~80%

**Architecture Mismatch**:
- services/analytics.service: Stateful, tracked via class instance
- services/analyticsService: Stateless, direct DB calls
- lib/analytics: Async-fire, no persistence

**Usage Patterns**:
```typescript
// Pattern 1: Class-based (old)
import { analyticsService } from '@/services/analytics.service'
await analyticsService.trackEvent('PURCHASE', userId, { amount: 100 })

// Pattern 2: Function-based (new)
import { trackProductView } from '@/services/analyticsService'
await trackProductView(productId, userId)

// Pattern 3: Fire-and-forget (current)
import { trackEvent } from '@/lib/analytics'
trackEvent('PURCHASE', userId) // No await, no DB persistence
```

**Inconsistency Issues**:
- Some events tracked to DB (patterns 1, 2)
- Other events only logged (pattern 3)
- Duplicate events possible if multiple patterns used for same event

**Recommendation**:
- ✓ KEEP: `src/lib/analytics.ts` as primary (matches current architecture)
- 🔄 DEPRECATE: services/analytics.service, analyticsService with wrapper
- 📋 MIGRATE: 23 files using old patterns to new pattern

**Estimated LOC Change**:
- Wrapper/redirect: ~30 LOC
- Import updates: ~25 files × 1-2 lines
- Documentation: ~50 LOC

**Affected Modules**: Product browsing, Cart, Orders, Quotes

**Rollback**: Simple import replacement

---

### 4. Error Logging Service Duplication

**Severity**: 🟡 MEDIUM

**Files**:
1. `src/services/error-logging.service.ts` (200 LOC)
   - Class-based: ErrorLoggingService with repository pattern
   - Methods: logError, getErrorStats, getErrors, etc.
   - Features: Comprehensive error tracking, statistics

2. `src/services/errorLoggingService.ts` (95 LOC)
   - Function-based: Direct Prisma
   - Functions: logError, getErrorCount, etc.
   - Simpler API

**Functional Overlap**: ~85%

**Recommendation**:
- ✓ KEEP: `src/services/error-logging.service.ts` (more features)
- ❌ DELETE: `src/services/errorLoggingService.ts`
- 📋 MIGRATE: 8 files to use primary service

**Estimated LOC Change**: ~30 LOC changes, 95 LOC deleted

**Affected Modules**: Error handling across app

---

### 5. Prisma Client Duplication

**Severity**: 🟡 MEDIUM

**Files**:
1. `src/lib/prisma.ts` (18 LOC)
   - Simple singleton pattern
   - Basic logging only

2. `src/lib/db/index.ts` (45 LOC)
   - PG adapter with connection pooling
   - Health checks
   - Comprehensive configuration
   - SSL support

**Issue**: Different configurations imported inconsistently

**Import Analysis**:
```
Imported as 'prisma from @/lib/prisma': 45 files
Imported as '{ prisma } from @/lib/db': 38 files
Imported as '{ prisma } from @/lib/db/index': 12 files
```

**Recommendation**:
- ✓ KEEP: `src/lib/db/index.ts` (more robust with PG adapter)
- 🔄 REDIRECT: Make `src/lib/prisma.ts` re-export from db/index
- 📋 UPDATE: Standardize imports to `@/lib/db`

**Estimated LOC Change**: ~95 import updates

---

## SUMMARY TABLE

| Issue | Type | Files | LOC | Import Sites | Priority | Effort |
|-------|------|-------|-----|--------------|----------|--------|
| Auth Constants Triple | Consolidation | 3 | 251 | 100 | CRITICAL | MEDIUM |
| Role Utilities Triple | Consolidation | 3 | 574 | 120 | HIGH | MEDIUM |
| Analytics Triple | Consolidation | 3 | 328 | 35 | MEDIUM | LARGE |
| Error Logging Double | Consolidation | 2 | 295 | 8 | MEDIUM | SMALL |
| Prisma Client Double | Redirect | 2 | 63 | 95 | MEDIUM | MEDIUM |
| Variable Shadowing | Bug Fix | 1 | 1 | - | CRITICAL | TRIVIAL |

---

## REFACTORING COST ESTIMATE

- **Total Files to Modify**: ~95
- **Total Import Changes**: ~250
- **Functions to Consolidate**: ~20
- **New/Modified Functions**: ~10
- **Tests to Create/Update**: ~15
- **Documentation Updates**: ~5
- **Estimated Total LOC**: 400-500 across all changes

## RISKS

1. **Import breakage**: Variable shadowing across 95 files
2. **Type mismatches**: Different REDIRECT_PATHS in different files
3. **Behavioral divergence**: Analytics patterns don't match current architecture
4. **Test coverage gaps**: Some services have no tests
