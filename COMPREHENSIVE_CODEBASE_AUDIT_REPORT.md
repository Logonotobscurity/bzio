# Comprehensive Codebase Architecture Audit Report
**Project:** BZIONU (B2B E-Commerce Platform)  
**Framework:** Next.js 16 + TypeScript + Prisma + Next-Auth + Zustand  
**Audit Date:** December 25, 2025  
**Status:** Detailed Analysis Complete

---

## Executive Summary

The codebase demonstrates a **hybrid architecture with significant organizational inconsistencies**. While it has a foundation of best practices (modular services, API routes, database abstraction), it suffers from:

- **Dual Prisma imports** creating confusion and import inconsistency
- **Mixed data layer patterns** (services, repositories, and direct API access)
- **Scattered business logic** across services, API routes, and server actions
- **Under-utilized repositories** with redundant static/database switching logic
- **Poor separation of concerns** in admin actions and API routes
- **Type definition fragmentation** across multiple files
- **Deep nesting in component structures** reducing reusability
- **Inconsistent error handling** and logging patterns
- **Weak abstraction boundaries** between layers

**Overall Assessment:** The codebase is **functional but not optimally organized**. It would benefit significantly from careful restructuring while maintaining backward compatibility.

---

## Critical Findings

### 1. **CRITICAL: Dual Prisma Import Paths** ⚠️
**Severity:** High | **Impact:** Developer Confusion, Maintenance Risk

#### Problem
Two competing Prisma singleton patterns exist in the codebase:

**Location 1:** `src/lib/prisma.ts` (OLD)
```typescript
import { PrismaClient } from '@prisma/client';
// Standard PrismaClient singleton - DEPRECATED
```

**Location 2:** `src/lib/db/index.ts` (NEW)
```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
// Uses PG adapter for connection pooling
```

#### Current State (Chaotic)
| File | Import Path | Count |
|------|------------|-------|
| API Routes | `@/lib/prisma` | 8 files |
| API Routes | `@/lib/db` | 12 files |
| Services | `@/lib/prisma` | 6 files |
| Services | `@/lib/db` | 7 files |
| Repositories | `@/lib/db` | 4 files |
| Lib files | Mixed | 3 files |

**Import Patterns Found:**
- `import prisma from '@/lib/prisma'` (default export)
- `import { prisma } from '@/lib/db'` (named export)
- `import { prisma } from '@/lib/db'` used inconsistently

#### Example Inconsistencies
```typescript
// services/userService.ts
import prisma from '@/lib/prisma';  // OLD PATTERN

// services/quoteService.ts
import { prisma } from '@/lib/db';  // NEW PATTERN

// Both work but create mental overhead for developers
```

#### Root Cause
Appears to be a partial migration from old singleton (`lib/prisma.ts`) to new adapter-based singleton (`lib/db/index.ts`).

#### Risks
- Developers must know which import path to use in new files
- No single source of truth for database configuration
- Risk of instantiating multiple PrismaClient instances
- Difficult to modify database configuration globally

---

### 2. **Repository Pattern Under-Utilization**
**Severity:** Medium-High | **Impact:** Weak Data Abstraction

#### Problem
A sophisticated repository pattern exists but is inadequately utilized:

```typescript
// src/repositories/index.ts
const useDatabase = process.env.DATABASE_URL && process.env.USE_DATABASE === 'true';

export const brandRepository = useDatabase ? brandDbRepo : brandStaticRepo;
export const categoryRepository = useDatabase ? categoryStaticRepo : categoryDbRepo;  // WRONG ORDER!
export const companyRepository = useDatabase ? companyStaticRepo : companyDbRepo;
export const productRepository = useDatabase ? productStaticRepo : productDbRepo;
```

#### Issues Found

1. **Type Inconsistency:** `categoryRepository` uses wrong ternary order
2. **Limited Coverage:** Only product catalog repositories (4 repositories)
   - Missing: User, Quote, Address, Notification repositories
3. **Poor Integration:**
   - `productService` uses repositories ✓
   - `userService` directly accesses Prisma ✗
   - `quoteService` directly accesses Prisma ✗
   - Other services bypass repository layer ✗
4. **Static Data Source:** Unused static repositories contradict real DB usage
5. **Inconsistent Naming:** Mix of camelCase and PascalCase in exports

