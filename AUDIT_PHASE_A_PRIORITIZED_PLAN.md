# Phase A Audit - Prioritized Refactoring Plan
# Generated: 2026-01-09
# Gate: All changes require human review and approval before PR creation

## Refactoring Strategy

**Safety-First Approach**: 
- All changes use minimal modifications (consolidation, redirection)
- No deletion of duplicate code until wrappers/redirects tested
- Each change is a separate feature branch and PR
- Full test suite runs before requesting approval

**Branch Naming Convention**: `feature/refactor/<issue>-<timestamp>`

---

## PHASE B - Implementation Schedule

### TIER 0: CRITICAL BUG FIX (Must fix before anything else)

#### Fix 0-1: Variable Shadowing in Cart DELETE Handler
**Branch**: `feature/refactor/cart-delete-shadowing-202601091400`

**Issue**: Variable `itemId` declared twice, causing type mismatch

**Files to Change**: 
- `src/app/api/user/cart/items/[id]/route.ts` (1 file)

**Changes**:
```typescript
// BEFORE (Lines 70-81)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: itemId } = await params;  // Line 70
  try {
    const session = await getServerSession();
    // ...
    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id;
    const itemId = params.id;  // ❌ LINE 81: DELETE THIS

    // ...
  }

// AFTER
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: itemId } = await params;  // Use destructured value
  try {
    const session = await getServerSession();
    // ...
    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id;
    // itemId is already defined above - use it directly
```

**Estimated LOC**: 1 line removed

**Affected Modules**: 
- Cart management API
- Minimal scope

**Tests**:
- Cart DELETE endpoint test
- Verify itemId type matches

**Rollback**: Single line git revert

**Risk Level**: MINIMAL
- Single line removal
- No business logic change
- Clear variable usage

---

### TIER 1: HIGH-PRIORITY CONSOLIDATIONS (Do first)

#### Refactor 1-1: Consolidate Authentication Constants

**Branch**: `feature/refactor/auth-constants-consolidation-202601091500`

**Issue**: 3 files with auth constants causing routing conflicts

**Current State**:
- `src/lib/auth-constants.ts` (100 LOC) - Primary, 95+ imports
- `src/lib/auth/constants.ts` (151 LOC) - REDIRECT_PATHS conflict
- `src/lib/constants.ts` (1 LOC) - Unclear re-export

**Goal**: Single source of truth for auth constants

**Changes**:
1. **Enhance** `src/lib/auth-constants.ts`
   - Add ROLE_METADATA from auth/constants.ts
   - Add LOGIN_ROLE_CONFIG from login-utils.ts (reference)
   - Add ADMIN_EMAILS constants
   - Keep single REDIRECT_PATHS definition
   - Total: +50 LOC

2. **Create** redirect in `src/lib/auth/constants.ts`
   ```typescript
   // Re-export from primary location
   export * from '../auth-constants';
   ```
   - Deprecation notice in comments

3. **Update** `src/lib/constants.ts`
   ```typescript
   export * from './auth-constants';
   ```

4. **Update imports** in 5 files using auth/constants.ts
   - Change: `import { ... } from '@/lib/auth/constants'`
   - To: `import { ... } from '@/lib/auth-constants'`

**Files to Modify**: 
- `src/lib/auth-constants.ts` (enhancement)
- `src/lib/auth/constants.ts` (redirect only)
- `src/lib/constants.ts` (redirect only)
- ~5 files importing from auth/constants (import updates)

**Estimated LOC**: 
- New code: ~50
- Modified imports: ~5-10
- Deleted code: ~140

**Affected Modules**:
- All authentication-dependent code
- All role-based routing

**Tests**:
- Type checking for USER_ROLES
- Type checking for REDIRECT_PATHS
- Role type guards
- Dashboard path resolution

**Rollback**: 
1. Restore auth/constants.ts to original
2. Revert import changes
3. `npm run build` verify

**Risk Level**: MEDIUM
- Wide impact (95+ files transitively)
- But changes are mostly transparent (re-exports)
- Type safety verified at build time

---

#### Refactor 1-2: Consolidate Role Utilities

**Branch**: `feature/refactor/role-utilities-consolidation-202601091530`

**Prerequisite**: Complete Refactor 1-1 first

**Issue**: 3 files with role utility functions (80%+ overlap)

**Current State**:
- `src/lib/auth-constants.ts` (type guards)
- `src/lib/auth-role-utils.ts` (ROLE_METADATA + routing functions)
- `src/lib/auth/roles.ts` (alternative implementations)

**Goal**: Unified role utility module

**Changes**:
1. **Enhance** `src/lib/auth-constants.ts`
   - Add functions from auth-role-utils.ts:
     * `isRolePath()`
     * `getRoleProtectedRoutes()`
     * `getRoleInfo()`

2. **Create** redirect in `src/lib/auth-role-utils.ts`
   ```typescript
   export * from './auth-constants';
   ```

3. **Update** `src/lib/auth/roles.ts`
   - Create deprecation redirects
   - Point to auth-constants

