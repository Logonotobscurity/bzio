# Prioritized Refactor Plan

## Overview
This plan addresses 23 identified issues across architecture, duplicates, and bugs.
Estimated total effort: 4-6 weeks for complete implementation.

---

## Phase 0: Critical Bug Fixes (Week 1, Days 1-2)

### P0-1: Fix Cart DELETE Handler Variable Shadowing 🔴 URGENT
**Issue**: Line 81 in cart items route redeclares `itemId`, causing logic error

**File**: `src/app/api/user/cart/items/[id]/route.ts`

**Changes**:
```typescript
// BEFORE (Lines 70-81):
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: itemId } = await params;  // Line 70
  // ... code ...
  const itemId = params.id;  // Line 81 ❌ BUG

// AFTER:
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: itemId } = await params;  // Line 70
  // ... code ...
  // Remove line 81 entirely, use itemId from line 70
```

**Effort**: 5 minutes  
**Impact**: HIGH - Prevents potential data corruption  
**Risk**: LOW - Simple fix, clear solution  

**Tests**:
```bash
# Manual test
curl -X DELETE http://localhost:3000/api/user/cart/items/test-id \
  -H "Authorization: Bearer <token>"

# Verify item is deleted correctly
# Check logs for no errors
```

**Rollback**: Revert single line change

**Review**: Backend developer + QA

---

### P0-2: Add Immediate Monitoring for Cart Operations
**Issue**: No error tracking for cart operations

**Changes**:
1. Add try-catch logging to cart routes
2. Add analytics tracking for cart operations
3. Add rate limiting to prevent abuse

**Effort**: 2 hours  
**Impact**: MEDIUM - Prevents future issues  
**Risk**: LOW  

**Tests**:
```bash
npm run test -- cart
npm run build
```

**Review**: Backend lead

---

## Phase 1: Database & Infrastructure (Week 1, Days 3-5)

### P1-1: Consolidate Prisma Client Configuration 🔴 HIGH
**Issue**: Two different Prisma configurations causing connection pool conflicts

**Files**:
- `src/lib/prisma.ts` (simple)
- `src/lib/db/index.ts` (with PG adapter)

**Changes**:

**Step 1**: Update `src/lib/prisma.ts` to re-export from db/index
```typescript
// src/lib/prisma.ts
export { prisma, checkDatabaseConnection } from '@/lib/db/index';
export default prisma;
```

**Step 2**: Create import migration script
```bash
# Create migration script
cat > scripts/migrate-prisma-imports.js << 'EOF'
const fs = require('fs');
const path = require('path');

// Find and replace imports
// from '@/lib/prisma' -> from '@/lib/db'
EOF
```

**Step 3**: Run migration
```bash
node scripts/migrate-prisma-imports.js
```

**Step 4**: Update all imports (95+ files)
```bash
# Find all prisma imports
findstr /s /i "from '@/lib/prisma'" src\**\*.ts > prisma-imports.txt

# Manual review and update each file
```

**Effort**: 4 hours (1 hour script + 3 hours testing)  
**Impact**: HIGH - Prevents connection issues  
**Risk**: MEDIUM - Many files affected  

**Tests**:
```bash
npm run typecheck
npm run build
npm run test
# Manual: Test all database operations
```

**Rollback Steps**:
1. Revert prisma.ts changes
2. Restore original imports from backup
3. Run `npm run build` to verify

**Review**: Senior backend developer + DevOps

---

### P1-2: Remove Duplicate Login Routes 🟡 HIGH
**Issue**: Multiple URLs for same login functionality

**Files to Remove**:
- `src/app/auth/admin/login/page.tsx`
- `src/app/auth/customer/login/page.tsx`
- `src/app/auth/admin/login/admin-auth-content.tsx`
- `src/app/auth/customer/login/customer-auth-content.tsx`

**Files to Keep**:
- `src/app/admin/login/page.tsx`
- `src/app/login/customer/page.tsx`

**Changes**:

**Step 1**: Add redirects in `middleware.ts`
```typescript
// Add to middleware.ts
if (pathname === '/auth/admin/login') {
  return NextResponse.redirect(new URL('/admin/login', req.url));
}
if (pathname === '/auth/customer/login') {
  return NextResponse.redirect(new URL('/login/customer', req.url));
}
```

**Step 2**: Update all internal links
```bash
# Find references
findstr /s /i "auth/admin/login" src\**\*.tsx
findstr /s /i "auth/customer/login" src\**\*.tsx

# Replace with correct paths
```

**Step 3**: Delete duplicate files
```bash
rm -rf src/app/auth/admin/login
rm -rf src/app/auth/customer/login
```

**Step 4**: Update sitemap and robots.txt

**Effort**: 3 hours  
**Impact**: HIGH - Improves SEO, reduces confusion  
**Risk**: LOW - Redirects prevent breakage  

**Tests**:
```bash
# Test redirects
curl -I http://localhost:3000/auth/admin/login
# Should return 307 redirect

npm run build
npm run test
```