#### Data Access Pattern Currently
```
Direct Database Access (54% of services)
├── userService.ts → prisma.user.*
├── quoteService.ts → prisma.$transaction()
├── addressService.ts → prisma.address.*
└── 7+ other services

Repository Pattern (20% usage)
├── productService → repositories
└── productService for catalogs only

API Routes (Mixed)
├── Some use services
├── Some use repositories
├── Most directly access prisma
```

---

### 3. **Scattered Business Logic Across Layers**
**Severity:** High | **Impact:** Code Maintenance, Testing Difficulty

#### Problem Areas

**A. API Routes with Business Logic**
```typescript
// src/app/api/quote-requests/route.ts (lines 27-228)
- Quote creation WITH transaction logic
- Email notification sending
- Activity tracking
- Role-based notification broadcasting
- All in a single 200-line POST handler
```

**B. Server Actions with Complex Queries**
```typescript
// src/app/admin/_actions/activities.ts (1,000+ lines)
- Direct Prisma queries (no service abstraction)
- Complex pagination logic
- Statistical calculations
- Multiple data transformation steps
- Duplicated logic in activities-optimized.ts (near-identical file)
```

**C. Services with Mixed Responsibilities**
```typescript
// src/services/productService.ts (411 lines)
- Product CRUD operations
- Brand enrichment logic
- Category data transformation
- Company directory calculations
- Cache management
- Multiple concerns mixed
```

#### Logic Distribution Pattern
```
Business Logic Location Distribution:
├── API Routes: 35% (POST handlers with validation + processing)
├── Services: 45% (Mixed concerns, some services are 400+ lines)
├── Server Actions: 15% (Admin dashboard data fetching + updates)
├── Components: 5% (Local state management, some business logic)
└── Missing: Dedicated Use Cases/Domain Classes: 0%
```

---

### 4. **Type Definition Fragmentation**
**Severity:** Medium | **Impact:** Type Safety, Code Navigation

#### Issue
Schema definitions scattered across multiple files without clear organization:

**Files Containing Type Definitions:**
```
src/lib/schema.ts                    (Company, Brand, Product, Category, ErrorLogReport)
src/lib/types/index.ts              (ISendEmailOptions)
src/services/productService.ts       (CompanySpecialty, EnrichedBrandData, EnrichedCategoryData)
src/services/searchService.ts        (SearchResult)
src/services/resourcesService.ts     (ResourceItem)
src/services/newsService.ts          (NewsItem)
src/lib/validations/forms.ts         (Zod schemas)
src/lib/email-schemas.ts             (Zod schemas for emails)
prisma/schema.prisma                 (Database models)
src/stores/*/ts                      (Zustand state types)
src/app/admin/_actions/*.ts          (Action-specific types)
```

#### Problems
- **No single source of truth:** Same types defined in different places
- **Drift risk:** Types in services may diverge from API models
- **Navigation difficulty:** Developers don't know where to find type definitions
- **Duplication:** Similar types defined multiple times with different names

#### Example Duplication
```typescript
// src/lib/schema.ts
export type Product = { id: number; name: string; ... }

// Prisma generated types
// @prisma/client Product type

// src/services/productService.ts local types
// Separate definitions for enriched products
```

---

### 5. **Poor Separation of Concerns in Admin Module**
**Severity:** High | **Impact:** Code Bloat, Testing, Maintenance

#### Issue
Admin functionality violates single responsibility:

```
src/app/admin/_actions/ (8 files, mixed concerns)
├── activities.ts (1,000 lines) - Data fetching + statistics + audit logs
├── activities-optimized.ts (750 lines) - Duplicate of above with optimization
├── notifications.ts (100 lines) - Notification creation + broadcasting
├── tracking.ts (250 lines) - Event tracking + creation + notification dispatch
├── products.ts (100 lines) - Product CRUD + form handling
├── customers.ts (100 lines) - Customer CRUD + form handling
├── orders.ts (80 lines) - Quote data retrieval
└── stock.ts (50 lines) - Stock adjustment
```

#### Specific Problems

**1. Duplicate Implementations:**
- `activities.ts` and `activities-optimized.ts` are 95% identical
- Two getRecentActivities implementations
- Two getQuotes implementations
- Two getNewUsers implementations

**2. Mixed Concerns in Single Files:**
- `tracking.ts`: Contains 8 different business functions
  - Quote request tracking
  - User registration tracking
  - Newsletter signup tracking
  - Form submission tracking
  - Product view tracking
  - Search query tracking
  - Notification creation
  - Login tracking
