# Section C: Authorization

### 1. Role Logic
- **Storage:** Database column `users.role` (Enum `UserRole`).
- **Roles:** `ADMIN`, `CUSTOMER`.
- **Selection:** `CUSTOMER` is the default. `ADMIN` roles are typically set via database or specialized setup scripts (`/api/admin/setup`).

### 2. Permissions Enforcement
- **Admin APIs:** Routes in `src/app/api/admin/` check `session.user.role === 'ADMIN'`.
- **Customer APIs:** Routes in `src/app/api/user/` check for valid session.
- **Cross-Access Risk:** Handled by per-route checks. A `CUSTOMER` attempting to call an Admin API will receive 401/403.

### 3. Permission Matrix

| Endpoint/Page | Role Required | Enforcement |
| :--- | :--- | :--- |
| `/admin/*` | `ADMIN` | `requireAdmin()` in Layout/Page |
| `/account/*` | `CUSTOMER`, `ADMIN` | `requireAuth()` in Layout/Page |
| `/api/admin/*` | `ADMIN` | `session.user.role` check in route |
| `/api/user/*` | `CUSTOMER`, `ADMIN` | `session` presence check |
| Public Pages | `ANY` | None |

### 4. Approval Concept
- **Status:** Some entities like `companies` have `isVerified` boolean.
- **Wholesaler Gating:** Currently not explicitly segmented from `CUSTOMER` in the core role enum, but potentially handled via `businessType` or `isVerified` metadata.
