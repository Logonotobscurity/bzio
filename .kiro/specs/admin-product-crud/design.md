# Design Document: Admin Product CRUD & User Management

## Overview

This design implements comprehensive admin functionality for product CRUD operations and user management in a Next.js 16 App Router application. The architecture follows a layered approach with server actions, service layer, and Prisma ORM for database operations. All data flows through Prisma as the single source of truth, eliminating runtime dependencies on static JSON files.

## Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        PC[ProductsClient.tsx]
        UC[UsersClient.tsx]
        PS[ProductSearch.tsx]
    end
    
    subgraph "Server Layer"
        PA[products.ts actions]
        UA[users.ts actions]
        PSvc[product.service.ts]
        USvc[user.service.ts]
    end
    
    subgraph "API Layer"
        API[/api/admin/products/*]
        UAPI[/api/admin/users/*]
    end
    
    subgraph "Data Layer"
        Prisma[Prisma Client]
        DB[(PostgreSQL)]
        Cache[Redis Cache]
    end
    
    PC --> PA
    PC --> PS
    UC --> UA
    PS --> PA
    PA --> PSvc
    UA --> USvc
    API --> PSvc
    UAPI --> USvc
    PSvc --> Prisma
    USvc --> Prisma
    PSvc --> Cache
    Prisma --> DB
```

## Components and Interfaces

### Product Search Component

```typescript
// src/app/admin/products/_components/ProductSearch.tsx
interface ProductSearchProps {
  onSearch: (filters: ProductFilters) => void;
  initialFilters?: ProductFilters;
}

interface ProductFilters {
  search?: string;           // Matches SKU, name, description
  minPrice?: number;
  maxPrice?: number;
  status?: 'active' | 'inactive' | 'all';
  stock?: 'in-stock' | 'low-stock' | 'out-of-stock' | 'all';
  category?: string;
}
```

### Product Table Component

```typescript
// src/app/admin/products/_components/ProductTable.tsx
interface ProductTableProps {
  products: ProductRow[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

interface ProductRow {
  id: string;
  imageUrl: string | null;
  sku: string;
  name: string;
  price: number;
  stockQuantity: number;
  category: string | null;
  isActive: boolean;
  createdAt: Date;
}
```

### Product Service Interface

```typescript
// src/app/admin/_services/product.service.ts
interface ProductCreateInput {
  sku: string;
  name: string;
  slug?: string;
  description?: string;
  detailedDescription?: string;
  price: number;
  stockQuantity: number;
  unit?: string;
  brandId: number;
  categoryId: number;
  images?: string[];
  tags?: string[];
  specifications?: Record<string, unknown>;
  isActive?: boolean;
  isFeatured?: boolean;
}

interface ProductUpdateInput extends Partial<ProductCreateInput> {
  id: number;
}

interface ProductSearchResult {
  products: ProductRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

### User Service Interface

```typescript
// src/app/admin/_services/user.service.ts
interface UserRow {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'ADMIN' | 'CUSTOMER';
  isActive: boolean;
  emailVerified: Date | null;
  company: string | null;
  quotesCount: number;
  createdAt: Date;
  lastLogin: Date | null;
}

interface UserFilters {
  search?: string;
  role?: 'ADMIN' | 'CUSTOMER' | 'all';
  status?: 'active' | 'inactive' | 'verified' | 'unverified' | 'all';
}

type AdminActionType = 
  | 'user_approved' 
  | 'user_rejected' 
  | 'user_blocked'
  | 'user_role_changed'
  | 'product_created'
  | 'product_updated'
  | 'product_deleted';
```

## Data Models

### Prisma Product Model (existing with indexes)

```prisma
model Product {
  id                  Int       @id @default(autoincrement())
  name                String
  slug                String    @unique
  description         String?
  detailedDescription String?
  sku                 String    @unique
  price               Decimal   @db.Decimal(10, 2)
  // ... other fields
  
  @@index([sku])
  @@index([name])
  @@index([price])
  @@index([isActive])
  @@index([categoryId])
  @@index([brandId])
  @@map("products")
}
```

### Prisma Query Patterns

```typescript
// Search query with OR conditions
const searchProducts = async (filters: ProductFilters) => {
  const where: Prisma.ProductWhereInput = {};
  
  if (filters.search) {
    where.OR = [
      { sku: { contains: filters.search, mode: 'insensitive' } },
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
      ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
    };
  }
  
  return prisma.product.findMany({ where, ... });
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Search Returns Matching Products

*For any* search term and product dataset, all products returned by the search function should contain the search term in at least one of: SKU, name, or description (case-insensitive). Additionally, *for any* price range filter, all returned products should have prices within the specified bounds.

**Validates: Requirements 1.1, 1.2**

### Property 2: Product CRUD Round-Trip Consistency

*For any* valid product data, creating a product then reading it back should return equivalent data. Similarly, *for any* valid update to an existing product, updating then reading should return the updated values.

**Validates: Requirements 2.1, 4.1**

### Property 3: Pagination Bounds

*For any* page and pageSize parameters, the number of products returned should not exceed pageSize, and the total count should be consistent across paginated requests.

**Validates: Requirements 1.4**

### Property 4: Required Field Validation

*For any* product creation attempt missing required fields (sku, name, price, categoryId, brandId), the Product_Service should reject the creation with an error.

**Validates: Requirements 2.2**

### Property 5: Admin/Public Data Consistency

*For any* product in the database, querying via admin service and public service should return the same core product data (id, name, price, description, images).

**Validates: Requirements 3.4, 4.3**

### Property 6: Delete Visibility

*For any* product that is soft-deleted (isActive=false) or hard-deleted, the product should not appear in public product listings (where isActive=true is applied).

**Validates: Requirements 5.1, 5.3**

### Property 7: User Status State Machine

*For any* user, the following state transitions should be valid and persist correctly:
- Approve: sets isActive=true, emailVerified=now()
- Reject: sets isActive=false
- Block: sets isActive=false

**Validates: Requirements 7.1, 7.2, 7.3**

### Property 8: Role Change Persistence

*For any* user and valid role (ADMIN or CUSTOMER), changing the role should persist the new value and be retrievable on subsequent reads.

**Validates: Requirements 7.4**

### Property 9: Admin Action Audit Trail

*For any* admin action (approve, reject, block, role change), an AnalyticsEvent record should be created with the correct eventType, userId, and metadata.

**Validates: Requirements 7.5**

### Property 10: API Authorization

*For any* API request to admin endpoints without a valid admin session, the API should return 401 (unauthenticated) or 403 (forbidden) status.

**Validates: Requirements 8.6**

### Property 11: User Filter Correctness

*For any* user filter criteria (role, status, search term), all returned users should match the specified criteria.

**Validates: Requirements 6.2**

## Error Handling

### Product Operations

| Error Condition | Response | HTTP Status |
|----------------|----------|-------------|
| Duplicate SKU | `{ success: false, error: "SKU already exists" }` | 400 |
| Missing required field | `{ success: false, error: "Field X is required" }` | 400 |
| Product not found | `{ success: false, error: "Product not found" }` | 404 |
| Unauthorized | `{ error: "Unauthorized" }` | 401 |
| Forbidden (non-admin) | `{ error: "Forbidden" }` | 403 |
| Database error | `{ success: false, error: "Internal server error" }` | 500 |

### User Operations

| Error Condition | Response | HTTP Status |
|----------------|----------|-------------|
| User not found | `{ success: false, error: "User not found" }` | 404 |
| Invalid role | `{ success: false, error: "Invalid role" }` | 400 |
| Self-demotion | `{ success: false, error: "Cannot demote yourself" }` | 400 |

## Testing Strategy

### Unit Tests

Unit tests verify specific examples and edge cases:

- Product creation with valid data
- Product creation with duplicate SKU (should fail)
- Product update with partial data
- User approval state changes
- API authorization checks

### Property-Based Tests

Property-based tests verify universal properties across generated inputs using `fast-check`:

- **Search correctness**: Generate random products and search terms, verify all results match
- **Pagination bounds**: Generate random page/pageSize, verify result counts
- **CRUD round-trip**: Generate random valid product data, verify create/read consistency
- **Filter correctness**: Generate random users and filters, verify all results match criteria
- **Authorization**: Generate random non-admin sessions, verify 403 responses

### Test Configuration

```typescript
// jest.config.cjs
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

// Property test configuration
// Minimum 100 iterations per property test
// Tag format: Feature: admin-product-crud, Property N: description
```

### Test File Structure

```
tests/
├── properties/
│   ├── product-search.property.test.ts
│   ├── product-crud.property.test.ts
│   ├── user-management.property.test.ts
│   └── api-authorization.property.test.ts
└── unit/
    ├── product.service.test.ts
    └── user.service.test.ts
```