**Rollback**: Restore deleted files from git

**Review**: Frontend lead + SEO specialist

---

## Phase 2: Service Layer Consolidation (Week 2)

### P2-1: Consolidate Analytics Services 🟡 MEDIUM
**Issue**: Three different analytics implementations

**Files**:
- Keep: `src/lib/analytics.ts` (fire-and-forget pattern)
- Deprecate: `src/services/analytics.service.ts`
- Deprecate: `src/services/analyticsService.ts`

**Changes**:

**Step 1**: Add deprecation warnings
```typescript
// src/services/analytics.service.ts
/**
 * @deprecated Use @/lib/analytics instead
 * This service will be removed in v2.0
 */
export class AnalyticsService { ... }
```

**Step 2**: Create migration guide
```markdown
# Analytics Migration Guide

## Old Pattern
import { analyticsService } from '@/services/analytics.service'
await analyticsService.trackEvent(...)

## New Pattern
import { trackEvent } from '@/lib/analytics'
trackEvent('EVENT_TYPE', userId, data)  // No await needed
```

**Step 3**: Migrate high-traffic routes first
- Product pages
- Checkout flow
- Admin dashboard

**Step 4**: Migrate remaining files (60+ files)

**Step 5**: Remove deprecated files after 2 weeks

**Effort**: 8 hours (2 hours planning + 6 hours migration)  
**Impact**: MEDIUM - Consistent tracking  
**Risk**: MEDIUM - Many files affected  

**Tests**:
```bash
npm run test -- analytics
npm run build

# Verify events in database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM analytics_events WHERE created_at > NOW() - INTERVAL '1 hour';"
```

**Rollback**: Keep old services, revert imports

**Review**: Backend lead + Analytics team

---

### P2-2: Consolidate Error Logging Services 🟡 MEDIUM
**Issue**: Two error logging implementations

**Files**:
- Keep: `src/services/error-logging.service.ts` (class-based, more features)
- Remove: `src/services/errorLoggingService.ts`

**Changes**:

**Step 1**: Identify all callers (25 files)
```bash
findstr /s /i "errorLoggingService" src\**\*.ts > error-logging-refs.txt
```

**Step 2**: Update imports
```typescript
// BEFORE
import { storeErrorLog } from '@/services/errorLoggingService'

// AFTER
import { errorLoggingService } from '@/services/error-logging.service'
errorLoggingService.logError(...)
```

**Step 3**: Delete old file

**Effort**: 3 hours  
**Impact**: MEDIUM  
**Risk**: LOW - Clear migration path  

**Tests**:
```bash
npm run test -- error-logging
npm run build
```

**Review**: Backend developer

---

### P2-3: Merge Quote Services 🟢 LOW
**Issue**: Two quote service implementations with partial overlap

**Files**:
- Keep: `src/services/quote.service.ts` (full CRUD)
- Merge from: `src/services/quoteService.ts` (transaction logic)

**Changes**:

**Step 1**: Extract transaction logic from `quoteService.ts`
```typescript
// Add to quote.service.ts
async createQuoteWithTransaction(payload: CreateQuotePayload) {
  // Move transaction logic here
}
```

**Step 2**: Update 8 import sites

**Step 3**: Delete `quoteService.ts`

**Effort**: 2 hours  
**Impact**: LOW  
**Risk**: LOW  

**Tests**:
```bash
npm run test -- quote
```

**Review**: Backend developer

---

## Phase 3: Component Consolidation (Week 3)

### P3-1: Consolidate Brand Card Components 🟡 MEDIUM
**Issue**: Three brand card implementations

**Files**:
- Remove: `src/components/brand-card.tsx`
- Remove: `src/components/BrandCard.tsx`
- Keep & Enhance: `src/components/ui/brand-card.tsx`

**Changes**:

**Step 1**: Create unified component with variants
```typescript
// src/components/ui/brand-card.tsx
interface BrandCardProps {
  brand: Brand | EnrichedBrandData;
  variant?: 'simple' | 'detailed' | 'compact';
  showPricing?: boolean;
  showQuoteButton?: boolean;
}

export function BrandCard({ brand, variant = 'simple', ... }: BrandCardProps) {
  // Unified implementation with conditional rendering
}
```

**Step 2**: Update all usage sites (20+ files)
```bash
findstr /s /i "brand-card" src\**\*.tsx > brand-card-refs.txt
findstr /s /i "BrandCard" src\**\*.tsx >> brand-card-refs.txt
```

**Step 3**: Delete old components

**Effort**: 6 hours  
**Impact**: MEDIUM - Consistent UI  
**Risk**: MEDIUM - Visual regression possible  

**Tests**:
```bash
npm run test -- BrandCard
npm run build

# Visual regression testing
npm run test:visual -- brand-card
```

**Review**: Frontend lead + Designer

---

### P3-2: Rename Notification Services for Clarity 🟢 LOW
**Issue**: Confusing names for different notification types

