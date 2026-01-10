# IMPLEMENTATION ROADMAP: DETAILED ACTION PLAN

**Project:** BZION Hub  
**Timeline:** 12 Weeks  
**Team:** 2 developers (can adjust)  
**Updated:** December 25, 2025

---

## OVERVIEW

This roadmap prioritizes actions based on impact and dependencies. Each phase builds on previous work to minimize breaking changes.

**Total Effort:** 156 hours
**Estimated Duration:** 8-12 weeks (2 developers at 20 hrs/week)

---

## PHASE 0: PREPARATION (Week 0 - 2 hours)

### 0.1 Setup & Planning
- [ ] Create feature branches for each epic
- [ ] Setup branch protection rules
- [ ] Configure pre-commit hooks
- [ ] Schedule team review meetings

### 0.2 Baseline Metrics
- [ ] Measure current bundle size
- [ ] Record current test coverage
- [ ] Benchmark TTI and FCP
- [ ] Document baseline code quality metrics

---

## PHASE 1: CRITICAL FIXES (Weeks 1-2, 40 hours)

### 1.1 Establish Testing Infrastructure (12 hours)

**Task:** Set up proper test environment

```bash
# Update jest.setup.js
npm install --save-dev @testing-library/jest-dom
npm install --save-dev jest-mock-extended
```

**Create: `jest.setup.js` (proper config)**
```typescript
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

**Create: `src/__tests__/setup.ts`**
```typescript
// Global test utilities and mocks
export const mockPrismaClient = {
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  // ... other models
};

export const createMockProduct = (overrides = {}) => ({
  id: '1',
  name: 'Test Product',
  price: 100,
  ...overrides,
});
```

**Deliverables:**
- ✅ jest.setup.js properly configured
- ✅ Test utilities exported
- ✅ Mocks established
- ✅ Documentation on running tests

### 1.2 Add Critical Service Tests (16 hours)

**Priority: productService.ts (411 LOC)**

**Create: `src/services/__tests__/productService.test.ts`** (120 lines)
```typescript
import * as productService from '../productService';

describe('productService', () => {
  describe('getAllProducts', () => {
    it('should return all products', async () => {
      const products = await productService.getAllProducts();
      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
    });
  });

  describe('getProductBySlug', () => {
    it('should return product by slug', async () => {
      const product = await productService.getProductBySlug('test-slug');
      expect(product?.slug).toBe('test-slug');
    });

    it('should return undefined for non-existent slug', async () => {
      const product = await productService.getProductBySlug('non-existent');
      expect(product).toBeUndefined();
    });
  });

  describe('getCategoryPageData', () => {
    it('should return enriched category data', async () => {
      const data = await productService.getCategoryPageData();
      expect(Array.isArray(data)).toBe(true);
      expect(data[0]).toHaveProperty('productCount');
      expect(data[0]).toHaveProperty('brandCount');
    });
  });

  // ... 20+ more tests
});
```

**Also test:**
- quoteService.ts (8 hours)
- analyticsService.ts (4 hours)
- userService.ts (4 hours)

**Deliverables:**
- ✅ 40+ test assertions for critical services
- ✅ 95%+ code coverage for services
- ✅ Test documentation

### 1.3 Fix Memory Leaks (8 hours)

**1.3.1 useScrollPosition.ts**
```typescript
// BEFORE
useEffect(() => {
  window.addEventListener('scroll', handleScroll);
}, []);

