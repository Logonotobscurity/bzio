# Section L: Crawl Summary & Next Actions

### 1. Final Capture Summary
- **Auth:** NextAuth.js v5 (Auth.js), enforced in Route Handlers and Server Components. Role stored in database.
- **Roles:** `ADMIN`, `CUSTOMER`.
- **Catalog Model:** Category -> Brand -> Product.
- **Quote Model:** `quotes` (header) + `quote_lines` (items). Status-driven pipeline.
- **Forms Model:** `form_submissions` (generic) + `leads` (CRM sync).
- **Admin:** Robust CRUD coverage for all core entities.

### 2. Risk Assessment
- **Primary Risks:**
    - Schema drift between application logic and the existing Postgres DB.
    - Potential property mismatches in Server Actions due to renaming of relational fields (e.g., `lines` to `quote_lines`).
    - Scattered logic between Server Actions and direct API Route Handlers.

### 3. Next Actions (Highest ROI)
1. **Complete Server Action Refactoring:** Update `src/app/admin/_actions/` to use the standardized property names from the latest schema.
2. **Global Middleware Implementation:** Centralize authentication guards in a standard `middleware.ts` to reduce boilerplate in individual routes.
3. **TypeScript Alignment:** Resolve the remaining tail of type errors in UI components where relational data is mapped.
4. **Data Integrity Audit:** Verify that all `ADMIN` operations properly update the `updatedAt` and audit logging fields.
5. **UI Standardization:** Unify the "Quote Cart" experience across the public catalog and the logged-in dashboard.
