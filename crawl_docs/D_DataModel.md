# Section D: Data Model Reality Check

### 1. Key Tables & Relations
- **users:** Main user identity. Has many `quotes`, `carts`, `addresses`, `user_activities`. Belongs to a `company`.
- **companies:** Optional grouping for users. Contains business registration and industry details.
- **brands:** Product manufacturers. Has many `products`.
- **categories:** Hierarchical product organization. Has many `products`.
- **products:** Core catalog entity. Belongs to one `brand` and one `category`. Has many `quote_lines` and `cart_items`.
- **quotes:** Quote request header. Belongs to a `user`. Has many `quote_lines` and `quote_messages`.
- **quote_lines:** Individual items within a quote.
- **carts / cart_items:** Active shopping carts and their contents.
- **leads:** CRM tracking for potential customers.
- **form_submissions:** Generic storage for website form data.

### 2. Relationship Integrity
- **Segmentation:** Products are organized by Category -> Brand. Company labels are stored as a relationship to the user or as standalone business entities.
- **Uniqueness:** Slugs and SKUs have unique constraints (e.g., `products.sku`, `products.slug`).
- **Indexes:** Frequent lookups are indexed (e.g., `quotes.userId`, `products.isActive`, `products.categoryId`).

### 3. Deletion Policy
- **Hard Deletes:** Most tables currently use hard deletes (e.g., `prisma.users.delete`).
- **Soft Deletes:** Not globally implemented; some logic uses `isActive` flags to simulate soft deletion for products and users.

### ERD Outline (Simplified)
- `users` (1) --- (N) `quotes`
- `users` (1) --- (N) `carts`
- `users` (N) --- (1) `companies`
- `brands` (1) --- (N) `products`
- `categories` (1) --- (N) `products`
- `quotes` (1) --- (N) `quote_lines`
- `carts` (1) --- (N) `cart_items`
