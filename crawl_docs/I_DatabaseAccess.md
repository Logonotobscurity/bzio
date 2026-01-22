# Section I: Database Access Layer & Safety

### 1. Prisma Client Initialization
- **Location:** `src/lib/db/index.ts`.
- **Pattern:** Exported singleton `prisma`. Supports Driver Adapters (currently using PG adapter).

### 2. Consistency Patterns
- **Abstraction:** Most data access is abstracted into `src/repositories/` (e.g., `UserRepository`, `LeadRepository`).
- **Patterns:**
    - Repositories typically return mapped domain objects or Prisma results cast to domain types.
    - Widespread use of `select` and `include` to control relation hydration.
    - Pagination is manually handled via `take` and `skip` in many routes.

### 3. Safety & Performance
- **Transactions:** Used in critical paths like form submission (`src/app/api/forms/submit/route.ts`) to ensure atomic creation of forms, leads, and notifications.
- **N+1 Hotspots:** Potential hotspots exist in some legacy admin actions where nested mapping is performed after fetching lists.

### 4. DB Access Hotspots (Top Files)
1. `src/repositories/user.repository.ts`
2. `src/repositories/lead.repository.ts`
3. `src/app/api/admin/customers/data/route.ts`
4. `src/app/api/user/cart/items/route.ts`
5. `src/app/api/quote-requests/route.ts`
6. `src/app/admin/_services/product.service.ts`
7. `src/services/userService.ts`
8. `src/app/api/forms/submit/route.ts`
9. `src/repositories/notification.repository.ts`
10. `src/app/api/admin/crm-sync/route.ts`
