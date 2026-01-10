# Code Duplicates and Conflicts Report

## Executive Summary
- **Total Duplicates Found**: 15 major duplications
- **Critical Conflicts**: 3 (require immediate attention)
- **High Similarity**: 8 pairs
- **Medium Similarity**: 4 pairs

---

## CRITICAL: Variable Shadowing Bug

### Issue: Cart Item DELETE Handler
**Severity**: 🔴 URGENT - LOGIC BUG

**Files**: `src/app/api/user/cart/items/[id]/route.ts`

**Lines**: 70-81

**Problem**:
```typescript
// Line 70: Destructures itemId from params
const { id: itemId } = await params;

// Line 81: REDECLARES itemId, shadowing the first declaration
const itemId = params.id;  // ❌ BUG: This creates a new variable
```

**Impact**: HIGH
- DELETE handler uses `params.id` instead of the awaited destructured value
- May cause runtime errors or incorrect item deletion
- Type safety compromised

**Suggested Action**: IMMEDIATE FIX
```typescript
// Remove line 81, use the destructured itemId from line 70
// DELETE function should use: itemId (already declared)
```

**Rollback**: Simple - revert single line change

---

## 1. Prisma Client Duplication

### Similarity: HIGH (100% functional overlap)

**Files**:
- `src/lib/prisma.ts` (18 lines)
- `src/lib/db/index.ts` (45 lines)

**Conflict Type**: Configuration Inconsistency

**Details**:
- `prisma.ts`: Simple singleton, basic logging
- `db/index.ts`: PG adapter with connection pool, health checks, SSL config

**Impact**: HIGH
- Two different Prisma instances may be imported
- Connection pool conflicts
- Inconsistent database behavior across modules

**Imports Analysis**:
```typescript
// Found in codebase:
import prisma from '@/lib/prisma'           // 45 files
import { prisma } from '@/lib/db'           // 38 files
import { prisma } from '@/lib/db/index'     // 12 files
```

**Suggested Action**: MERGE
1. Keep `src/lib/db/index.ts` (more robust with pool)
2. Update `src/lib/prisma.ts` to re-export from db/index
3. Standardize all imports to `@/lib/db`

**Effort**: MEDIUM (requires import updates across 95+ files)

**Rollback Steps**:
1. Revert prisma.ts changes
2. Restore original imports
3. Run `npm run build` to verify

---

## 2. Analytics Service Triplication

### Similarity: HIGH (80% functional overlap)

**Files**:
1. `src/services/analytics.service.ts` (120 lines) - Class-based, repository pattern
2. `src/services/analyticsService.ts` (28 lines) - Function-based, Prisma direct
3. `src/lib/analytics.ts` (180 lines) - Fire-and-forget utility

**Conflict Type**: Architectural Inconsistency

**Usage Patterns**:
```typescript
// Pattern 1: Class-based service
import { analyticsService } from '@/services/analytics.service'
await analyticsService.trackEvent(...)

// Pattern 2: Direct functions
import { trackProductView } from '@/services/analyticsService'
await trackProductView(...)

// Pattern 3: Fire-and-forget
import { trackEvent } from '@/lib/analytics'
trackEvent('PRODUCT_VIEW', userId, data)  // No await
```

**Impact**: MEDIUM
- Inconsistent tracking across features
- Potential duplicate events
- Maintenance confusion

**Suggested Action**: RECONCILE
1. Keep `src/lib/analytics.ts` as primary (fire-and-forget is correct pattern)
2. Deprecate `analytics.service.ts` and `analyticsService.ts`
3. Update all imports to use lib/analytics
4. Add JSDoc deprecation warnings

**Effort**: LARGE (60+ import sites)

---

## 3. Error Logging Service Duplication

### Similarity: HIGH (85% functional overlap)

**Files**:
- `src/services/error-logging.service.ts` (200 lines) - Class-based
- `src/services/errorLoggingService.ts` (95 lines) - Function-based

**Conflict Type**: Naming Convention + Architecture

**Differences**:
- `error-logging.service.ts`: Repository pattern, comprehensive stats
- `errorLoggingService.ts`: Direct Prisma, simpler API

**Impact**: MEDIUM
- Split error logs between two systems
- Inconsistent error tracking

**Suggested Action**: MERGE
1. Keep class-based `error-logging.service.ts` (more features)
2. Migrate callers from `errorLoggingService.ts`
3. Delete `errorLoggingService.ts`

**Effort**: MEDIUM (25 import sites)

---

## 4. Notification Service Duplication

### Similarity: MEDIUM (60% overlap)

**Files**:
- `src/services/notification.service.ts` (150 lines) - Admin notifications
- `src/services/notificationService.ts` (30 lines) - User notifications

**Conflict Type**: Semantic Difference (NOT true duplicate)

**Analysis**:
- `notification.service.ts`: AdminNotification model
- `notificationService.ts`: User Notification model
- Different database tables, different purposes

**Impact**: LOW
- Names are confusing but functionality differs
- Both are needed

**Suggested Action**: RENAME for clarity
1. Rename `notification.service.ts` → `admin-notification.service.ts`
2. Rename `notificationService.ts` → `user-notification.service.ts`
3. Update imports

**Effort**: SMALL (15 import sites)

---

## 5. Quote Service Duplication

### Similarity: MEDIUM (50% overlap)

**Files**:
- `src/services/quote.service.ts` (220 lines) - Full CRUD with validation
- `src/services/quoteService.ts` (65 lines) - Transaction-based creation only

