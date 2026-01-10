# Monitoring Integration Guide

This guide shows how to use the monitoring services (Web Vitals, Error Logging, Performance Metrics) in your application.

## Quick Start

The monitoring services are automatically initialized in the root layout via the `useMonitoring` hook. All services are ready to use immediately.

## Web Vitals Tracking

Web Vitals are automatically tracked. To access metrics:

```typescript
import { getWebVitalsTracker } from '@/lib/web-vitals'

// Get all metrics
const tracker = getWebVitalsTracker()
const metrics = tracker.getMetrics()
console.log('Current Web Vitals:', metrics)

// Get specific metric
const lcp = tracker.getMetric('LCP')
console.log('Largest Contentful Paint:', lcp)

// Metrics are automatically sent to /api/monitoring/web-vitals
```

### Web Vitals Explained

- **LCP (Largest Contentful Paint)**: Time until largest visible element loads. Target: ≤2500ms
- **FID (First Input Delay)**: Time between user input and response. Target: ≤100ms
- **CLS (Cumulative Layout Shift)**: Unexpected layout shifts. Target: ≤0.1
- **TTFB (Time to First Byte)**: Server response time. Target: ≤600ms
- **FCP (First Contentful Paint)**: Time until first content renders. Target: ≤1800ms

## Error Logging

Errors are automatically caught and logged. To add context:

```typescript
import { addBreadcrumb, captureError } from '@/lib/error-logger'

// Log user actions (breadcrumbs)
addBreadcrumb('User clicked submit button', 'user-action', {
  buttonId: 'submit-btn',
  formId: 'checkout-form'
})

// Manually capture errors
try {
  await apiCall()
} catch (error) {
  captureError(error, 'error', {
    context: 'API call failed',
    endpoint: '/api/checkout'
  })
}

// Capture messages
captureError('Payment failed', 'warning', {
  paymentId: 'pay_123',
  reason: 'Invalid card'
})
```

### Breadcrumb Categories

- `user-action`: User interactions (clicks, form submissions)
- `navigation`: Page navigation and route changes
- `api-call`: API requests and responses
- `custom`: Your custom events

## Performance Monitoring

Track custom performance metrics:

```typescript
import {
  startMeasurement,
  endMeasurement,
  measureAsync,
  measure,
  getPerformanceMonitor
} from '@/lib/performance-monitor'

// Manual timing
startMeasurement('data_fetch')
const data = await fetch('/api/data').then(r => r.json())
endMeasurement('data_fetch', { endpoint: '/api/data' })

// Async function wrapping
const result = await measureAsync('database_query', async () => {
  return await db.query('SELECT * FROM products')
}, { queryType: 'products' })

// Sync function wrapping
const processed = measure('data_processing', () => {
  return expensiveCalculation(data)
}, { size: data.length })

// Get metric statistics
const monitor = getPerformanceMonitor()
const stats = monitor.getMetricStats('api_call')
console.log(`API calls: avg ${stats.avg}ms, p95 ${stats.p95}ms`)
```

## Using Monitoring Hooks

### useMonitoring (Root Layout)

Already initialized in `src/app/layout.tsx`. Configure options:

```typescript
useMonitoring({
  userId: 'user-123',  // Set after user login
  webVitalsEndpoint: '/api/monitoring/web-vitals',
  errorLoggingEndpoint: '/api/monitoring/errors',
  performanceMetricsEndpoint: '/api/monitoring/metrics',
  enableWebVitals: true,
  enableErrorLogging: true,
  enablePerformanceMonitoring: true,
})
```

### useTrackAction

Track user actions in components:

```typescript
'use client'

import { useTrackAction } from '@/hooks/use-monitoring'

export function CheckoutButton() {
  useTrackAction('checkout_started', {
    cartTotal: 100,
    itemCount: 5
  })

  return <button>Proceed to Checkout</button>
}
```

### useMeasureRender

Measure component render time:

```typescript
'use client'

import { useMeasureRender } from '@/hooks/use-monitoring'

export function ExpensiveComponent() {
  useMeasureRender('ExpensiveComponent')

  return <div>{/* Complex rendering */}</div>
}
```

## Component Integration Examples

### Form Submission with Error Handling

```typescript
'use client'

import { captureError, addBreadcrumb } from '@/lib/error-logger'
import { measureAsync } from '@/lib/performance-monitor'

export function CheckoutForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    addBreadcrumb('Checkout form submitted', 'user-action', {
      formId: 'checkout',
      timestamp: new Date()
    })

    try {
      const result = await measureAsync('checkout_process', async () => {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          body: JSON.stringify({ /* form data */ })
        })
        return response.json()
      }, { formType: 'checkout' })

      addBreadcrumb('Checkout successful', 'user-action', {
        orderId: result.orderId
      })
    } catch (error) {
      captureError(error, 'error', {
        context: 'Checkout failed',
        formData: true
      })
      addBreadcrumb('Checkout error', 'user-action', {
        error: error.message
      })
    }
  }

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>
}
```