**Changes**:
```bash
# Rename files
mv src/services/notification.service.ts src/services/admin-notification.service.ts
mv src/services/notificationService.ts src/services/user-notification.service.ts
```

**Update imports** (15 files)

**Effort**: 1 hour  
**Impact**: LOW - Clarity improvement  
**Risk**: LOW  

**Tests**:
```bash
npm run typecheck
npm run build
```

**Review**: Any developer

---

## Phase 4: Routing & Organization (Week 4)

### P4-1: Resolve Product Route Conflicts 🟡 MEDIUM
**Issue**: Mixed page.tsx and route.ts for same paths

**Files**:
- `src/app/products/brands/[slug]/route.ts` - Remove
- `src/app/products/categories/[slug]/route.ts` - Remove
- Keep page.tsx versions

**Changes**:

**Step 1**: Verify page.tsx handles all functionality

**Step 2**: Move any API logic to proper API routes

**Step 3**: Delete route.ts files

**Effort**: 2 hours  
**Impact**: MEDIUM  
**Risk**: LOW  

**Tests**:
```bash
# Test all product routes
curl http://localhost:3000/products/brands/coca-cola
curl http://localhost:3000/products/categories/beverages
```

**Review**: Full-stack developer

---

### P4-2: Clarify Dashboard Routes 🟢 LOW
**Issue**: `/dashboard` vs `/account` ambiguity

**Options**:
1. Redirect `/dashboard` → `/account`
2. Make `/dashboard` a landing page with role-based redirect

**Recommended**: Option 1 (simpler)

**Changes**:
```typescript
// middleware.ts or app/dashboard/page.tsx
redirect('/account')
```

**Effort**: 30 minutes  
**Impact**: LOW  
**Risk**: LOW  

**Tests**:
```bash
curl -I http://localhost:3000/dashboard
# Should redirect to /account
```

**Review**: Product manager

---

## Phase 5: Code Quality & Documentation (Week 5-6)

### P5-1: Standardize Import Paths
**Issue**: Inconsistent use of `@/` vs relative imports

**Changes**:
1. Enforce `@/` for all src imports
2. Use relative only for same-directory imports
3. Add ESLint rule

**Effort**: 4 hours  
**Impact**: LOW - Maintainability  
**Risk**: LOW  

---

### P5-2: Add Missing Tests
**Issue**: Low test coverage for services

**Targets**:
- Analytics service: 80% coverage
- Quote service: 90% coverage
- Error logging: 70% coverage

**Effort**: 12 hours  
**Impact**: HIGH - Prevents regressions  
**Risk**: LOW  

---

### P5-3: Update Documentation
**Issue**: Outdated docs after refactoring

**Changes**:
1. Update API documentation
2. Update component storybook
3. Update architecture diagrams
4. Update README

**Effort**: 6 hours  
**Impact**: MEDIUM  
**Risk**: LOW  

---

## Summary Timeline

| Phase | Duration | Effort | Risk |
|-------|----------|--------|------|
| Phase 0: Critical Bugs | 2 days | 3 hours | LOW |
| Phase 1: Infrastructure | 3 days | 7 hours | MEDIUM |
| Phase 2: Services | 5 days | 13 hours | MEDIUM |
| Phase 3: Components | 5 days | 7 hours | MEDIUM |
| Phase 4: Routing | 3 days | 2.5 hours | LOW |
| Phase 5: Quality | 10 days | 22 hours | LOW |
| **Total** | **4-6 weeks** | **54.5 hours** | **MEDIUM** |

---

## Risk Mitigation

### High-Risk Changes
1. **Prisma consolidation**: Create feature branch, test thoroughly
2. **Analytics migration**: Gradual rollout, monitor event counts
3. **Brand card consolidation**: Visual regression tests required

### Rollback Strategy
- All changes in separate PRs
- Feature flags for gradual rollout
- Database backups before migrations
- Git tags for each phase completion

---

## Success Metrics

- [ ] Zero duplicate files remaining
- [ ] All tests passing (>90% coverage)
- [ ] Build time reduced by 15%
- [ ] No routing conflicts
- [ ] Consistent import patterns
- [ ] Updated documentation
- [ ] Zero critical bugs

---

## Git Workflow

```bash
# Create feature branch for each phase
git checkout -b refactor/phase-0-critical-bugs
git checkout -b refactor/phase-1-infrastructure
git checkout -b refactor/phase-2-services
git checkout -b refactor/phase-3-components
git checkout -b refactor/phase-4-routing
git checkout -b refactor/phase-5-quality

# Each phase gets its own PR
# Merge to main after review and testing
```

---

## Review Requirements

| Phase | Reviewers | Approval Required |
|-------|-----------|-------------------|
| Phase 0 | Backend + QA | 2 approvals |
| Phase 1 | Senior Backend + DevOps | 2 approvals |
| Phase 2 | Backend Lead | 1 approval |
| Phase 3 | Frontend + Designer | 2 approvals |
| Phase 4 | Full-stack | 1 approval |
| Phase 5 | Tech Lead | 1 approval |
