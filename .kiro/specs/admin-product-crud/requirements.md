# Requirements Document

## Introduction

This specification covers the Admin Dashboard Product CRUD operations, User Management workflow, and API routes for a Next.js 16 App Router + Prisma + Auth.js v5 application. The goal is to ensure all product data flows through Prisma (eliminating static JSON dependencies), implement comprehensive search/filtering, and provide a complete user approval workflow with admin action logging.

## Glossary

- **Admin_Dashboard**: The administrative interface at `/admin/*` routes accessible only to users with ADMIN role
- **Product_Service**: Server-side service layer handling product CRUD operations via Prisma
- **User_Service**: Server-side service layer handling user management operations
- **Search_Filter**: Component enabling search by SKU, name, description with optional price range filtering
- **Approval_Workflow**: Process for admin to approve, reject, or block user accounts
- **Admin_Action_Log**: Analytics event record tracking admin operations for audit purposes
- **Prisma_DB**: PostgreSQL database accessed via Prisma ORM as single source of truth

## Requirements

### Requirement 1: Product List Search and Filtering

**User Story:** As an admin, I want to search and filter products by SKU, name, price, and description, so that I can quickly find specific products in the catalog.

#### Acceptance Criteria

1. WHEN an admin enters text in the search input, THE Search_Filter SHALL match against SKU (partial), name (partial, case-insensitive), and description (partial, case-insensitive)
2. WHEN an admin specifies minPrice and/or maxPrice filters, THE Product_Service SHALL return only products within the specified price range
3. WHEN search input changes, THE Search_Filter SHALL debounce the input for 300ms before triggering a search
4. THE Product_Service SHALL support pagination via page and pageSize query parameters
5. WHEN no products match the search criteria, THE Admin_Dashboard SHALL display "No products found." message

### Requirement 2: Product CRUD - Create

**User Story:** As an admin, I want to create new products with all required fields, so that I can add items to the catalog.

#### Acceptance Criteria

1. WHEN an admin submits a valid product form, THE Product_Service SHALL create a new product in Prisma_DB
2. THE Product_Service SHALL require: sku (unique), name, price, categoryId, brandId, stockQuantity, and at least one image URL
3. IF a duplicate SKU is submitted, THEN THE Product_Service SHALL reject the creation with a clear error message
4. WHEN a product is created successfully, THE Admin_Dashboard SHALL display the new product in the list without full page reload
5. IF validation fails, THEN THE Admin_Dashboard SHALL display inline errors for each invalid field

### Requirement 3: Product CRUD - Read

**User Story:** As an admin, I want to view all products with their details, so that I can manage the catalog effectively.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL display products in a table with columns: Image thumbnail, SKU, Name, Price, Stock, Category, Status, Actions
2. WHEN viewing `/admin/products`, THE Product_Service SHALL fetch products from Prisma_DB with category and brand relations
3. THE Admin_Dashboard SHALL support viewing a single product detail for editing at `/admin/products/[id]`
4. THE public `/products` and `/products/[slug]` routes SHALL read from the same Prisma Product table

### Requirement 4: Product CRUD - Update

**User Story:** As an admin, I want to edit product details, so that I can keep catalog information accurate.

#### Acceptance Criteria

1. WHEN an admin submits valid product updates, THE Product_Service SHALL persist changes to Prisma_DB
2. WHEN a product is updated, THE Admin_Dashboard SHALL reflect new values immediately
3. WHEN a product is updated, THE public `/products` and `/products/[slug]` pages SHALL show updated values on next load
4. IF update validation fails, THEN THE Product_Service SHALL reject the update with clear errors without corrupting data
5. THE Product_Service SHALL call `revalidatePath("/products")` after successful updates

### Requirement 5: Product CRUD - Delete

**User Story:** As an admin, I want to delete or deactivate products, so that I can remove items from the catalog.

#### Acceptance Criteria

1. WHEN an admin deletes a product, THE Product_Service SHALL support both soft-delete (isActive=false) and hard-delete options
2. WHEN a product is soft-deleted, THE Admin_Dashboard SHALL mark it as "Inactive" in the default view
3. WHEN a product is deleted, THE public `/products` page SHALL no longer display the product
4. THE Product_Service SHALL handle foreign key references safely when deleting products

### Requirement 6: User Management View

**User Story:** As an admin, I want to view and manage all users, so that I can maintain user accounts and access control.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL display users in a table with columns: Name, Email, Company, Role, Status, Created At, Last Login, Actions
2. THE User_Service SHALL support filtering by status (PENDING, APPROVED, REJECTED, BLOCKED) and search by email/name
3. WHEN viewing `/admin/users`, THE User_Service SHALL fetch users from Prisma_DB with company relations

### Requirement 7: User Approval Workflow

**User Story:** As an admin, I want to approve, reject, or block users, so that I can control access to the platform.

#### Acceptance Criteria

1. WHEN an admin approves a user, THE User_Service SHALL set isActive=true and emailVerified=now()
2. WHEN an admin rejects a user, THE User_Service SHALL set isActive=false
3. WHEN an admin blocks a user, THE User_Service SHALL set isActive=false and prevent login
4. WHEN an admin changes a user's role, THE User_Service SHALL update the role field (ADMIN or CUSTOMER)
5. FOR ALL admin actions on users, THE User_Service SHALL log an Admin_Action_Log event with adminId, userId, type, and metadata

### Requirement 8: Product API Routes

**User Story:** As a developer, I want REST-style API routes for product CRUD, so that I can integrate with external systems.

#### Acceptance Criteria

1. THE API SHALL expose POST `/api/admin/products` for creating products
2. THE API SHALL expose GET `/api/admin/products` for listing products with search and pagination
3. THE API SHALL expose GET `/api/admin/products/[id]` for retrieving a single product
4. THE API SHALL expose PUT `/api/admin/products/[id]` for updating a product
5. THE API SHALL expose DELETE `/api/admin/products/[id]` for deleting a product
6. FOR ALL API endpoints, THE API SHALL validate admin session via Auth.js v5 and return 403 for non-admins

### Requirement 9: Data Consistency

**User Story:** As a system architect, I want all product data to flow through Prisma, so that there is a single source of truth.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL NOT read from static `all-products.json` at runtime
2. FOR ALL product reads, THE system SHALL query Prisma_DB directly
3. WHEN products are updated via admin, THE public pages SHALL reflect changes after revalidation
4. THE `all-products.json` file SHALL only be used for initial database seeding

### Requirement 10: Search Indexes for Performance

**User Story:** As a system architect, I want database indexes on searchable fields, so that product searches perform efficiently.

#### Acceptance Criteria

1. THE Prisma schema SHALL include an index on Product.sku
2. THE Prisma schema SHALL include an index on Product.name
3. THE Prisma schema SHALL include an index on Product.price
4. THE Prisma schema SHALL include an index on Product.isActive
