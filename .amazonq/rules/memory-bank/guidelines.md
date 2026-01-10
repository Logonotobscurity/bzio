# Development Guidelines

## Code Quality Standards

### File Organization
- Use clear, descriptive file headers with purpose documentation
- Group related functionality in dedicated directories
- Separate concerns: actions, components, services, repositories
- Place test files adjacent to source files with `__tests__` directories

### TypeScript Standards
- Strict type safety enabled across the codebase
- Explicit interface definitions for all data structures
- Use type aliases for complex types (e.g., `type CarouselApi = UseEmblaCarouselType[1]`)
- Avoid `any` types - use proper type definitions or `unknown`
- Export types alongside implementations for reusability

### Naming Conventions
- **Files**: kebab-case for files (`activities.ts`, `enrichment-service.ts`)
- **Components**: PascalCase with descriptive names (`CarouselContent`, `MenubarTrigger`)
- **Functions**: camelCase with verb prefixes (`getRecentActivities`, `enrichCategories`)
- **Interfaces**: PascalCase with descriptive names (`PaginatedResult`, `ActivityEvent`)
- **Constants**: UPPER_SNAKE_CASE for true constants (`TOAST_LIMIT`, `CACHE_TTL`)
- **Private functions**: camelCase, no underscore prefix

### Code Formatting
- Use double quotes for strings in TypeScript/JSX
- 2-space indentation
- Trailing commas in multi-line objects/arrays
- Spread operators for object composition (`{ ...props }`)
- Destructuring for cleaner parameter handling
- Line breaks between logical sections

## Architectural Patterns

### Server Actions Pattern
```typescript
// Admin actions in /app/admin/_actions/
export async function getRecentActivities(
  offset: number = 0,
  limit: number = 20
): Promise<PaginatedResult<ActivityEvent>> {
  // Implementation with caching
}
```
- Server actions in `_actions` directories
- Return typed results with pagination support
- Include error handling with fallback values
- Use caching for expensive operations

### Repository Pattern
- Dedicated repository files for each entity
- Centralized database access logic
- Type-safe query results
- Consistent error handling

### Service Layer Pattern
- Business logic separated from data access
- Services orchestrate multiple repositories
- Enrichment services for data transformation
- Validation at service boundaries

### Component Composition
```typescript
// Compound component pattern
<Carousel>
  <CarouselContent>
    <CarouselItem />
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```
- Use compound components for complex UI
- Context API for internal state sharing
- forwardRef for ref forwarding
- displayName for debugging

### Custom Hooks Pattern
```typescript
function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }
  return context
}
```
- Custom hooks for reusable logic
- Context validation with helpful error messages
- Return stable references with useCallback
- Clean up effects properly

## Performance Optimizations

### Database Query Optimization
```typescript
// Parallel execution instead of sequential
const [data1, data2, data3] = await Promise.all([
  query1(),
  query2(),
  query3(),
]);
```
- Use `Promise.all()` for parallel queries
- Implement query timeouts with `withTimeout` wrapper
- Select only required fields in Prisma queries
- Add database indexes for frequently queried fields

### Caching Strategy
```typescript
return getCachedQuery(
  cacheKey,
  async () => { /* query */ },
  CACHE_TTL.dashboard.realtime
);
```
- Redis caching for expensive operations
- Structured cache keys with namespaces
- TTL-based cache expiration
- Cache invalidation on mutations

### React Performance
- Use `React.memo` for expensive components
- `useCallback` for stable function references
- `useMemo` for expensive computations
- Lazy loading with dynamic imports

## Error Handling

### Try-Catch Pattern
```typescript
try {
  const result = await withTimeout(operation(), 10000);
  return result;
} catch (error) {
  console.error('Error description:', error);
  return fallbackValue;
}
```
- Always wrap async operations in try-catch
- Log errors with descriptive context
- Return safe fallback values
- Use timeout wrappers for database queries

### Validation
- Zod schemas for runtime validation
- Type guards for type narrowing
- Null checks before accessing properties
- Optional chaining for nested properties

## Testing Standards

### Test Structure
```typescript
describe('serviceName', () => {
  describe('functionName', () => {
    it('should do specific thing', async () => {
      // Arrange
      const input = createMockData();
      
      // Act
      const result = await function(input);
      
      // Assert
      expect(result).toBe(expected);
    });
  });
});
```
- Nested describe blocks for organization
- Clear test descriptions with "should"
- Arrange-Act-Assert pattern
- Mock data factories for test data

