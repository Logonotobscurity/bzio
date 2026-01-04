# PHASE 2 IMPLEMENTATION GUIDE

**Phase:** High Priority Refactoring  
**Timeline:** 2 weeks (48 hours)  
**Status:** READY TO START  
**Date:** December 25, 2025

---

## 🎯 PHASE 2 OBJECTIVES

### Objective 1: Extract God Objects (24 hours)
Split productService.ts (411 LOC) into 3 focused services

### Objective 2: Consolidate Validation (12 hours)
Unify form validation using Zod schemas

### Objective 3: Implement Code Splitting (4 hours)
Lazy load admin and chart components

### Objective 4: Setup React Query (4 hours - Optional)
Better server state management

**Total: 48 hours (or 44 without React Query)**

---

## ✅ PHASE 2: QUICK START

### What's Been Prepared (Phase 1.4 Cleanup)
- ✅ `src/services/pricing.ts` created - Centralized pricing logic
- ✅ `src/services/__tests__/pricing.test.ts` created - 9 test cases
- ✅ `src/lib/validations/forms.ts` exists and ready - 8 validation schemas
- ✅ Dead code files ready for deletion - 5 files
- ✅ All Phase 1 tests passing - 37 test cases

### Files Already Existing
- ✅ `src/services/brandService.ts` - Brand logic
- ✅ `src/services/categoryService.ts` - Category logic
- ✅ `src/services/userService.ts` - User logic
- ✅ `src/services/quoteService.ts` - Quote logic

---

## 📋 PHASE 2: DETAILED TASKS

### 2.1 Consolidate Pricing Logic (2 hours)

**Status:** Ready  
**Files Created:** `src/services/pricing.ts`  
**Tests Created:** `src/services/__tests__/pricing.test.ts`

**Next Steps:**
1. Run pricing tests: `npm test -- pricing.test.ts`
2. Locate pricing calculations in code:
   - `src/components/product-card.tsx` - Check for inline calculations
   - `src/components/quote-form.tsx` - Check for inline calculations
   - `src/app/products/[slug]/page.tsx` - Check for inline calculations
3. Update components to use `pricing.ts` service:

```typescript
// Before (inline)
const total = product.price * quantity;

// After (using service)
import { calculatePrice } from '@/services/pricing';
const total = await calculatePrice(product, quantity, discountPercent);
```

4. Test all components still work
5. Commit: `git add . && git commit -m "refactor: consolidate pricing logic to service"`

### 2.2 Split productService.ts (8 hours)

**Current State:** 411 LOC, 13 functions  
**Target State:** 3 focused services + 1 enrichment service

**Existing Services to Leverage:**
- `src/services/brandService.ts` - Already handles brand logic
- `src/services/categoryService.ts` - Already handles category logic
- `src/services/productService.ts` - Will keep core product functions

**New Service to Create:**
- `src/services/enrichmentService.ts` - Data enrichment for pages

**Steps:**

#### Step 2.2.1: Create enrichmentService.ts (3 hours)

```typescript
// src/services/enrichmentService.ts
import * as productService from './productService';
import * as brandService from './brandService';
import * as categoryService from './categoryService';

/**
 * Enrich category data with product/brand counts and stats
 */
export const enrichCategoryData = async (category: Category) => {
  const products = await productService.getProductsByCategory(category.slug);
  const brands = new Set(products.map(p => p.brandId)).size;
  
  return {
    ...category,
    productCount: products.length,
    brandCount: brands,
    inStockCount: products.filter(p => p.isAvailable).length,
    priceRange: calculatePriceRange(products),
  };
};

/**
 * Enrich brand data with product/category counts
 */
export const enrichBrandData = async (brand: Brand) => {
  const products = await productService.getProductsByBrand(brand.slug);
  // ... enrichment logic
};

/**
 * Get fully enriched category page data
 */
export const getCategoryPageData = async (categorySlug: string) => {
  // Existing logic using enriched category
};
```

#### Step 2.2.2: Update productService.ts (3 hours)

Remove enrichment functions, keep core:
- `getAllProducts()`
- `getProductBySku()`
- `getProductBySlug()`
- `getProductsByBrand()`
- `getProductsByCategory()`
- `searchProducts()`

