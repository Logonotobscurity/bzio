# Section E: Catalog Segmentation

### 1. Structure
- **Hierarchy:** Category -> Brand -> Product.
- **Source of Truth:** Primary database tables in Postgres (`categories`, `brands`, `products`).

### 2. Management
- **Admin UI:** Managed via `/admin/products`, `/admin/categories`, and `/admin/brands`.
- **Slugs:** SEO-friendly slugs are used for routing (e.g., `/products/[slug]`, `/products/category/[slug]`).

### 3. Filtering & Search
- **Implemented:** Filtering by Category, Brand, Price Range, and Stock Status.
- **Search:** Case-insensitive search across SKU, Name, and Description.

### 4. Visibility
- **Public:** Most products are visible to all visitors.
- **Restricted:** Pricing or specific wholesale details may be gated behind login or quote requests.

### Catalog Pages & Powering APIs
- `/products`: Generic product listing (powered by `getProducts` service).
- `/products/brand/[slug]`: Filtered by brand.
- `/products/category/[slug]`: Filtered by category.
- `/products/[slug]`: Individual product details.
