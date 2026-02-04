# Data Fetching Standardization Guide

## Overview

This guide outlines the standardized approach to data fetching across the BZION Hub B2B platform. All data fetching operations follow consistent patterns using React Query for optimal performance, caching, and error handling.

## Architecture

### Three-Layer Data Fetching Pattern

```
┌─────────────────────────────────────────┐
│     React Components (UI Layer)         │
│  - useAdminDashboard()                  │
│  - useAdminQuotes()                     │
│  - useAdminOrders()                     │
│  - useNewsletterSubscribers()           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Custom Hooks (Data Layer)              │
│  - src/hooks/useAdminDashboard.ts       │
│  - src/hooks/useAdminQuotes.ts          │
│  - src/hooks/useAdminOrders.ts          │
│  - src/hooks/useNewsletterSubscribers.ts│
│  - src/hooks/useFetchData.ts (generic)  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  API Routes (Server Layer)              │
│  - /api/admin/dashboard                 │
│  - /api/admin/quotes                    │
│  - /api/admin/orders                    │
│  - /api/admin/newsletter                │
└─────────────────────────────────────────┘
```

## Available Hooks

### 1. useAdminDashboard
**Purpose**: Fetch comprehensive dashboard data including stats and recent quotes

```typescript
import { useAdminDashboard } from '@/hooks/useAdminDashboard';

export function DashboardComponent() {
  const { data, isLoading, error } = useAdminDashboard(20);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorUI error={error} />;

  return (
    <div>
      <StatsCard stats={data.stats} />
      <QuotesList quotes={data.recentQuotes} />
    </div>
  );
}
```

**Configuration**:
- `staleTime`: 5 minutes
- `gcTime`: 10 minutes
- `retry`: 2 attempts
- Auto-refetch on window focus

### 2. useAdminStats
**Purpose**: Fetch only dashboard statistics (lightweight)

```typescript
import { useAdminStats } from '@/hooks/useAdminDashboard';

export function StatsCard() {
  const { data, isLoading, error } = useAdminStats();
  // ...
}
```

**Configuration**:
- `staleTime`: 2 minutes
- `gcTime`: 5 minutes
- `retry`: 2 attempts

### 3. useRecentQuotes
**Purpose**: Fetch recent quotes with optional auto-refetch

```typescript
import { useRecentQuotes } from '@/hooks/useAdminDashboard';

export function QuotesList() {
  // Auto-refetch every 30 seconds
  const { data, isLoading } = useRecentQuotes(20, 30000);
  // ...
}
```

### 4. useAdminQuotes
**Purpose**: Fetch all quotes with filtering support

```typescript
import { useAdminQuotes } from '@/hooks/useAdminQuotes';

export function QuotesManagement() {
  const { data, isLoading } = useAdminQuotes({
    status: 'draft',
    email: 'user@example.com',
    limit: 50,
    offset: 0,
  });
  // ...
}
```

### 5. useQuoteDetail
**Purpose**: Fetch a single quote with all details

```typescript
import { useQuoteDetail } from '@/hooks/useAdminQuotes';

export function QuoteDetailView({ quoteId }) {
  const { data, isLoading } = useQuoteDetail(quoteId);
  // Automatically skips fetching if quoteId is null/undefined
  // ...
}
```

### 6. useAdminOrders
**Purpose**: Fetch all orders with filtering support

```typescript
import { useAdminOrders } from '@/hooks/useAdminOrders';

export function OrdersPage() {
  const { data, isLoading } = useAdminOrders({
    status: 'completed',
    limit: 25,
  });
  // ...
}
```

### 7. useNewsletterSubscribers
**Purpose**: Fetch newsletter subscribers with filtering

```typescript
import { useNewsletterSubscribers } from '@/hooks/useNewsletterSubscribers';

export function NewsletterPage() {
  const { data, isLoading } = useNewsletterSubscribers({
    status: 'active',
    limit: 100,
  });
  // ...
}
```

### 8. useFetchData (Generic)
**Purpose**: Generic hook for any API endpoint

```typescript
import { useFetchData } from '@/hooks/useFetchData';

export function CustomComponent() {
  const { data, isLoading } = useFetchData<CustomType>(
    '/api/custom/endpoint',
    { staleTime: 10 * 60 * 1000 }
  );
  // ...
}
```