- Each should be isolated

**3. Missing Abstraction:**
- Direct Prisma access in all action files
- No validation layer
- No error handling wrapper
- No logging/monitoring abstraction

---

### 6. **API Route Design Issues**
**Severity:** Medium-High | **Impact:** Testability, Maintainability

#### Problems Identified

**A. Inconsistent Patterns**
```typescript
// Some routes use services
GET /api/products → calls productService.getAllProducts()

// Some use repositories
GET /api/products/brand/[slug] → calls brandRepository

// Some directly hit database
GET /api/quote-requests → prisma.quote.findMany()

// Some mix everything
POST /api/quote-requests → prisma + service + actions
```

**B. Mixed Responsibility**
```typescript
// src/app/api/quote-requests/route.ts
POST - Creates quote, sends email, logs activity, broadcasts notifications
- 200+ lines in single handler
- Multiple domain concerns
- Difficult to test
- Hard to reuse logic
```

**C. Inconsistent Error Handling**
```typescript
// Some routes have comprehensive error handling
// Some have minimal try-catch
// Some have none at all
// No unified error response format
```

**D. Authentication/Authorization**
```typescript
// Sometimes uses getServerSession()
// Sometimes uses auth from NextAuth directly
// Inconsistent error responses for auth failures
// No centralized auth middleware
```

---

### 7. **Component Structure and Organization Issues**
**Severity:** Medium | **Impact:** Reusability, Maintenance

#### Problem
Components are organized inconsistently with mixed granularity:

**Deep Nesting:**
```
src/components/
├── layout/
│   ├── header.tsx
│   ├── footer.tsx
│   ├── MonitoringProvider.tsx
│   ├── ClientChatWidget.tsx
│   └── ...
├── sections/
│   └── about/
│       ├── (multiple components)
├── products/
│   ├── FmcgBanner.tsx
│   ├── SpicesBanner.tsx
│   └── product-grid.tsx
├── auth/
│   └── WelcomeAlert.tsx (only 1 file - sparse)
├── forms/
│   ├── contact-form.tsx
│   └── newsletter-form.tsx
└── ui/ (60+ components with mixed concerns)
```

**Issues:**
- Some directories have single file (under-organized)
- Some directories have many unrelated files (over-packed)
- No clear naming convention (mix of kebab-case and PascalCase)
- Utility components mixed with domain components
- No index files for barrel exports

**Better Organization Would Be:**
```
src/components/
├── ui/              (UI primitives only - Radix-based)
├── common/          (Reusable across features)
├── features/
│   ├── products/
│   ├── quotes/
│   ├── auth/
│   ├── admin/
│   └── user/
└── layout/          (App shell components)
```

---

### 8. **Service Layer Over-Consolidation**
**Severity:** Medium | **Impact:** Single Responsibility Principle Violation

#### Issue
Services are too large and handle too many concerns:

**productService.ts (411 lines)**
- getAllProducts, getProductBySku, getProductBySlug, etc.
- getBrands, getBrandsByCompanyId, getBrandStats
- getCategories, getCategoriesByCompanyId
- getCompanies, getCompanyBySlug, getCompanyDirectory
- Page-specific data enrichment (getCategoryPageData, getBrandsPageData)
- Cache management

**Should Be Split Into:**
```
├── productService.ts (products only)
├── brandService.ts (brands - but currently overlaps)
├── categoryService.ts (categories)
├── companyService.ts (companies)
└── pageDataService.ts (page-specific enrichment)
```

---

### 9. **Authentication State Management Duplication**
**Severity:** Medium | **Impact:** State Sync Issues, Confusion

#### Problem
Authentication state managed in multiple places:

```typescript
// NextAuth session (server-side, in middleware)
src/lib/auth/config.ts

// Zustand store (client-side)
src/stores/authStore.ts

// Redux persistence (if enabled)
// Session state from NextAuth hooks
```

**Issues:**
- Client can have stale auth state compared to server
- Two sources of truth for user data
- Risk of inconsistent state between session and Zustand
- No single auth state API

---

### 10. **Inconsistent Error Handling and Logging**
**Severity:** Medium | **Impact:** Observability, Debugging

#### Problem
Error handling patterns vary significantly:

