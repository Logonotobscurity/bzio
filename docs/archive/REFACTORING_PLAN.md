# Codebase Refactoring & Reorganization Plan

## 1. Introduction & Goals

This document outlines a strategic plan to review and refactor the BZION Hub codebase.

**Primary Goals:**
*   **Improve Maintainability:** Make the code easier to understand, modify, and extend.
*   **Enhance Scalability:** Structure the codebase to accommodate future growth and complexity.
*   **Boost Developer Experience:** Create a more intuitive and organized structure that helps developers find and work with code more efficiently.
*   **Reduce Technical Debt:** Proactively address issues noted in `TECHNICAL_DEBT_ANALYSIS.txt` and `maintenance.md`.

**Guiding Principle:** All proposed changes are purely structural. **No changes to user-facing functionality or UI will be made.** All refactoring will be incremental, low-risk, and validated by testing.

## 2. Proposed Codebase Structure

The current structure is functional but mixes concerns, especially within the `src/lib`, `src/components`, and `src/services` directories. We propose moving to a more modular, **feature-based architecture**.

### Proposed `src` Directory Structure:

```
src/
├── app/                      # Next.js routes & pages (Structure unchanged)
│
├── features/                 # [NEW] Main directory for business domains
│   ├── products/
│   │   ├── components/       # Product-specific components (ProductCard, ProductGrid)
│   │   ├── services.ts       # Product data-fetching logic (from productService)
│   │   └── types.ts          # Product-related types
│   │
│   ├── quote/
│   │   ├── components/       # Quote-related UI (QuoteRequestForm, QuoteDrawer)
│   │   ├── services.ts       # Quote submission & management logic
│   │   └── store.ts          # Quote client-side state (from quote-store.ts)
│   │
│   └── (Other features like 'auth', 'company', 'search'...)
│
├── components/               # Truly SHARED, generic components
│   ├── ui/                   # Atomic UI elements (Button, Card, Input - from shadcn)
│   └── layout/               # App layout (Header, Footer, Sidebar)
│
├── lib/                      # Truly SHARED, core utilities
│   ├── db.ts                 # Prisma client instance
│   ├── utils.ts              # Generic helper functions
│   ├── validators.ts         # Global Zod schemas
│   ├── featureFlags.ts       # Feature flags
│   └── hooks/                # Shared, generic hooks (useMediaQuery, useToast)
│
├── services/                 # Truly SHARED, external service clients
│   ├── emailService.ts       # Client for sending emails
│   └── analyticsService.ts   # Client for analytics
│
└── ...                     # Other existing folders (styles, contexts, etc.)
```

**Rationale:**
*   **High Cohesion:** Code related to a single feature (e.g., "quoting") is located in one place.
*   **Low Coupling:** Features are self-contained and interact with each other through well-defined interfaces (services or stores), reducing dependencies.
*   **Easier Navigation:** Developers can quickly find all the code related to the feature they are working on.

## 3. Phased Refactoring Plan

This plan is broken into incremental phases to minimize risk.

### Phase 1: Preparation & Cleanup (Low Risk)

**Objective:** Clean up immediate technical debt and establish a solid testing baseline.

1.  **Dependency Cleanup:**
    *   **Action:** Remove unused dependencies as identified by `depcheck` in `maintenance.md`.
    *   **Command:** `npm uninstall @genkit-ai/next depcheck firebase patch-package` and the unused dev dependencies.
    *   **Action:** Add missing dependencies.
    *   **Command:** `npm install @radix-ui/react-icons @tanstack/react-table schema-dts`.
2.  **Static Code Analysis:**
    *   **Action:** Run `eslint --fix` to automatically remove unused imports and variables, as suggested in `TECHNICAL_DEBT_ANALYSIS.txt`.
3.  **Establish Testing Baseline:**
    *   **Action:** Review and enhance tests for the most critical user flow: **Request for Quote (RFQ)**. Ensure we have solid test coverage for `quote-request-form.tsx`, `quoteService.ts`, and the `/api/v1/rfq/submit` endpoint. This will prevent regressions during the main refactoring phase.

### Phase 2: Core Structure Refactoring (Medium Risk)

**Objective:** Implement the new `features` directory and migrate the highest-priority modules.

1.  **Create New Directories:**
    *   **Action:** Create the `src/features` directory and sub-folders for `products` and `quote`.
2.  **Migrate the "Quote" Feature:**
    *   **Priority:** **High**. The RFQ flow is a core business function.
    *   **Files to Move:**
        *   `src/components/quote-request-form.tsx` -> `src/features/quote/components/`
        *   `src/components/layout/quote-drawer.tsx` -> `src/features/quote/components/`
        *   `src/lib/quote-store.ts` -> `src/features/quote/store.ts`
        *   Portions of `src/services/quoteService.ts` -> `src/features/quote/services.ts`
    *   **Post-Action:** Update all import paths. Run the RFQ tests created in Phase 1 to validate the changes.
3.  **Migrate the "Products" Feature:**
    *   **Priority:** **High**. Product discovery is fundamental to the site.
    *   **Files to Move:**
        *   `src/components/product-card.tsx`, `product-grid.tsx`, `products-view.tsx` -> `src/features/products/components/`
        *   Portions of `src/services/productService.ts` -> `src/features/products/services.ts`
    *   **Post-Action:** Update imports and test product listing, search, and detail pages.

### Phase 3: API Layer & Performance (Medium to Low Risk)

**Objective:** Decouple business logic from the API layer and address performance issues.

1.  **Refactor API Routes:**
    *   **Action:** For each API route in `src/app/api`, extract the business logic into its corresponding service file in the `src/features` directory. The route handler should only be responsible for request/response handling and calling the service.
    *   **Example:** The logic inside `src/app/api/v1/rfq/submit/route.ts` should be moved to a function in `src/features/quote/services.ts`.
2.  **Address Bundle Size:**
    *   **Action:** As noted in `TECHNICAL_DEBT_ANALYSIS.txt`, dynamically import heavy libraries.
    *   **Target:** `src/components/ui/GsapScrollTrigger.tsx`.
    *   **Implementation:** Use `next/dynamic` to load this component only when it's needed, reducing the initial bundle size.

### Phase 4: Documentation (Low Risk)

**Objective:** Update documentation to reflect the new, improved structure.

1.  **Update README:**
    *   **Action:** Rewrite `README.md` to include comprehensive setup, environment variable documentation, and deployment instructions.
2.  **Regenerate Architecture Documents:**
    *   **Action:** After refactoring, run the analysis again to produce updated and accurate `architecture.md` and `summary.md` files.

## 4. Next Steps

This plan is now ready for team review. Feedback is encouraged on:
*   The proposed directory structure.
*   The prioritization of features for migration.
*   The phased approach.

Once the plan is approved, we can begin implementation, starting with Phase 1.