## Error Handling

### Using Error Boundary
```typescript
import { DataFetchErrorBoundary } from '@/components/DataFetchErrorBoundary';

export function DashboardPage() {
  return (
    <DataFetchErrorBoundary>
      <Dashboard />
    </DataFetchErrorBoundary>
  );
}
```

### Custom Error Fallback
```typescript
import { DataFetchErrorBoundary } from '@/components/DataFetchErrorBoundary';

export function QuotesPage() {
  return (
    <DataFetchErrorBoundary
      fallback={(error, retry) => (
        <div>
          <p>Failed to load quotes: {error.message}</p>
          <button onClick={retry}>Retry</button>
        </div>
      )}
    >
      <QuotesList />
    </DataFetchErrorBoundary>
  );
}
```

### Inline Error Handling
```typescript
const { data, error } = useAdminQuotes();

if (error) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );
}
```

## Query Caching Strategy

### Cache Duration Guidelines

| Data Type | Stale Time | GC Time | Refresh Interval |
|-----------|-----------|---------|-----------------|
| Dashboard Stats | 2 min | 5 min | - |
| Recent Quotes | 1 min | 5 min | 30s (optional) |
| All Quotes | 2 min | 10 min | - |
| Quote Detail | 5 min | 15 min | - |
| Orders | 2 min | 10 min | - |
| Newsletter | 5 min | 15 min | - |

**Explanation**:
- **Stale Time**: How long data is considered fresh. Refetch happens in background after this.
- **GC Time**: How long unused data remains in cache before deletion.
- **Refresh Interval**: Optional auto-refetch for real-time data (in milliseconds).

## API Response Standardization

All API endpoints should return consistent response formats:

### Success Response
```json
{
  "success": true,
  "data": { /* actual data */ },
  "timestamp": "2024-02-03T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Descriptive error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-02-03T10:30:00Z"
}
```

## Implementation Checklist

When creating new data-fetching components:

- [ ] Use appropriate hook from `src/hooks/` directory
- [ ] Handle loading state with skeleton/spinner
- [ ] Handle error state with DataFetchErrorBoundary or inline error handling
- [ ] Display data using TypeScript-typed interfaces
- [ ] Consider pagination for large datasets
- [ ] Add refetch button for manual refresh
- [ ] Test with network throttling to verify UX

## Migration Path

### Before (Old Pattern)
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  fetch('/api/quotes')
    .then(r => r.json())
    .then(d => setData(d))
    .finally(() => setLoading(false));
}, []);

return <div>{loading ? 'Loading...' : data?.map(...)}</div>;
```

### After (New Pattern)
```typescript
const { data, isLoading } = useAdminQuotes();

return <div>{isLoading ? <Skeleton /> : data?.map(...)}</div>;
```

## Performance Considerations

1. **Request Deduplication**: React Query automatically deduplicates concurrent requests
2. **Stale-While-Revalidate**: Background refetch provides fresh data without blocking UI
3. **Pagination**: Use `usePaginatedData` for large datasets
4. **Conditional Fetching**: Use `enabled` option to skip fetching until data is available
5. **Query Invalidation**: Manually invalidate cache after mutations (implement in Phase 2.3)

## Testing Data Fetching

### Mock Setup
```typescript
import { useAdminQuotes } from '@/hooks/useAdminQuotes';

jest.mock('@/hooks/useAdminQuotes', () => ({
  useAdminQuotes: jest.fn(),
}));

test('displays quotes', () => {
  (useAdminQuotes as jest.Mock).mockReturnValue({
    data: mockQuotes,
    isLoading: false,
    error: null,
  });
  
  // Test component
});
```

## Next Steps

1. **Phase 2.2 (Current)**: Implement data fetching hooks ✅
2. **Phase 2.3 (Next)**: Add API route error handling and response standardization
3. **Phase 3 (Future)**: Add test coverage for data fetching hooks
4. **Phase 4 (Future)**: Implement query mutations (useCreateQuote, useUpdateOrder, etc.)

## References

- [React Query Docs](https://tanstack.com/query/latest)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- Project API Routes: `src/app/api/`
- Error Handling: `src/components/DataFetchErrorBoundary.tsx`