// AFTER
useEffect(() => {
  const handleScroll = () => { /* ... */ };
  window.addEventListener('scroll', handleScroll);
  
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

**1.3.2 useWebSocket.ts**
```typescript
// BEFORE
useEffect(() => {
  const ws = new WebSocket(url);
}, [url]);

// AFTER
useEffect(() => {
  const ws = new WebSocket(url);
  
  return () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  };
}, [url]);
```

**1.3.3 NewsletterPopup.tsx**
```typescript
// BEFORE
useEffect(() => {
  const timer = setTimeout(() => setOpen(true), 2000);
}, []);

// AFTER
useEffect(() => {
  const timer = setTimeout(() => setOpen(true), 2000);
  
  return () => clearTimeout(timer);
}, []);
```

**Verification:**
```bash
# Run Chrome DevTools Memory profiler
# Record heap snapshots before/after
# Should see 40-60% memory reduction in long sessions
```

### 1.4 Remove Dead Code (4 hours)

**Files to Delete:**
```
src/lib/store/activity.ts      # Moved to src/stores/
src/lib/store/auth.ts          # Moved to src/stores/
src/lib/store/quote.ts         # Moved to src/stores/
src/components/chat-widget.tsx # Duplicate of ClientChatWidget
jest.setup.js                  # Empty, needs rewrite (done in 1.1)
```

**Steps:**
1. Verify no imports from these files
2. Run tests to confirm no breakage
3. Delete files
4. Commit with message: "chore: remove dead code and legacy stores"

**Verification:**
```bash
# Search for any remaining imports
grep -r "src/lib/store" src/
grep -r "chat-widget" src/

# Should return 0 results
```

---

## PHASE 2: HIGH PRIORITY (Weeks 3-4, 48 hours)

### 2.1 Extract God Objects (24 hours)

**2.1.1 Split productService.ts (411 LOC) into 3 services**

**Current Structure:**
```typescript
// src/services/productService.ts (411 LOC)
- getAllProducts()
- getProductBySku()
- getProductBySlug()
- getProductsByBrand()
- getProductsByCategory()
- searchProducts()
- getBrands()
- getCategoriesByCompanyId()
- getCategories()
- getCompanies()
- getCategoryPageData()      // ← Data enrichment
- getBrandsPageData()        // ← Data enrichment
- getProductPageData()       // ← Data enrichment
```

**New Structure:**
```typescript
// src/services/productService.ts (200 LOC)
export const getAllProducts = async () => { ... };
export const getProductBySku = async (sku) => { ... };
export const getProductBySlug = async (slug) => { ... };
export const getProductsByBrand = async (brandSlug) => { ... };
export const getProductsByCategory = async (categorySlug) => { ... };
export const searchProducts = async (query) => { ... };

// src/services/brandService.ts (100 LOC) - NEW
export const getBrands = async () => { ... };
export const getBrandsByCompanyId = async (companyId) => { ... };
export const getFeaturedBrands = async (limit) => { ... };

// src/services/categoryService.ts (100 LOC) - NEW
export const getCategories = async () => { ... };
export const getCategoriesByCompanyId = async (companyId) => { ... };

// src/services/enrichmentService.ts (150 LOC) - NEW
export const enrichCategoryData = async (categories) => { ... };
export const enrichBrandData = async (brands) => { ... };
export const enrichProductData = async (products) => { ... };
export const getCategoryPageData = async () => { ... };
export const getBrandsPageData = async () => { ... };
export const getProductPageData = async (slug) => { ... };
```

**Steps:**
1. Create new service files
2. Move relevant functions
3. Update imports (use find-replace)
4. Test all functions
5. Delete old service

**Testing:**
```bash
npm test -- productService.test.ts
npm test -- brandService.test.ts
npm test -- categoryService.test.ts
npm test -- enrichmentService.test.ts
```

### 2.2 Consolidate Form Validation (12 hours)

**Current Problem:**
- Validation logic duplicated in 3+ forms
- API routes re-validate (should trust client)
- No shared validation schemas

**Solution: Create centralized validation schema**

**Create: `src/lib/validations/forms.ts`** (80 LOC)
```typescript
import { z } from 'zod';

export const quoteRequestSchema = z.object({
  companyName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[0-9]{10,}/),
  message: z.string().min(10).max(1000),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
  })),
});

export const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(5),
  message: z.string().min(20),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
});

// Type inference
export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
export type ContactForm = z.infer<typeof contactFormSchema>;
```

**Update forms to use schema:**
```typescript
// src/components/quote-request-form.tsx
import { quoteRequestSchema } from '@/lib/validations/forms';

const { register, formState: { errors } } = useForm({
  resolver: zodResolver(quoteRequestSchema),
});
```

**Update API routes:**
```typescript
// src/app/api/quote-requests/route.ts
import { quoteRequestSchema } from '@/lib/validations/forms';

export async function POST(request: Request) {
  const data = await request.json();
  const result = quoteRequestSchema.safeParse(data);
  
  if (!result.success) {
    return Response.json({ errors: result.error }, { status: 400 });
  }

  // Process validated data...
}
```

**Deliverables:**
- ✅ Centralized validation schema
- ✅ Updated all forms to use schema
- ✅ Updated all API routes
- ✅ 100% type safety for form data

### 2.3 Implement Code Splitting (12 hours)

**2.3.1 Split admin section**
```typescript
// src/app/layout.tsx
const AdminRoute = dynamic(() => import('@/app/admin'), {
  loading: () => <div>Loading admin...</div>,
  ssr: false, // Admin only works client-side
});

// Usage in router
if (pathname.startsWith('/admin')) {
  return <AdminRoute />;
}
```

**2.3.2 Lazy load feature components**
```typescript
// src/app/page.tsx
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('@/components/admin-dashboard'));
const AnalyticsPage = lazy(() => import('@/components/analytics-page'));

export default function Home() {
  return (
    <Suspense fallback={<Skeleton />}>
      <AdminDashboard />
    </Suspense>
  );
}
```

**2.3.3 Dynamic imports for heavy libraries**
```typescript
// src/components/chart-component.tsx
const Recharts = dynamic(() => import('recharts'), {
  loading: () => <div>Loading chart...</div>,
});
```

**Measure Impact:**
```bash
# Build and analyze bundle
npm run build
# Check .next/static/chunks for size reduction
# Should see ~56% reduction in initial bundle
```

### 2.4 Setup React Query (optional, 4 hours if done)

**Install:**
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

**Create: `src/lib/react-query.ts`**
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes
    },
  },
});
```

**Usage in components:**
```typescript
import { useQuery } from '@tanstack/react-query';

