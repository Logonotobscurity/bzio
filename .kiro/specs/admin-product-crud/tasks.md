# Implementation Plan: Admin Product CRUD & User Management

## Overview

This implementation plan covers the admin dashboard product CRUD operations, user management workflow, and API routes. Tasks are organized to build incrementally, with property tests validating correctness at each stage.

## Tasks

- [x] 1. Add database indexes for product search performance
  - Add @@index([sku]), @@index([name]), @@index([price]) to Product model
  - Run `npx prisma migrate dev` to apply changes
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [-] 2. Implement Product Search Component
  - [x] 2.1 Create ProductSearch.tsx with debounced input
    - Single search input matching SKU, name, description
    - Optional minPrice/maxPrice number inputs
    - Status and stock filter dropdowns
    - 300ms debounce on search input
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.2 Update product.service.ts search query
    - Implement OR-based search across sku, name, description
    - Add price range filtering (gte/lte)
    - Ensure case-insensitive matching
    - _Requirements: 1.1, 1.2_

  - [x] 2.3 Write property test for search correctness
    - **Property 1: Search Returns Matching Products**
    - **Validates: Requirements 1.1, 1.2**

- [ ] 3. Checkpoint - Verify search functionality
  - Ensure search tests pass, ask the user if questions arise.

- [-] 4. Implement Product CRUD API Routes
  - [x] 4.1 Create POST /api/admin/products route
    - Validate required fields (sku, name, price, categoryId, brandId)
    - Generate slug from name if not provided
    - Return created product or validation errors
    - _Requirements: 2.1, 2.2, 2.3, 8.1_

  - [x] 4.2 Create GET /api/admin/products/[id] route
    - Fetch single product with relations
    - Return 404 if not found
    - _Requirements: 3.3, 8.3_

  - [x] 4.3 Create PUT /api/admin/products/[id] route
    - Validate update data
    - Call revalidatePath after update
    - Return updated product or errors
    - _Requirements: 4.1, 4.4, 4.5, 8.4_

  - [x] 4.4 Create DELETE /api/admin/products/[id] route
    - Support soft-delete (default) and hard-delete (query param)
    - Handle foreign key references safely
    - _Requirements: 5.1, 5.4, 8.5_

  - [x] 4.5 Write property test for CRUD round-trip
    - **Property 2: Product CRUD Round-Trip Consistency**
    - **Validates: Requirements 2.1, 4.1**

  - [x] 4.6 Write property test for required field validation
    - **Property 4: Required Field Validation**
    - **Validates: Requirements 2.2**

- [ ] 5. Checkpoint - Verify CRUD operations
  - Ensure all CRUD tests pass, ask the user if questions arise.

- [x] 6. Implement Product Table Component
  - [x] 6.1 Create ProductTable.tsx with all columns
    - Image thumbnail, SKU, Name, Price, Stock, Category, Status, Actions
    - Action buttons for edit, delete, toggle status
    - Empty state "No products found."
    - _Requirements: 3.1, 1.5_

  - [x] 6.2 Update ProductsClient.tsx to use new components
    - Integrate ProductSearch and ProductTable
    - Handle search state and API calls
    - Implement optimistic updates for status toggle
    - _Requirements: 2.4, 4.2_

  - [x] 6.3 Write property test for pagination bounds
    - **Property 3: Pagination Bounds**
    - **Validates: Requirements 1.4**

- [-] 7. Implement Admin/Public Data Consistency
  - [x] 7.1 Verify public product routes use Prisma
    - Check /products page fetches from Prisma
    - Check /products/[slug] fetches from Prisma
    - Remove any static JSON reads at runtime
    - _Requirements: 9.1, 9.2_

  - [x] 7.2 Add revalidation to product mutations
    - Call revalidatePath("/products") after create/update/delete
    - Call revalidatePath("/products/[slug]") for specific product updates
    - Fixed admin product service to use correct Prisma model names (plural)
    - _Requirements: 4.3, 9.3_

  - [ ] 7.3 Write property test for admin/public consistency
    - **Property 5: Admin/Public Data Consistency**
    - **Validates: Requirements 3.4, 4.3**

  - [ ] 7.4 Write property test for delete visibility
    - **Property 6: Delete Visibility**
    - **Validates: Requirements 5.1, 5.3**

- [ ] 8. Checkpoint - Verify data consistency
  - Ensure consistency tests pass, ask the user if questions arise.

- [ ] 9. Enhance User Management
  - [ ] 9.1 Add status filtering to user.service.ts
    - Support filtering by isActive and emailVerified
    - Implement search by email and name
    - _Requirements: 6.2_

  - [ ] 9.2 Update UsersClient.tsx with status column
    - Display combined status (Active/Inactive, Verified/Pending)
    - Add status filter dropdown
    - _Requirements: 6.1_

  - [ ] 9.3 Write property test for user filter correctness
    - **Property 11: User Filter Correctness**
    - **Validates: Requirements 6.2**

- [ ] 10. Implement User Approval Workflow
  - [ ] 10.1 Verify approveUser action sets correct fields
    - Set isActive=true and emailVerified=now()
    - Log admin action event
    - _Requirements: 7.1_

  - [ ] 10.2 Verify rejectUser action sets correct fields
    - Set isActive=false
    - Log admin action event
    - _Requirements: 7.2_

  - [ ] 10.3 Implement blockUser action if not exists
    - Set isActive=false
    - Log admin action event
    - _Requirements: 7.3_

  - [ ] 10.4 Write property test for user status state machine
    - **Property 7: User Status State Machine**
    - **Validates: Requirements 7.1, 7.2, 7.3**

  - [ ] 10.5 Write property test for role change persistence
    - **Property 8: Role Change Persistence**
    - **Validates: Requirements 7.4**

- [ ] 11. Implement Admin Action Logging
  - [ ] 11.1 Ensure all user actions log to AnalyticsEvent
    - Log user_approved, user_rejected, user_blocked, user_role_changed
    - Include adminId, userId, type, metadata
    - _Requirements: 7.5_

  - [ ] 11.2 Write property test for audit trail
    - **Property 9: Admin Action Audit Trail**
    - **Validates: Requirements 7.5**

- [ ] 12. Implement API Authorization
  - [ ] 12.1 Add auth checks to all admin API routes
    - Verify session exists (401 if not)
    - Verify role is ADMIN (403 if not)
    - _Requirements: 8.6_

  - [ ] 12.2 Write property test for API authorization
    - **Property 10: API Authorization**
    - **Validates: Requirements 8.6**

- [ ] 13. Final Checkpoint - Full test suite
  - Run all property tests and unit tests
  - Verify no TypeScript errors
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks including property tests are required for comprehensive coverage
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests use fast-check library (already in devDependencies)
- All API routes follow REST conventions with standardized JSON responses
