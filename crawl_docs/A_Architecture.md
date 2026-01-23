# Section A: Project Map & Architecture

### 1. App Root & Router
- **App Router:** Yes, the project exclusively uses the Next.js App Router located in `src/app`.
- **Pages Router:** No, there is no `src/pages` directory.

### 2. Module Split
- The project follows a hybrid structure:
    - **UI/Routes:** Organized by feature/page in `src/app` (e.g., `admin/`, `auth/`, `products/`, `account/`).
    - **Logic:** Separated into `src/repositories` (data access) and `src/services` (business logic).
    - **Global:** Shared components in `src/components`, core utilities in `src/lib`.

### 3. Server-side Logic
- **Route Handlers:** Extensively used in `src/app/api/**/route.ts` for both public and protected endpoints.
- **Server Actions:** Used in `src/app/admin/_actions/` and `src/app/account/_actions/` for form submissions and administrative tasks.
- **Service Layer:** `src/services/` contains classes/objects handling business logic, abstracting the repositories.

### 4. Shared Utilities
- **Database:** `src/lib/db/index.ts` (Prisma client singleton).
- **Authentication:** `src/lib/auth/config.ts` and `src/lib/auth-constants.ts`.
- **Validators:** Often inline with Zod in routes/actions, though some shared logic exists in `src/lib`.

### 5. Logging & Observability
- **Approach:** Custom database-backed logging via `error_logs` and `user_activities` models.
- **Service:** `src/services/error-logging.service.ts` handles persistent error tracking.
- **Console:** Widespread use of `console.log` and `console.error` for runtime debugging.

### System Map Summary
- **Modules:** Auth, Admin, Catalog (Products/Brands), Account, Quotes, RFQ.
- **Entrypoints:**
    - `/admin`: Admin Dashboard
    - `/account`: Customer Dashboard
    - `/api/admin/*`: Admin APIs
    - `/api/user/*`: User/Customer APIs
- **DB Access:** Centralized in `src/repositories/` using Prisma.