function Products() {
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(r => r.json()),
  });

  if (isLoading) return <Skeleton />;
  return <ProductList products={data} />;
}
```

---

## PHASE 3: MEDIUM PRIORITY (Weeks 5-8, 40 hours)

### 3.1 Restructure to Feature-Based Organization (24 hours)

**Current Structure (Layer-based):**
```
src/
├── app/
├── components/
├── services/
├── repositories/
└── stores/
```

**New Structure (Feature-based):**
```
src/
├── features/
│   ├── products/
│   │   ├── components/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   └── ProductDetail.tsx
│   │   ├── services/
│   │   │   └── productService.ts
│   │   ├── stores/
│   │   │   └── productStore.ts
│   │   ├── types.ts
│   │   └── index.ts (barrel export)
│   │
│   ├── quotes/
│   │   ├── components/
│   │   ├── services/
│   │   ├── stores/
│   │   └── index.ts
│   │
│   ├── auth/
│   │   ├── components/
│   │   ├── services/
│   │   ├── stores/
│   │   └── index.ts
│   │
│   ├── admin/
│   ├── checkout/
│   └── (other features)
│
├── shared/
│   ├── components/
│   │   └── ui/ (primitives)
│   │   └── common/ (shared)
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   └── constants/
│
└── app/
    ├── layout.tsx
    ├── page.tsx
    └── (routes)
```

**Migration Path (by feature):**

**Phase 3a (Weeks 5): Products Feature (8 hours)**
1. Create `src/features/products/` directory
2. Move product-related components
3. Create `services/productService.ts`
4. Create barrel exports
5. Update imports across codebase
6. Test thoroughly
7. Delete old product components

**Phase 3b (Weeks 6): Quotes Feature (8 hours)**
1. Create `src/features/quotes/`
2. Move quote-related components
3. Move quoteStore to features
4. Update imports
5. Test
6. Delete old files

**Phase 3c (Weeks 7): Auth Feature (4 hours)**
1. Create `src/features/auth/`
2. Move auth components
3. Move authStore
4. Update imports
5. Test

**Phase 3d (Weeks 8): Consolidate (4 hours)**
1. Create shared/ for common components
2. Move UI primitives to shared/components/ui/
3. Move utilities to shared/utils/
4. Move hooks to shared/hooks/
5. Final imports cleanup
6. Update documentation

**Each Migration Includes:**
- [ ] Mkdir for new structure
- [ ] Move files
- [ ] Update imports (find-replace)
- [ ] Create barrel exports (index.ts)
- [ ] Run tests
- [ ] Delete old location
- [ ] Commit with feature branch

### 3.2 Add Integration Tests (12 hours)

**Create: `src/__tests__/integration/api.test.ts`** (API route tests)
```typescript
import { createMocks } from 'node-mocks-http';
import { POST as submitQuote } from '@/app/api/quote-requests/route';

describe('API: Quote Submission', () => {
  it('should create a quote request', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        companyName: 'Test Corp',
        email: 'test@example.com',
        phone: '+234123456789',
        items: [{ productId: '1', quantity: 5 }],
      },
    });

    await submitQuote(req);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.id).toBeDefined();
  });

  it('should validate input', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { /* invalid data */ },
    });

    await submitQuote(req);

    expect(res._getStatusCode()).toBe(400);
  });
});
```

**Create: `src/__tests__/integration/workflows.test.ts`** (User flow tests)
```typescript
describe('User Workflow: Quote to Checkout', () => {
  it('should complete full quote flow', async () => {
    // 1. Add products to quote
    // 2. Submit quote request
    // 3. Receive quote response
    // 4. Proceed to checkout
    // 5. Verify order created
  });
});
```

### 3.3 Optimize Database Queries (4 hours)

**Identify N+1 queries:**
```typescript
// BEFORE: 1001 queries
const products = await prisma.product.findMany();
for (const product of products) {
  product.brand = await prisma.brand.findUnique({
    where: { id: product.brandId }
  });
}