### Test Coverage
- Unit tests for services and utilities
- Integration tests for API routes
- Component tests for UI components
- Mock external dependencies

## API Design

### Pagination Pattern
```typescript
interface PaginatedResult<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}
```
- Consistent pagination interface
- Include total count and hasMore flag
- Default values for offset/limit
- Type-safe generic results

### Response Structure
- Consistent error responses
- Include metadata in responses
- Use HTTP status codes correctly
- Return typed JSON responses

## State Management

### Zustand Stores
- Separate stores by domain (cart, auth, activity)
- Minimal store state
- Derived values via selectors
- Actions co-located with state

### Server State
- TanStack Query for server data
- Automatic refetching and caching
- Optimistic updates for mutations
- Error and loading states

## Security Practices

### Authentication
- NextAuth.js for authentication
- Role-based access control
- Protected API routes
- Session validation in middleware

### Data Sanitization
- Sanitize HTML input with sanitize-html
- Validate all user input with Zod
- Parameterized database queries
- Rate limiting on API routes

### Environment Variables
- Never commit secrets
- Use .env.example for documentation
- Validate required env vars at startup
- Type-safe env var access

## Documentation Standards

### Code Comments
```typescript
/**
 * Get recent activities with pagination
 * Combines data from multiple sources in optimized parallel queries
 * 
 * @param offset - Pagination offset (default: 0)
 * @param limit - Number of activities to return (default: 20)
 * @returns Paginated activity list
 */
```
- JSDoc comments for public functions
- Explain "why" not "what"
- Document complex algorithms
- Include parameter descriptions

### Inline Comments
- Use for complex logic explanation
- Mark TODOs with context
- Explain non-obvious decisions
- Keep comments up-to-date

## Common Code Idioms

### Null Coalescing
```typescript
const value = user?.firstName ?? 'Unknown';
```

### Optional Chaining
```typescript
const email = quote.user?.email ?? null;
```

### Array Methods
```typescript
const sorted = items
  .filter(item => item.isActive)
  .map(item => transform(item))
  .sort((a, b) => b.timestamp - a.timestamp);
```

### Object Spreading
```typescript
const updated = {
  ...existing,
  ...overrides,
  timestamp: new Date(),
};
```

### Async/Await
```typescript
const result = await Promise.all([
  operation1(),
  operation2(),
]);
```

## UI Component Patterns

### Client Components
```typescript
"use client"

export function Component() {
  // Client-side interactivity
}
```
- Mark with "use client" directive
- Use for interactive components
- Access browser APIs
- Handle user events

### Accessibility
```typescript
<div
  role="region"
  aria-roledescription="carousel"
  aria-label="Product carousel"
>
```
- Include ARIA attributes
- Keyboard navigation support
- Screen reader text with sr-only
- Focus management

### Styling with Tailwind
```typescript
className={cn(
  "base-classes",
  condition && "conditional-classes",
  className
)}
```
- Use `cn()` utility for class merging
- Conditional classes with logical operators
- Accept className prop for extensibility
- Responsive classes (sm:, md:, lg:)

## Database Patterns

### Prisma Queries
```typescript
await prisma.user.findMany({
  where: { role: 'customer' },
  select: {
    id: true,
    email: true,
    firstName: true,
  },
  orderBy: { createdAt: 'desc' },
  take: limit,
  skip: offset,
});
```
- Use `select` to limit fields
- Include relations only when needed
- Add indexes for where/orderBy fields
- Use transactions for multi-step operations

### Raw SQL
```typescript
await prisma.$queryRaw<ResultType[]>`
  SELECT * FROM "Table"
  WHERE condition = ${value}
  LIMIT ${limit}
`;
```
- Use for complex queries
- Type the result with generics
- Parameterize all user input
- Escape table/column names with quotes

## Import Organization

### Import Order
```typescript
// 1. React and framework imports
import * as React from "react"
import { useRouter } from "next/navigation"

// 2. Third-party libraries
import { useSession } from "next-auth/react"
import { formatDistanceToNow } from "date-fns"

// 3. Internal utilities and types
import { cn } from "@/lib/utils"
import type { ActivityEvent } from "@/types"

// 4. Components
import { Button } from "@/components/ui/button"
import { Section } from "@/components/ui/section"

// 5. Icons
import { LogOut, Mail } from "lucide-react"
```

### Path Aliases
- Use `@/` for src directory imports
- Absolute imports over relative
- Consistent import style across codebase