#### Step 2.2.3: Update Imports (2 hours)

Find all files importing from productService:
```bash
grep -r "from '@/services/productService'" src/
```

Update imports:
```typescript
// Before
import { getCategoryPageData } from '@/services/productService';

// After
import { getCategoryPageData } from '@/services/enrichmentService';
```

### 2.3 Consolidate Form Validation (4 hours)

**Status:** `src/lib/validations/forms.ts` already exists

**Current Schemas Available:**
- `contactFormSchema`
- `newsletterFormSchema`
- `quoteFormSchema`

**Steps:**

#### Step 2.3.1: Add Missing Schemas (1 hour)

Add to `src/lib/validations/forms.ts`:
```typescript
export const productSearchSchema = z.object({...});
export const loginSchema = z.object({...});
export const registrationSchema = z.object({...});
```

#### Step 2.3.2: Update Components to Use Schemas (2 hours)

Update forms to import and use schemas:

```typescript
// src/components/quote-request-form.tsx
import { quoteFormSchema } from '@/lib/validations/forms';
import { zodResolver } from '@hookform/resolvers/zod';

const { register, formState: { errors } } = useForm({
  resolver: zodResolver(quoteFormSchema),
});
```

#### Step 2.3.3: Update API Routes (1 hour)

Validate inputs server-side:
```typescript
// src/app/api/quote-requests/route.ts
import { quoteFormSchema } from '@/lib/validations/forms';

export async function POST(req: Request) {
  const body = await req.json();
  
  // Validate
  const validation = quoteFormSchema.safeParse(body);
  if (!validation.success) {
    return Response.json({ errors: validation.error }, { status: 400 });
  }
  
  // Process validated data
  const data = validation.data;
}
```

### 2.4 Clean Up Phase 1 Remaining Tasks (4 hours)

#### Task 2.4.1: Remove Dead Code (1 hour)

```bash
# Verify no imports
grep -r "useCartStore\|useQuoteStore\|chat-widget" src/

# If clear, delete
rm src/lib/store/activity.ts
rm src/lib/store/auth.ts
rm src/lib/store/quote.ts

# Commit
git add . && git commit -m "chore: remove legacy store files"
```

#### Task 2.4.2: Test Everything (1.5 hours)

```bash
# Run all tests
npm test

# Check coverage
npm test -- --coverage

# Run linter
npm run lint

# Build check
npm run build
```

#### Task 2.4.3: Document Changes (1.5 hours)

Create `PHASE_2_IMPLEMENTATION_NOTES.md`:
- List all files modified
- Explain service extraction
- List new test files
- Outline validation consolidation

---

## 🧪 TESTING STRATEGY

### Test Files Already Created
- ✅ `src/services/__tests__/pricing.test.ts` - 9 tests
- ✅ `src/services/__tests__/productService.test.ts` - 11 tests
- ✅ `src/services/__tests__/analyticsService.test.ts` - 10 tests

### New Tests to Create
```bash
# Create tests for new services
npm test -- --testPathPattern="enrichmentService"
npm test -- --testPathPattern="validation"
```

### Test Execution
```bash
# Run all tests
npm test

# Expected: 60+ tests passing
# Coverage target: 35%+
```

---

## 📊 SUCCESS METRICS

### Code Quality Improvements
```
Before:
- productService.ts: 411 LOC (god object)
- Validation: Scattered across components
- Pricing: Duplicated in 4 locations

After:
- productService.ts: ~150 LOC (focused)
- enrichmentService.ts: ~150 LOC (enrichment)
- Validation: Centralized in 1 file
- Pricing: Single source of truth
```

### Test Coverage
```
Before: 25% (37 tests)
After:  35%+ (50+ tests)
Target: 60% by Phase 3
```

### Bundle Size Impact
```
Before: 450KB (145KB gzip)
After:  400KB (135KB gzip) - 7% reduction
Target: 200KB (85KB gzip) by Phase 4
```

---

## 🚀 QUICK EXECUTION CHECKLIST

### Day 1-2: Pricing & Validation (8 hours)
- [ ] Run pricing tests: `npm test -- pricing.test.ts`
- [ ] All pricing tests passing
- [ ] Update components to use pricing service
- [ ] Add missing validation schemas
- [ ] Update 3+ components to use validation schemas
- [ ] All tests passing