4. **Update imports** in ~20 files
   - From auth-role-utils imports → auth-constants
   - From auth/roles imports → auth-constants

**Files to Modify**:
- `src/lib/auth-constants.ts` (enhancement, ~30 LOC)
- `src/lib/auth-role-utils.ts` (redirect only)
- `src/lib/auth/roles.ts` (redirect only)
- ~20 import sites

**Estimated LOC**:
- New code: ~30
- Modified imports: ~20-30
- Deleted code: ~380

**Affected Modules**:
- Authentication system
- Role-based access control
- Dashboard routing

**Tests**:
- Role validation functions
- Protected route resolution
- Role metadata retrieval

**Rollback**: Similar to Refactor 1-1

**Risk Level**: MEDIUM-HIGH
- Second refactor, dependencies on Refactor 1-1
- 20 import sites need updates
- But logic remains identical

---

### TIER 2: MEDIUM-PRIORITY CONSOLIDATIONS (Then)

#### Refactor 2-1: Standardize Prisma Client

**Branch**: `feature/refactor/prisma-standardization-202601091600`

**Issue**: 3 import paths for Prisma client

**Current State**:
- `src/lib/prisma.ts` - Simple singleton
- `src/lib/db/index.ts` - PG adapter, pooling (better)
- 95 files with mixed imports

**Goal**: Single standardized import path

**Changes**:
1. **Update** `src/lib/prisma.ts`
   ```typescript
   // Re-export from primary location
   export { prisma } from './db';
   export * from './db';
   ```

2. **Update all imports** - 95 files total
   - From: `import prisma from '@/lib/prisma'` or `import { prisma } from '@/lib/db'`
   - To: `import { prisma } from '@/lib/db'`

**Files to Modify**: 95+ files

**Estimated LOC**:
- New code: ~3
- Modified imports: ~95-100 lines
- No deletions (db/index.ts becomes primary)

**Affected Modules**:
- Database access layer
- All data-dependent features

**Tests**:
- Prisma client initialization
- Connection pooling works
- No duplicate instances

**Rollback**: Revert Prisma import changes

**Risk Level**: HIGH
- Affects 95+ files
- But changes are mechanical (find/replace)
- Minimal logic changes

---

#### Refactor 2-2: Error Logging Service Consolidation

**Branch**: `feature/refactor/error-logging-consolidation-202601091630`

**Issue**: 2 error logging implementations

**Current State**:
- `src/services/error-logging.service.ts` (200 LOC, class-based)
- `src/services/errorLoggingService.ts` (95 LOC, function-based)

**Goal**: Single error logging service

**Changes**:
1. **Create redirect** in errorLoggingService.ts
   ```typescript
   // Deprecation: Use error-logging.service.ts
   export * from './error-logging.service';
   ```

2. **Update imports** in ~8 files
   - From: `import { ... } from '@/services/errorLoggingService'`
   - To: `import { ... } from '@/services/error-logging.service'`

**Files to Modify**:
- `src/services/errorLoggingService.ts` (redirect only)
- ~8 import sites

**Estimated LOC**:
- New code: ~2
- Modified imports: ~8-10
- No deletions

**Affected Modules**:
- Error tracking/logging
- Admin notifications

**Tests**:
- Error logging function calls
- Database persistence

**Rollback**: Revert imports

**Risk Level**: LOW
- Minimal scope (8 files)
- Mechanical import updates

---

### TIER 3: ARCHITECTURE-LEVEL CONSOLIDATIONS (Then)

#### Refactor 3-1: Analytics Service Consolidation

**Branch**: `feature/refactor/analytics-consolidation-202601091700`

**Issue**: 3 analytics implementations with different architectures

**Current State**:
- `src/services/analytics.service.ts` (120 LOC, class)
- `src/services/analyticsService.ts` (28 LOC, functions)
- `src/lib/analytics.ts` (180 LOC, fire-and-forget)

**Architectural Conflict**: Mixing DB persistence with fire-and-forget

**Goal**: Unified analytics pattern

**Decision**: Keep fire-and-forget pattern (lib/analytics)
- Current architecture matches app needs
- No waiting for DB writes
- Simpler, async-safe

**Changes**:
1. **Create redirect** in services/analytics.service.ts
   ```typescript
   // Deprecated: Use fire-and-forget pattern in @/lib/analytics
   export * from '@/lib/analytics';
   ```

2. **Create redirect** in services/analyticsService.ts
   ```typescript
   export * from '@/lib/analytics';
   ```

3. **Update imports** in ~25 files
   - All patterns converge to lib/analytics

**Files to Modify**:
- `src/services/analytics.service.ts` (redirect only)
- `src/services/analyticsService.ts` (redirect only)
- ~25 import sites

**Estimated LOC**:
- New code: ~5
- Modified imports: ~25-35
- Deleted: ~328 (after deprecation period)

**Affected Modules**:
- Product browsing
- User actions
- Dashboard analytics

**Tests**:
- Analytics event tracking
- Fire-and-forget doesn't block operations

**Rollback**: Revert imports