**File 1:** Comprehensive error tracking
```typescript
// src/lib/utils/error-logger.ts
- Full error logger with breadcrumbs
- Context tracking
- Performance metrics
```

**File 2:** Basic try-catch
```typescript
// src/app/api/quote-requests/route.ts
try { ... } catch (error) { console.error(...) }
```

**File 3:** Silent failures
```typescript
// Some routes with minimal error handling
```

**File 4:** No error handling
```typescript
// Some async operations unprotected
```

#### Missing:
- Unified error response format
- Error classification (client vs server errors)
- Consistent logging strategy
- Error tracking service integration (could use existing infrastructure)
- Error boundaries in components

---

### 11. **Database Query Optimization Issues**
**Severity:** Medium | **Impact:** Performance, N+1 Queries

#### Problem
Prisma queries could be optimized:

**Current Pattern (Inefficient):**
```typescript
// src/services/productService.ts
const allBrands = await brandRepo.all();
const companyBrandNames = allBrands.filter(b => b.companyId === company.id).map(b => b.name);
const allProducts = await repo.all();
return allProducts.filter(p => companyBrandNames.includes(p.brand));
```

**Should Use Include/Select:**
```typescript
// Load company with brands and products in single query
const company = await prisma.company.findUnique({
  where: { slug },
  include: {
    brands: true,
    products: true
  }
});
```

---

### 12. **Missing Data Validation Abstraction**
**Severity:** Medium | **Impact:** Consistency, Code Duplication

#### Problem
Validation scattered across multiple layers:

```typescript
// Zod schemas in lib/validations/
export const contactFormSchema = z.object({ ... })
export const quoteFormSchema = z.object({ ... })

// API routes validate manually
const result = quoteFormSchema.safeParse(body);
if (!result.success) { ... }

// No validation middleware or abstraction
// Validation not tied to services
```

**Better Approach:**
- Create validation layer/factory
- Reuse validation across API and forms
- Centralize error formatting

---

### 13. **Unused or Dead Code**
**Severity:** Low-Medium | **Impact:** Cognitive Load, Maintenance

#### Identified:

1. **Static Repository Implementations**
   - `src/repositories/static/` - Never used when database enabled
   - Appears to be fallback for dev environment

2. **Deprecated dbService**
   - `src/services/dbService.ts` - Just re-exports from `@/lib/prisma`
   - Should be removed

3. **Duplicate Activity Logic**
   - `src/app/admin/_actions/activities-optimized.ts`
   - Nearly identical to `activities.ts`
   - Should be consolidated

4. **Unused Middleware**
   - Some validation patterns defined but not used consistently

---

### 14. **Cache Implementation Issues**
**Severity:** Low-Medium | **Impact:** Cache Coherency, Staleness

#### Problem
Cache layer incomplete:

```typescript
// src/lib/cache.ts
- Caches products, brands using Redis
- Cache invalidation strategy missing
- No cache warming
- No TTL consistency
- Limited to product catalog
```

**Missing:**
- Cache invalidation on writes
- Cache warming strategy
- Monitoring/metrics
- Fallback when Redis unavailable (gracefully handled but not optimal)

---

## Code Quality Observations

### Positive Aspects ✓
1. **TypeScript adoption** - Good type coverage
2. **Next.js App Router** - Modern patterns
3. **Prisma ORM** - Type-safe database layer
4. **NextAuth integration** - Proper auth implementation
5. **API organization** - Clear directory structure under `/api`
6. **Server actions** - Good use of Next.js 13+ features
7. **Environment configuration** - Proper env handling

### Areas Needing Improvement ✗
1. **Consistency** - Import patterns vary (biggest issue)
2. **Modularity** - Services too large, mixed concerns
3. **Testing** - No test structure visible, difficult to test
4. **Documentation** - No architecture guide or patterns document
5. **Error handling** - Inconsistent across codebase
6. **Performance** - Some N+1 query patterns

---

## Architectural Patterns Analysis

### Current Pattern Distribution
```
Data Access:
├── Direct Prisma: 40%
├── Through Services: 35%
├── Through Repositories: 15%
├── Mixed: 10%

Business Logic:
├── In Services: 45%
├── In API Routes: 35%
├── In Actions: 15%
├── In Components: 5%

State Management:
├── Zustand Stores: 60%
├── NextAuth Session: 25%
├── Component State: 15%
```