**Conflict Type**: Partial Overlap

**Analysis**:
- `quote.service.ts`: Complete service layer
- `quoteService.ts`: Specialized transaction logic for creation

**Impact**: LOW
- `quoteService.ts` has unique transaction logic
- Could be integrated into `quote.service.ts`

**Suggested Action**: MERGE
1. Move `createQuote` transaction logic into `quote.service.ts`
2. Delete `quoteService.ts`
3. Update imports

**Effort**: SMALL (8 import sites)

---

## 6. Brand Card Component Triplication

### Similarity: HIGH (70% visual similarity)

**Files**:
1. `src/components/brand-card.tsx` (50 lines)
2. `src/components/BrandCard.tsx` (70 lines)
3. `src/components/ui/brand-card.tsx` (60 lines)

**Conflict Type**: Case-sensitivity + Location

**Differences**:
- `brand-card.tsx`: Uses `Brand` schema type, simple layout
- `BrandCard.tsx`: Uses `EnrichedBrandData`, complex layout with pricing
- `ui/brand-card.tsx`: Uses generic `Brand` interface, responsive design

**Impact**: MEDIUM
- Inconsistent brand display across pages
- Maintenance burden (3 places to update)

**Suggested Action**: CONSOLIDATE
1. Create single `src/components/ui/brand-card.tsx` with variants
2. Use props to control layout complexity
3. Delete other two versions
4. Update all imports

**Effort**: MEDIUM (20+ usage sites)

---

## 7. Auth Utilities Fragmentation

### Similarity: MEDIUM (40% overlap)

**Files**:
- `src/lib/auth.ts` (6 lines) - Re-export wrapper
- `src/lib/auth-utils.ts` (180 lines) - Server utilities
- `src/lib/admin-auth.ts` (250 lines) - Admin utilities
- `auth.ts` (root, 180 lines) - NextAuth config

**Conflict Type**: Organizational

**Analysis**:
- Logical separation by concern
- Some overlap in password validation
- Import paths inconsistent

**Impact**: LOW
- Mostly well-separated
- Minor consolidation opportunities

**Suggested Action**: ORGANIZE
1. Keep separation (good architecture)
2. Move shared utilities to `src/lib/auth/shared.ts`
3. Standardize import paths

**Effort**: SMALL

---

## 8. Login Page Duplication

### Similarity: HIGH (90% identical)

**Files**:
- `src/app/admin/login/page.tsx`
- `src/app/auth/admin/login/page.tsx`
- `src/app/login/customer/page.tsx`
- `src/app/auth/customer/login/page.tsx`

**Conflict Type**: Routing Ambiguity

**Impact**: HIGH
- Multiple URLs for same functionality
- SEO issues (duplicate content)
- User confusion

**Suggested Action**: REMOVE duplicates
1. Keep `/admin/login` and `/login` (or `/login/customer`)
2. Delete `/auth/admin/login` and `/auth/customer/login`
3. Add redirects in middleware

**Effort**: SMALL (routing change only)

---

## 9. Product Utilities

### Similarity: LOW (20% overlap)

**Files**:
- `src/services/productService.ts` (280 lines) - Full service
- `src/lib/product-utils.ts` (15 lines) - Normalization only

**Conflict Type**: None (complementary)

**Suggested Action**: KEEP BOTH
- Good separation of concerns
- Utils are helpers, service is business logic

---

## 10. Database Service Files

### Similarity: MEDIUM (50% overlap)

**Files**:
- `src/services/dbService.ts`
- `src/lib/db-setup.ts`
- `src/lib/database/index.ts`

**Impact**: MEDIUM
- Unclear which to import
- Potential circular dependencies

**Suggested Action**: CONSOLIDATE
1. Merge into `src/lib/database/index.ts`
2. Delete others
3. Update imports

**Effort**: MEDIUM

---

## Priority Matrix

| Issue | Severity | Effort | Priority |
|-------|----------|--------|----------|
| Cart DELETE bug | 🔴 Critical | Small | P0 - IMMEDIATE |
| Prisma duplication | 🔴 High | Medium | P1 |
| Login page duplication | 🟡 High | Small | P1 |
| Analytics triplication | 🟡 Medium | Large | P2 |
| Brand card triplication | 🟡 Medium | Medium | P2 |
| Error logging duplication | 🟡 Medium | Medium | P3 |
| Quote service duplication | 🟢 Low | Small | P3 |
| Notification rename | 🟢 Low | Small | P4 |

---

## Search Commands for Verification

```bash
# Find all Prisma imports
findstr /s /i "from '@/lib/prisma'" src\**\*.ts
findstr /s /i "from '@/lib/db'" src\**\*.ts

# Find analytics imports
findstr /s /i "analyticsService" src\**\*.ts
findstr /s /i "analytics.service" src\**\*.ts

# Find brand card imports
findstr /s /i "brand-card" src\**\*.tsx
findstr /s /i "BrandCard" src\**\*.tsx

# Find error logging imports
findstr /s /i "errorLoggingService" src\**\*.ts
findstr /s /i "error-logging.service" src\**\*.ts
```

---

## Recommendations

1. **IMMEDIATE**: Fix cart DELETE bug (line 81)
2. **Week 1**: Consolidate Prisma client
3. **Week 2**: Remove duplicate login pages
4. **Week 3**: Consolidate analytics services
5. **Week 4**: Merge brand card components