**Risk Level**: MEDIUM
- Requires architectural decision (fire-and-forget is correct)
- 25 import sites
- No logic changes, pattern convergence

---

### TIER 4: ROUTING CLEANUP (Last)

#### Refactor 4-1: Remove Duplicate Auth Routes

**Branch**: `feature/refactor/remove-duplicate-routes-202601091730`

**Issue**: Duplicate login routes at `/admin/login` vs `/auth/admin/login`

**Current State**:
- `/admin/login` → `src/app/admin/login/page.tsx`
- `/auth/admin/login` → `src/app/auth/admin/login/page.tsx` (duplicate)
- `/login` → `src/app/login/page.tsx`
- `/auth/customer/login` → `src/app/auth/customer/login/page.tsx` (duplicate)

**Goal**: Single canonical login routes

**Changes**:
1. **Update** `/auth/admin/login/page.tsx`
   ```typescript
   // Redirect to canonical path
   import { redirect } from 'next/navigation';
   
   export default function AuthAdminLoginPage() {
     redirect('/admin/login');
   }
   ```

2. **Update** `/auth/customer/login/page.tsx`
   ```typescript
   // Redirect to canonical path
   import { redirect } from 'next/navigation';
   
   export default function AuthCustomerLoginPage() {
     redirect('/login');
   }
   ```

3. **Update** REDIRECT_PATHS to use canonical paths
   - LOGIN: '/login' ✓
   - ADMIN_LOGIN: '/admin/login' ✓

**Files to Modify**:
- `src/app/auth/admin/login/page.tsx`
- `src/app/auth/customer/login/page.tsx`
- (No component content deletions, just redirects)

**Estimated LOC**:
- New code: ~8-10
- Deleted code: 0 (files kept for redirect)

**Affected Modules**:
- Authentication flow
- Navigation

**Tests**:
- Admin login route redirects correctly
- Customer login route redirects correctly
- Session maintains after redirect

**Rollback**: Revert routing logic

**Risk Level**: LOW
- Server-side redirects, safe
- No client code affected
- Clear redirect semantics

---

## Summary of All Changes

| Refactor | Priority | Type | Files | LOC Added | LOC Changed | LOC Deleted | Risk | Effort |
|----------|----------|------|-------|-----------|-------------|-------------|------|--------|
| Fix 0-1 (Shadowing) | CRITICAL | Bug | 1 | 0 | 0 | 1 | MINIMAL | TRIVIAL |
| Refactor 1-1 (Auth Const) | CRITICAL | Consolidation | 5+ | 50 | 10 | 140 | MEDIUM | MEDIUM |
| Refactor 1-2 (Role Utils) | CRITICAL | Consolidation | 20+ | 30 | 30 | 380 | MEDIUM | MEDIUM |
| Refactor 2-1 (Prisma) | HIGH | Standardization | 95+ | 3 | 100 | 0 | HIGH | LARGE |
| Refactor 2-2 (Error Log) | MEDIUM | Consolidation | 8 | 2 | 10 | 0 | LOW | SMALL |
| Refactor 3-1 (Analytics) | MEDIUM | Consolidation | 25+ | 5 | 35 | 328 | MEDIUM | LARGE |
| Refactor 4-1 (Routes) | MEDIUM | Cleanup | 2 | 10 | 0 | 0 | LOW | SMALL |

**TOTAL**: 7 refactors, ~155 files modified, ~100-200 LOC net change

---

## Branch Creation Order

**Recommended Sequence** (for minimal conflicts):

1. ✅ Fix 0-1 (Shadowing) - No dependencies
2. → Refactor 1-1 (Auth Const) - Foundation
3. → Refactor 1-2 (Role Utils) - Depends on 1-1
4. → Refactor 2-1 (Prisma) - Independent after 1-1, 1-2
5. → Refactor 2-2 (Error Log) - Independent
6. → Refactor 3-1 (Analytics) - Independent
7. → Refactor 4-1 (Routes) - Last (cosmetic)

**Parallel Possibilities**:
- 2-1, 2-2, 3-1 can run in parallel if 1-1 is merged

---

## Verification Checklist per Branch

For each branch, verify:

1. **Type Checking**
   ```bash
   npx tsc --noEmit
   ```

2. **Linting**
   ```bash
   npx eslint "src/**/*.{ts,tsx,js,jsx}" --fix
   ```

3. **Unit Tests**
   ```bash
   npm test
   ```

4. **Build**
   ```bash
   npm run build
   ```

5. **No Runtime Errors**
   - Manual testing of affected features
   - Test environment verification

6. **Test Coverage**
   - At least 1 test per modified function
   - At least 1 test per refactored module

---

## Gate Before Proceeding to Phase B

✋ **HUMAN REVIEW REQUIRED**

Before any branch is created or any PR is opened:

1. Review this prioritized plan
2. Approve the refactoring sequence
3. Confirm branch naming conventions
4. Identify any additional concerns

Once approved:
- All 7 branches will be created
- All 7 PRs will be drafted
- All test results will be provided
- Summary document will link refactors to audit items

