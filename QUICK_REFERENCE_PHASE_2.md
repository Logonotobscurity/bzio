# 📚 Quick Reference - Phase 2 Implementation

## Data Fetching Hooks - At a Glance

### 1. Dashboard Hooks
```typescript
import { useAdminDashboard, useAdminStats, useRecentQuotes } from '@/hooks/useAdminDashboard';

// Full dashboard (stats + recent quotes)
const { data, isLoading, error } = useAdminDashboard(20);

// Stats only (lighter weight)
const { data } = useAdminStats();

// Recent quotes with optional auto-refresh
const { data } = useRecentQuotes(20, 30000); // Refresh every 30s
```

### 2. Quote Hooks
```typescript
import { useAdminQuotes, useQuoteDetail, useQuoteStats } from '@/hooks/useAdminQuotes';

// All quotes with filtering
const { data } = useAdminQuotes({ status: 'draft', limit: 50 });

// Single quote (skips fetch if no ID)
const { data } = useQuoteDetail(quoteId);

// Quote statistics
const { data } = useQuoteStats();
```

### 3. Order Hooks
```typescript
import { useAdminOrders, useOrderDetail, useOrderStats, useRecentOrders } from '@/hooks/useAdminOrders';

// All orders
const { data } = useAdminOrders({ status: 'completed' });

// Single order
const { data } = useOrderDetail(orderId);

// Recent orders for dashboard
const { data } = useRecentOrders(10);
```

### 4. Newsletter Hooks
```typescript
import { useNewsletterSubscribers, useNewsletterStats, useSubscriberDetail } from '@/hooks/useNewsletterSubscribers';

// All subscribers
const { data } = useNewsletterSubscribers({ status: 'active' });

// Newsletter stats
const { data } = useNewsletterStats();

// Single subscriber
const { data } = useSubscriberDetail(subscriberId);
```

### 5. Generic Hook
```typescript
import { useFetchData, usePaginatedData } from '@/hooks/useFetchData';

// Any endpoint
const { data } = useFetchData<MyType>('/api/custom/endpoint');

// Paginated endpoint
const { data } = usePaginatedData('/api/items', 1, 20);
```

---

## Error Handling - At a Glance

### Using Error Boundary
```typescript
<DataFetchErrorBoundary>
  <YourComponent />
</DataFetchErrorBoundary>
```

### With Custom Fallback
```typescript
<DataFetchErrorBoundary
  fallback={(error, retry) => (
    <ErrorUI error={error} onRetry={retry} />
  )}
>
  <YourComponent />
</DataFetchErrorBoundary>
```

### Inline Error Handling
```typescript
const { data, error, isLoading } = useAdminQuotes();

if (error) {
  return <Alert variant="destructive">{error.message}</Alert>;
}
if (isLoading) return <Skeleton />;
return <QuotesList data={data} />;
```

---

## New Routes - At a Glance

```
/admin
├─ /admin/quotes        ← Quotes management
├─ /admin/newsletter    ← Newsletter management  
├─ /admin/forms         ← Forms management
├─ /admin/analytics     ← Analytics dashboard
└─ /pricing             ← (Upgrade button target)
```

---

## Cache Strategies - At a Glance

| Hook | Stale | Cache | Best For |
|------|-------|-------|----------|
| Dashboard | 5m | 10m | Overview |
| Stats | 2m | 5m | Metrics cards |
| Quotes | 2m | 10m | List views |
| Quote Detail | 5m | 15m | Detail pages |
| Orders | 2m | 10m | List views |
| Recent | 1m | 5m | Live updates |

---

## Common Patterns - At a Glance

### Component with Loading/Error States
```typescript
'use client';
import { useAdminQuotes } from '@/hooks/useAdminQuotes';
import { Skeleton } from '@/components/ui/skeleton';

export function QuotesPage() {
  const { data, isLoading, error } = useAdminQuotes();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorAlert error={error} />;

  return <QuotesList quotes={data || []} />;
}
```

### Component with Filtering
```typescript
const [filter, setFilter] = useState({ status: 'draft' });
const { data } = useAdminQuotes(filter);

// data updates when filter changes
```

### Component with Manual Refetch
```typescript
const { data, refetch } = useAdminQuotes();

<Button onClick={() => refetch()}>Refresh</Button>
```

### Component with Auto-Refresh
```typescript
const { data } = useRecentQuotes(20, 30000);
// Automatically refreshes every 30 seconds
```