// AFTER: 1 query with JOIN
const products = await prisma.product.findMany({
  include: {
    brand: true,
    category: true,
    company: true,
  },
});
```

**Add database indexes:**
```prisma
// prisma/schema.prisma
model Product {
  id        String   @id @default(cuid())
  slug      String   @unique
  name      String
  brandId   String
  
  brand     Brand    @relation(fields: [brandId], references: [id])
  
  // Add indexes for frequently filtered fields
  @@index([brandId])
  @@index([categoryId])
  @@index([slug])
  @@fulltext([name])  // For full-text search
}
```

**Measure Improvement:**
```bash
# Before optimization
# Total queries per request: ~50
# Database time: ~800ms

# After optimization  
# Total queries per request: ~8
# Database time: ~100ms
# Improvement: 87.5% faster
```

---

## PHASE 4: LONG-TERM (Weeks 9-12, 28 hours)

### 4.1 Comprehensive Documentation (8 hours)

**Create: `docs/ARCHITECTURE.md`** (Structure overview)
```markdown
# Architecture Overview

## Feature-Based Organization

Each feature contains:
- Components: UI components
- Services: Business logic
- Stores: Client state management
- Types: TypeScript interfaces
- index.ts: Barrel exports

## Data Flow

User Interaction
  ↓
Component
  ↓
Store (Zustand)
  ↓
Service
  ↓
Repository
  ↓
Database

## Example: Quote Request Flow

1. User fills QuoteRequestForm
2. Form validates with Zod schema
3. On submit, calls quoteService.createQuote()
4. Service validates and transforms data
5. API route calls quoteRepository.create()
6. Repository persists to database
7. Success: Update quoteStore, show toast
```

**Create: `docs/DEVELOPMENT.md`** (Getting started)
```markdown
# Development Guide

## Setup
```

**Create: `docs/API.md`** (API documentation)
```markdown
# API Documentation

## Quote Requests

### POST /api/quote-requests
Creates a new quote request.

Request:
```json
{
  "companyName": "string",
  "email": "string",
  "phone": "string",
  "items": [
    { "productId": "string", "quantity": "number" }
  ]
}
```

Response:
```json
{
  "id": "string",
  "status": "pending",
  "createdAt": "ISO-8601"
}
```

Errors:
- 400: Invalid input
- 409: Duplicate submission
```

### 4.2 Performance Profiling & Optimization (12 hours)

**Use Chrome DevTools:**
```
1. Open DevTools → Performance tab
2. Record user interaction
3. Identify long tasks
4. Measure improvements
```

**Specific optimizations:**

1. **Image optimization** (4 hours)
   ```typescript
   // Use Next.js Image with optimization
   import Image from 'next/image';
   
   <Image
     src="/product.jpg"
     alt="Product"
     width={300}
     height={300}
     priority={false}
     loading="lazy"
   />
   ```

2. **Component memoization** (4 hours)
   ```typescript
   const ProductCard = React.memo(({ product }) => (
     <div>{product.name}</div>
   ));
   ```

3. **List virtualization** (4 hours)
   ```typescript
   import { FixedSizeList } from 'react-window';
   
   <FixedSizeList
     height={600}
     itemCount={products.length}
     itemSize={100}
   >
     {ProductRow}
   </FixedSizeList>
   ```

### 4.3 E2E Testing Framework (8 hours)

**Install Playwright:**
```bash
npm install -D @playwright/test
npx playwright install
```

**Create: `e2e/quote-flow.spec.ts`**
```typescript
import { test, expect } from '@playwright/test';