### API Call with Monitoring

```typescript
'use client'

import { startMeasurement, endMeasurement } from '@/lib/performance-monitor'
import { captureError, trackApiCall } from '@/lib/error-logger'

export async function fetchProducts(category?: string) {
  startMeasurement('fetch_products')
  
  try {
    const response = await fetch(
      `/api/products${category ? `?category=${category}` : ''}`
    )
    const data = await response.json()
    
    endMeasurement('fetch_products', {
      category: category || 'all',
      status: response.status
    })
    
    trackApiCall('GET', '/api/products', response.status, 0)
    
    return data
  } catch (error) {
    endMeasurement('fetch_products', {
      category: category || 'all',
      error: true
    })
    
    captureError(error, 'error', {
      context: 'Failed to fetch products',
      category
    })
    
    throw error
  }
}
```

### Page Navigation with Tracking

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { addBreadcrumb, trackPageNavigation } from '@/lib/error-logger'

export function NavigationLink({ href, children }) {
  const router = useRouter()

  const handleClick = () => {
    addBreadcrumb(`Navigation to ${href}`, 'navigation', {
      from: window.location.pathname
    })
    
    trackPageNavigation(href, {
      timestamp: new Date()
    })
    
    router.push(href)
  }

  return <button onClick={handleClick}>{children}</button>
}
```

## Accessing Metrics

### Via API Endpoints

Get aggregated metrics from API:

```typescript
// Get Web Vitals
const webVitals = await fetch('/api/monitoring/web-vitals', {
  headers: { 'Authorization': 'Bearer token' }
}).then(r => r.json())

// Get Error Logs
const errors = await fetch('/api/monitoring/errors?severity=error', {
  headers: { 'Authorization': 'Bearer token' }
}).then(r => r.json())

// Get Performance Metrics
const metrics = await fetch('/api/monitoring/metrics', {
  headers: { 'Authorization': 'Bearer token' }
}).then(r => r.json())
```

### Programmatically in Code

```typescript
import { getMonitoring } from '@/hooks/use-monitoring'

const { webVitals, errorLogger, performanceMonitor } = getMonitoring()

// Web Vitals
console.log('Metrics:', webVitals?.getMetrics())

// Error Logger
console.log('Breadcrumbs:', errorLogger?.getBreadcrumbs())
console.log('Errors:', errorLogger?.getErrors())

// Performance Monitor
console.log('API Call Stats:', performanceMonitor?.getMetricStats('api_call'))
console.log('Memory:', performanceMonitor?.trackMemoryUsage())
```

## Performance Thresholds

Default thresholds for detecting slow operations:

```
api_call: > 1000ms
page_load: > 3000ms
component_render: > 300ms
image_load: > 2000ms
database_query: > 1000ms
memory_usage: > 80%
```

These are configurable in `src/lib/performance-monitor.ts` via `PERFORMANCE_THRESHOLDS`.

## Best Practices

1. **Log Meaningful Breadcrumbs**: Include enough context to understand what the user was doing
2. **Use Tags for Metrics**: Always add relevant tags to metrics for filtering (e.g., endpoint, component name)
3. **Batch API Calls**: The error logger and performance monitor batch reports to reduce network load
4. **Handle Unload**: Errors and metrics are flushed on page unload automatically
5. **Set User Context**: Call `setUser()` after login to associate errors with users
6. **Monitor Critical Paths**: Focus on monitoring critical user journeys (checkout, login, etc.)

## Debugging

Enable console logging in development:

```typescript
// In browser console or component
const { errorLogger, performanceMonitor } = getMonitoring()
console.log('Errors:', errorLogger?.getErrors())
console.log('Breadcrumbs:', errorLogger?.getBreadcrumbs())
console.log('Metrics:', performanceMonitor?.getAllMetrics())
```

## Disabling Monitoring

To disable specific services:

```typescript
useMonitoring({
  enableWebVitals: true,
  enableErrorLogging: false,  // Disable error logging
  enablePerformanceMonitoring: false,  // Disable custom metrics
})
```

Or globally in environment variables:

```bash
NEXT_PUBLIC_ENABLE_MONITORING=false
```

Would need to update the hook to check this environment variable.

## Next Steps

1. Set up database storage for metrics in your API routes
2. Create a monitoring dashboard to visualize metrics
3. Configure alerting for critical errors or slow operations
4. Integrate with external monitoring services (Sentry, Datadog, etc.)
5. Add custom metrics for your specific business flows