### Day 3-5: Service Extraction (24 hours)
- [ ] Create enrichmentService.ts
- [ ] Move enrichment functions from productService
- [ ] Update all imports (grep + find-replace)
- [ ] Update 15+ import statements
- [ ] Test all functions
- [ ] Delete unused code from productService
- [ ] All tests passing

### Day 6-7: Code Cleanup (8 hours)
- [ ] Remove 5 dead code files
- [ ] Run full test suite
- [ ] Run linter
- [ ] Build check: `npm run build`
- [ ] Coverage report
- [ ] Documentation

### Day 8: Code Review & Merge (8 hours)
- [ ] Review changes
- [ ] Address any issues
- [ ] Commit and push
- [ ] Verify CI/CD passing
- [ ] Create Phase 2 summary

---

## 📈 EXPECTED OUTCOMES

### Code Organization
✅ Services split by responsibility  
✅ Validation centralized  
✅ Pricing logic unified  
✅ Dead code removed  

### Quality Metrics
✅ 50+ tests written  
✅ 35%+ coverage achieved  
✅ 0 circular dependencies  
✅ Maintainability improved  

### Team Knowledge
✅ Clear service architecture  
✅ Testing patterns established  
✅ Validation strategy documented  
✅ Future refactoring enabled  

---

## ⚠️ COMMON PITFALLS & SOLUTIONS

### Pitfall 1: Import Errors After Refactoring
**Solution:** Use find-replace carefully
```bash
# Before making changes, list all imports
grep -r "productService" src/ | wc -l

# After changes, verify count decreased appropriately
grep -r "enrichmentService" src/ | wc -l
```

### Pitfall 2: Circular Dependencies
**Solution:** Verify import graph
```bash
# Check for cycles
npm ls

# If issues, restructure imports
```

### Pitfall 3: Tests Breaking After Refactoring
**Solution:** Update test imports
```bash
# Search for old imports in tests
grep -r "productService" src/__tests__/

# Update to new service imports
```

### Pitfall 4: Forgetting to Update API Routes
**Solution:** Audit all API files
```bash
grep -r "productService\|enrichmentService" src/app/api/
```

---

## 🔄 DEPENDENCIES & SEQUENCE

```
Phase 1 Complete
    ↓
Phase 2.1: Pricing Consolidation (2 hours)
    ↓
Phase 2.2: Service Extraction (8 hours)
    ├─ enrichmentService.ts created
    ├─ productService.ts updated
    └─ Imports updated
    ↓
Phase 2.3: Validation Consolidation (4 hours)
    ├─ Schemas added
    ├─ Components updated
    └─ API routes updated
    ↓
Phase 2.4: Cleanup & Testing (4 hours)
    ├─ Dead code removed
    ├─ Tests run
    ├─ Build verified
    └─ Documentation created
    ↓
Phase 2 Complete → Ready for Phase 3
```

---

## 📞 SUPPORT & RESOURCES

### If You're Stuck
1. **Service Extraction:** See `IMPLEMENTATION_SNIPPETS.md` section 2.1
2. **Validation:** See `IMPLEMENTATION_SNIPPETS.md` section 2.3
3. **Testing:** See `src/services/__tests__/` for examples
4. **Troubleshooting:** See `PHASE_1_QUICK_START.md`

### Commands Reference
```bash
# Run tests
npm test

# Run specific tests
npm test -- pricing.test.ts

# Check coverage
npm test -- --coverage

# Lint check
npm run lint

# Build
npm run build

# Find references
grep -r "functionName" src/
```

---

## 🎯 PHASE 2 SUCCESS DEFINITION

✅ **Code Quality:**
- Services split by responsibility
- Validation centralized
- Pricing logic unified
- Tests passing

✅ **Test Coverage:**
- 50+ test cases
- 35%+ code coverage
- Critical paths tested

✅ **Documentation:**
- Changes documented
- New patterns clear
- Team aligned

✅ **Team Readiness:**
- Phase 3 tasks clear
- Architecture solid
- Confidence high

---

**PHASE 2: Ready to Execute**

Start with Day 1-2 checklist above.
Target completion: January 10, 2026.

Generated: December 25, 2025
