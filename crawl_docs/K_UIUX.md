# Section K: UI/UX Reality

### 1. Persona-specific UX
- **Customer:**
    - **Signup:** Handled via `/register`.
    - **Dashboard:** Located at `/account`. Focused on quote history, active carts, and profile management.
    - **Catalog:** Publicly accessible browsing experience with "Add to Quote" functionality.
- **Admin:**
    - **Login:** Restricted `/auth/admin/login` page.
    - **Dashboard:** Comprehensive control center at `/admin` with sidebars for Catalog, Users, Quotes, and Analytics.

### 2. State Management
- **Unauthorized States:** Clean redirects to `/login` or specialized `/403` and `/unauthorized` pages.
- **Loading/Error States:** Implemented via Next.js `loading.tsx` and `error.tsx` conventions in core route groups.
- **Empty States:** Dashboard components include conditional rendering for "No data found" scenarios.

### Route Persona Mapping
- **Public:** `/`, `/products`, `/about`, `/contact`.
- **Authenticated (Customer):** `/account/*`, `/checkout`.
- **Administrative:** `/admin/*`.
