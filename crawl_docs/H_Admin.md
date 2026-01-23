# Section H: Admin CRUD Capabilities

### 1. Admin Area
- **Root:** All admin functionality is concentrated under `/admin` and `/api/admin`.
- **UI:** A unified Admin Dashboard allows for tabbed management of different entities.

### 2. CRUD Coverage
- **Categories:** Full CRUD via `/admin/categories`.
- **Brands:** Full CRUD via `/admin/brands`.
- **Products:** Full CRUD with image and stock management via `/admin/products`.
- **Users:** Role management and status toggling via `/admin/users`.
- **Quotes:** Status updates and messaging via `/admin/quotes`.
- **Forms:** Response tracking and lead conversion via `/admin/forms`.

### 3. Protection & Auditing
- **Server-side Security:** Every route/action under the admin umbrella performs a role check: `session.user.role === 'ADMIN'`.
- **Audit Trail:** Admin actions (like updating a product or responding to a form) are logged in the `user_activities` table.
- **Errors:** Systematic logging of administrative errors in `error_logs`.