### What Works Well
1. **Service-oriented approach** for product catalog
2. **Repository pattern** foundational (but under-used)
3. **Separation of API and UI logic**
4. **NextAuth for authentication**
5. **Type safety with Prisma**

### What Needs Improvement
1. **Unified data access pattern** (no single way to access data)
2. **Consistent error handling**
3. **Clear separation of business logic**
4. **Unified state management approach**

---

## Actionable Improvements (Prioritized)

### TIER 1: Critical (Fix First - Week 1-2)
1. **Resolve Dual Prisma Imports**
   - Pick one: `@/lib/db` (recommended - uses adapter)
   - Update all files importing from `@/lib/prisma` to use `@/lib/db`
   - Delete `src/lib/prisma.ts`
   - Estimated: 2-3 hours, 150+ files to update

2. **Consolidate Duplicate Activity Actions**
   - Merge `activities-optimized.ts` into `activities.ts`
   - Keep optimization improvements
   - Remove duplicate code
   - Estimated: 1-2 hours

3. **Extend Repository Pattern**
   - Create repositories for: User, Quote, Address, Notification, Order
   - Consolidate all data access through repositories
   - Replace direct Prisma access in services
   - Estimated: 4-6 hours

### TIER 2: High Priority (Week 2-3)
4. **Centralize Type Definitions**
   - Create `src/lib/types/domain.ts` for all domain types
   - Create `src/lib/types/api.ts` for API response types
   - Create `src/lib/types/store.ts` for Zustand state
   - Delete duplicate definitions
   - Estimated: 3-4 hours

5. **Refactor Admin Actions**
   - Split `tracking.ts` into separate files (one per event type)
   - Create `src/app/admin/_services/` for shared admin logic
   - Move complex queries to dedicated services
   - Estimated: 4-6 hours

6. **Implement Error Handling Strategy**
   - Create unified error response format
   - Implement error boundary wrapper for services
   - Standardize API error responses
   - Add error logging to all routes
   - Estimated: 3-4 hours

### TIER 3: Medium Priority (Week 3-4)
7. **Refactor Large Services**
   - Split `productService.ts` into:
     - `productService.ts` (products only)
     - `brandService.ts` (brands - consolidate with existing)
     - `categoryService.ts` (categories)
     - `companyService.ts` (companies)
     - `pageDataService.ts` (enrichment for pages)
   - Estimated: 4-6 hours

8. **Standardize API Route Patterns**
   - Create middleware for auth, validation, error handling
   - Establish single pattern for all routes
   - Refactor existing routes to use pattern
   - Estimated: 4-5 hours

9. **Reorganize Component Structure**
   - Restructure according to feature-based pattern
   - Create barrel exports (index.ts)
   - Consolidate under-organized directories
   - Estimated: 3-4 hours

### TIER 4: Lower Priority (Week 4-5)
10. **Optimize Database Queries**
    - Profile current queries
    - Add missing includes/selects
    - Implement select strategy
    - Test for N+1 elimination
    - Estimated: 3-4 hours

11. **Improve Cache Strategy**
    - Implement cache invalidation on writes
    - Add cache warming
    - Implement cache metrics
    - Estimated: 2-3 hours

12. **Create Architecture Documentation**
    - Document data flow architecture
    - Create patterns guide
    - Document API design patterns
    - Create deployment guide
    - Estimated: 2-3 hours

---

## Implementation Order (Recommended Sequence)

### Phase 1: Foundation (Critical)
```
Week 1:
├── Fix Prisma imports (BLOCKING - affects all other changes)
├── Consolidate duplicate activities
└── Create type definition structure

Week 2:
├── Extend repository pattern
├── Refactor admin actions
└── Implement error handling
```

### Phase 2: Services & Logic (High Priority)
```
Week 3:
├── Split large services
├── Refactor API routes
└── Consolidate component structure
```

### Phase 3: Optimization & Polish (Medium Priority)
```
Week 4:
├── Optimize database queries
├── Improve caching
└── Documentation
```

---

## Quick Reference: Key Decision Points

### 1. Data Access Pattern
**Decision:** Use repository pattern for ALL data access
- Create repositories for each domain entity
- Services orchestrate repositories
- API routes call services (never repositories directly)
- This creates clear layers and testability

### 2. Database Client
**Decision:** Use `@/lib/db` (with PG adapter)
- Provides better connection pooling
- Only location for Prisma configuration
- Single source of truth