---

## Type Definitions - Quick Lookup

### Dashboard
```typescript
DashboardStats {
  totalQuotes, pendingQuotes, completedQuotes, totalValue
}
RecentQuote {
  id, reference, buyerContactEmail, status, total, itemCount, ...
}
```

### Quotes
```typescript
Quote {
  id, reference, status, total, itemCount, createdAt, lines: []
}
QuoteLine {
  id, productId, quantity, price, total
}
```

### Orders
```typescript
Order {
  id, orderNumber, buyerEmail, status, total, itemCount, items: []
}
OrderStats {
  totalOrders, pendingOrders, completedOrders, totalRevenue, averageOrderValue
}
```

### Newsletter
```typescript
Newsletter {
  id, email, subscribedAt, status, tags, metadata
}
NewsletterStats {
  totalSubscribers, activeSubscribers, unsubscribed, bounced, engagementRate
}
```

---

## Import Reference

```typescript
// Hooks
import { useAdminDashboard, useAdminStats } from '@/hooks/useAdminDashboard';
import { useAdminQuotes, useQuoteDetail } from '@/hooks/useAdminQuotes';
import { useAdminOrders, useOrderDetail } from '@/hooks/useAdminOrders';
import { useNewsletterSubscribers } from '@/hooks/useNewsletterSubscribers';
import { useFetchData, usePaginatedData } from '@/hooks/useFetchData';

// Components
import { DataFetchErrorBoundary } from '@/components/DataFetchErrorBoundary';

// Auth (now standardized)
import { USER_ROLES, REDIRECT_PATHS } from '@/lib/auth-constants';

// Routes
/admin/quotes
/admin/newsletter
/admin/forms
/admin/analytics
```

---

## Query Key Reference

```typescript
// Used by React Query for caching
['admin-dashboard', limit]      // useAdminDashboard
['admin-stats']                 // useAdminStats
['recent-quotes', limit]        // useRecentQuotes
['admin-quotes', filters]       // useAdminQuotes
['quote-detail', quoteId]       // useQuoteDetail
['admin-orders', filters]       // useAdminOrders
['order-detail', orderId]       // useOrderDetail
['recent-orders', limit]        // useRecentOrders
['newsletter-subscribers', ...]  // useNewsletterSubscribers
[url]                           // useFetchData
[baseUrl, page, limit]          // usePaginatedData
```

---

## Troubleshooting Quick Guide

| Issue | Solution |
|-------|----------|
| Data not showing | Check if endpoint exists (Phase 2.3) |
| Stale data | Wait for cache to invalidate or manually call refetch() |
| Infinite loop | Check hook dependencies, enable conditional fetching |
| Type errors | Import correct interface from hook |
| Error not caught | Wrap component in DataFetchErrorBoundary |
| Network error | Check error.message, verify API running |

---

## Performance Tips

1. **Pagination** → Use `usePaginatedData` for large lists
2. **Selective Fetching** → Use `enabled` option to skip fetches
3. **Request Dedup** → React Query auto-deduplicates concurrent requests
4. **Cache Hit** → Data is fresh within staleTime, stale in background after
5. **Network Info** → Check Network tab in DevTools to verify caching

---

## Migration Checklist

When replacing old data fetching:

- [ ] Find all fetch() calls in component
- [ ] Identify data type needed
- [ ] Choose appropriate hook
- [ ] Replace useState with hook
- [ ] Remove useEffect
- [ ] Add loading state handler
- [ ] Add error state handler
- [ ] Test in browser
- [ ] Check DevTools Network tab for caching

---

## File Locations

```
Hooks:         src/hooks/useAdmin*.ts
Components:    src/components/DataFetchErrorBoundary.tsx
Routes:        src/app/admin/*/page.tsx
Auth:          src/lib/auth-constants.ts
Docs:          DATA_FETCHING_STANDARDIZATION.md
```

---

## Key Statistics

```
Hooks Created:        5
Total Lines:          730+
TypeScript Types:     18+ interfaces
Error Handling:       1 boundary + inline options
Cache Strategies:     3 different patterns
Documentation Pages: 3 comprehensive guides
Routes Added:         4 new admin pages
```

---

**For more details**: See `DATA_FETCHING_STANDARDIZATION.md`  
**For deployment**: See `PHASE_2_DEPLOYMENT_CHECKLIST.md`  
**For implementation details**: See `PHASE_2_2_IMPLEMENTATION_SUMMARY.md`
