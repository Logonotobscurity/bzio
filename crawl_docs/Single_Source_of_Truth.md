# Codebase Single Source of Truth

## 1. Authentication
- **Framework:** Auth.js (NextAuth.js) v5.
- **Providers:**
    - **Magic Link:** `EmailProvider` (primary for passwordless).
    - **Credentials:** `CredentialsProvider` (Email/Password).
- **Session Strategy:** JWT-based, stored in secure HTTP-only cookies.
- **Enforcement:** Primarily handled via manual checks in Route Handlers and Server Actions using central guards in `src/lib/guards.ts`. **No global middleware.ts currently exists.**

## 2. Authorization (RBAC)
- **Roles:** `ADMIN`, `CUSTOMER` (stored as uppercase enums in DB).
- **User Types:**
    - **Retailer/Wholesaler:** Differentiated via `businessType` metadata in the `users` table or `isVerified` in the `companies` table.
- **Enforcement Points:**
    - UI Gating: `useAuth` hook.
    - API Gating: `requireAdminRoute()`, `requireAuthRoute()`.
    - Action Gating: `requireAdminAction()`, `requireAuthAction()`.

## 3. Data Model Definitions
- **Business Accounts:** Managed via the `companies` model. Users link to a company via `companyId`.
- **Catalog Labels:** Managed via the `brands` model. Products link to a brand via `brandId`.
- **Hierarchy:** `Category` -> `Brand` -> `Product`.
- **Quote Model:** `quotes` (header) + `quote_lines` (items).
- **Audit Logging:** `user_activities` tracks administrative and critical user actions.

## 4. Quote Workflows
- **Primary Flows:**
    1. **Quote Cart (Primary):** Multi-item "Add to Quote" flow via `/checkout` page.
    2. **Direct RFQ:** Single submission via specialized forms or direct API calls.
- **Status Pipeline (Enforced):** `DRAFT` -> `PENDING` -> `NEGOTIATING` -> `ACCEPTED` -> `REJECTED` -> `EXPIRED`.
- **Idempotency:** Unique reference generation based on timestamps/randomization.

## 5. Persistence & Safety
- **Database:** PostgreSQL via Prisma.
- **Initialization:** Singleton client in `src/lib/db/index.ts`.
- **Safety:**
    - Soft delete simulated via `isActive` flags for Users/Products.
    - Quotes currently use hard delete but are targeted for soft-delete conversion.
    - IDOR protection enforced by filtering by `session.user.id` in all user-owned resource queries.