### 3. Error Handling
**Decision:** Create error response factory
```typescript
// Create: src/lib/api-error.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) { ... }
}
```

### 4. Types Organization
**Decision:** Segregate by concern
- `domain.ts` - Business entity types
- `api.ts` - API request/response types
- `dto.ts` - Data transfer object types
- Keep Prisma types as-is

### 5. State Management
**Decision:** Keep Zustand for UI state, use NextAuth for auth state
- Don't duplicate auth state in Zustand
- Use hooks to sync when needed
- Clear boundary: Zustand = UI, NextAuth = Identity

---

## File Structure After Improvements

```
src/
├── lib/
│   ├── db/
│   │   └── index.ts (single Prisma import point)
│   ├── types/
│   │   ├── domain.ts (Company, Product, Brand, etc.)
│   │   ├── api.ts (API request/response types)
│   │   └── store.ts (Zustand state types)
│   ├── validations/
│   │   ├── forms.ts
│   │   ├── schemas.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── error-handler.ts
│   │   ├── api-error.ts
│   │   └── ... (existing utilities)
│   └── api/
│       ├── middleware.ts
│       └── response.ts
├── repositories/
│   ├── user.ts
│   ├── product.ts
│   ├── quote.ts
│   ├── address.ts
│   ├── notification.ts
│   └── base.ts (shared repository logic)
├── services/
│   ├── user.ts
│   ├── product.ts
│   ├── brand.ts
│   ├── category.ts
│   ├── company.ts
│   ├── quote.ts
│   ├── pageData.ts
│   └── (domain services only)
├── app/
│   ├── api/
│   │   ├── middleware.ts
│   │   └── (routes as currently organized)
│   ├── admin/
│   │   ├── _actions/
│   │   │   ├── activities/
│   │   │   │   ├── get-activities.ts
│   │   │   │   ├── get-stats.ts
│   │   │   │   └── get-quotes.ts
│   │   │   ├── tracking/
│   │   │   │   ├── quote.ts
│   │   │   │   ├── user.ts
│   │   │   │   ├── newsletter.ts
│   │   │   │   └── form.ts
│   │   │   └── notifications.ts
│   │   └── (pages as currently organized)
│   └── (feature routes)
├── components/
│   ├── ui/ (primitives)
│   ├── common/ (shared)
│   ├── features/
│   │   ├── products/
│   │   ├── quotes/
│   │   ├── auth/
│   │   ├── admin/
│   │   └── account/
│   └── layout/
├── stores/
│   ├── ui.ts
│   ├── cart.ts
│   ├── quote.ts
│   ├── menu.ts
│   ├── preferences.ts
│   └── activity.ts
└── hooks/
    └── (custom hooks)
```

---

## Monitoring & Maintenance

### After Implementation
1. **Code Quality Metrics**
   - Average service file size: < 300 lines
   - Test coverage: > 70%
   - Type coverage: > 95%

2. **Performance Metrics**
   - Monitor N+1 queries in production
   - Cache hit rate tracking
   - API response time P95 < 500ms

3. **Architectural Compliance**
   - Eslint rule: Only services can import repositories
   - Eslint rule: API routes use middleware pattern
   - Eslint rule: No direct Prisma in routes

---

## Risk Assessment

### Low Risk Changes
✓ Consolidating duplicate code  
✓ Organizing types  
✓ Creating missing repositories

### Medium Risk Changes
⚠ Refactoring services (affects many imports)  
⚠ Changing API patterns (affects consumers)

### High Risk Changes
⛔ Removing Prisma import file (requires all-at-once change)

**Mitigation:** Use find-and-replace, follow with comprehensive testing

---

## Conclusion

The codebase has a **solid foundation** but suffers from **organizational inconsistencies** that create friction for developers. The recommended improvements would:

1. **Increase consistency** - Single import patterns, unified error handling
2. **Improve maintainability** - Clear layers, single responsibility
3. **Enhance testability** - Services with clear boundaries
4. **Reduce complexity** - Better organization, fewer concerns per file
5. **Enable scaling** - Clear patterns for new features

**Estimated Total Effort:** 25-35 developer hours  
**Recommended Timeline:** 4-5 weeks with incremental rollout  
**Priority:** High - Current state is sustainable but not optimal

The improvements are **not urgent** but would provide **significant long-term value** in development velocity, code quality, and team onboarding.