test('complete quote request flow', async ({ page }) => {
  // Navigate to products
  await page.goto('/products');
  
  // Search for product
  await page.fill('input[name="search"]', 'spice');
  await page.click('button[name="search"]');
  
  // Add product to quote
  await page.click('button[aria-label="Add to quote"]');
  expect(page.locator('.quote-badge')).toHaveText('1');
  
  // Open quote drawer
  await page.click('[aria-label="View quote"]');
  
  // Submit quote
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="company"]', 'Test Corp');
  await page.click('button[type="submit"]');
  
  // Verify success
  await expect(page).toHaveURL('/quote/success');
  await expect(page.locator('.success-message')).toContainText('Quote submitted');
});
```

**Run tests:**
```bash
npx playwright test
npx playwright test --ui  # Interactive mode
```

---

## METRICS & CHECKPOINTS

### Weekly Metrics to Track

```json
{
  "week_1": {
    "tests_added": 40,
    "coverage": "10%",
    "memory_leaks_fixed": 3,
    "dead_code_removed": 5,
    "bundle_size": "450KB"
  },
  "week_2": {
    "services_tested": 4,
    "coverage": "25%",
    "test_assertions": 120,
    "bundle_size": "450KB"
  },
  "week_3": {
    "god_objects_split": 1,
    "validation_consolidated": "yes",
    "bundle_size": "350KB (code splitting)",
    "coverage": "35%"
  },
  "week_4": {
    "code_split_files": 4,
    "bundle_size": "280KB (further optimization)",
    "coverage": "40%"
  },
  "week_5_8": {
    "features_reorganized": 4,
    "integration_tests": 15,
    "bundle_size": "200KB",
    "coverage": "60%"
  },
  "week_9_12": {
    "e2e_tests": 8,
    "documentation_pages": 5,
    "final_coverage": "65%",
    "final_bundle": "180KB"
  }
}
```

### Go-Live Checklist

- [ ] Test coverage ≥ 60%
- [ ] All memory leaks fixed
- [ ] Bundle size ≤ 200KB
- [ ] TTI ≤ 1.8s
- [ ] 0 critical security issues
- [ ] API documentation complete
- [ ] Code reviews completed
- [ ] Performance benchmarks met
- [ ] E2E tests passing
- [ ] Team trained on new structure

---

## DEPENDENCY GRAPH

```
Phase 1 (Critical)
  ↓
Phase 2 (High Priority) - Depends on Phase 1
  ├─ 2.1 (Extract services) - Optional dependency on 2.2
  ├─ 2.2 (Validation) - Independent
  ├─ 2.3 (Code splitting) - Independent
  └─ 2.4 (React Query) - Depends on 2.3
  ↓
Phase 3 (Medium) - Depends on Phase 2
  ├─ 3.1 (Feature restructure) - Depends on 2.1
  ├─ 3.2 (Integration tests) - Independent
  ├─ 3.3 (DB optimization) - Independent
  ↓
Phase 4 (Long-term) - Depends on Phases 1-3
  ├─ 4.1 (Documentation)
  ├─ 4.2 (Performance)
  └─ 4.3 (E2E tests)
```

---

## RISKS & MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Breaking changes during refactor | HIGH | CRITICAL | Feature branches, thorough testing |
| Performance regression | MEDIUM | HIGH | Benchmarking before/after |
| Team knowledge gaps | MEDIUM | MEDIUM | Documentation, pair programming |
| Timeline slippage | LOW | MEDIUM | Buffer built into estimates |
| Database migration issues | LOW | CRITICAL | Backup before schema changes |

---

## SUCCESS CRITERIA

**Phase 1 (Week 2):**
- ✅ Test infrastructure working
- ✅ 5 memory leaks fixed
- ✅ Dead code removed
- ✅ 25%+ coverage achieved

**Phase 2 (Week 4):**
- ✅ Services decomposed
- ✅ Validation consolidated
- ✅ Code splitting implemented
- ✅ 40%+ coverage achieved
- ✅ 50% bundle reduction

**Phase 3 (Week 8):**
- ✅ Feature-based organization complete
- ✅ 60%+ test coverage
- ✅ Integration tests passing
- ✅ Database optimized
- ✅ 67% bundle reduction

**Phase 4 (Week 12):**
- ✅ 65%+ test coverage
- ✅ Full documentation
- ✅ Performance optimization complete
- ✅ E2E tests implemented
- ✅ Ready for 10-developer scaling

---

## RESOURCE REQUIREMENTS

**Team:** 2 developers
**Duration:** 12 weeks at 20 hrs/week = 240 developer hours
**Actual effort:** 156 hours (65% efficiency)
**Buffer:** 84 hours for unknowns

**Meetings:**
- Weekly standups (1 hour)
- Bi-weekly reviews (2 hours)
- Monthly planning (2 hours)

**Infrastructure:**
- CI/CD for testing
- Staging environment for testing
- Monitoring/observability tools

---

**Document Version:** 1.0  
**Last Updated:** December 25, 2025
