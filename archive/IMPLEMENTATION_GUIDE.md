# Implementation Guide: Custom Hooks, Utilities & Enhancements

This document provides a comprehensive guide on how to use all the newly implemented features.

## Table of Contents

1. [Custom Hooks](#custom-hooks)
2. [Utility Functions](#utility-functions)
3. [Components](#components)
4. [State Management](#state-management)
5. [Performance Optimization](#performance-optimization)
6. [Accessibility](#accessibility)
7. [Error Handling](#error-handling)
8. [Form Validation](#form-validation)

---

## Custom Hooks

### 1. useMediaQuery

Detects if a media query matches and returns a boolean. Perfect for responsive design and feature detection.

**Location:** `src/hooks/use-media-query.ts`

**Usage:**
```typescript
import { useMediaQuery } from '@/hooks/use-media-query'

export function MyComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  return (
    <div>
      {isMobile && <MobileMenu />}
      {isTablet && <TabletView />}
    </div>
  )
}
```

**Common Media Queries:**
- `'(max-width: 640px)'` - Mobile
- `'(min-width: 641px) and (max-width: 1024px)'` - Tablet
- `'(min-width: 1025px)'` - Desktop
- `'(prefers-reduced-motion: reduce)'` - Respects user motion preferences
- `'(prefers-color-scheme: dark)'` - Dark mode preference

---

### 2. useScrollPosition

Tracks the current scroll position of the window or a specific element. Useful for scroll-based effects.

**Location:** `src/hooks/use-scroll-position.ts`

**Usage:**
```typescript
import { useScrollPosition } from '@/hooks/use-scroll-position'

export function ScrollIndicator() {
  const { x, y } = useScrollPosition()
  const scrollPercentage = (y / (document.documentElement.scrollHeight - window.innerHeight)) * 100

  return (
    <div className="fixed top-0 left-0 h-1 bg-blue-500" style={{ width: `${scrollPercentage}%` }} />
  )
}

// With throttling (updates every 100ms)
export function SmoothScroll() {
  const position = useScrollPosition(null, { throttle: 100 })
  return <div>Scroll Y: {position.y}</div>
}

// Track element scroll
export function ElementScroll() {
  const ref = useRef<HTMLDivElement>(null)
  const position = useScrollPosition(ref.current)
  return <div ref={ref} className="overflow-auto h-96">{/* content */}</div>
}
```

---

### 3. useIntersectionObserver

Detects when an element comes into view using the Intersection Observer API. Great for lazy loading and animations.

**Location:** `src/hooks/use-intersection-observer.ts`

**Usage:**
```typescript
import { useIntersectionObserver } from '@/hooks/use-intersection-observer'

// Simple visibility detection
export function LazyImage() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 })

  return (
    <div ref={ref}>
      {isVisible && <img src="large-image.jpg" alt="Lazy loaded" />}
    </div>
  )
}

// Freeze once visible (only loads once)
export function AnimatedSection() {
  const { ref, isVisible } = useIntersectionObserver({ 
    threshold: 0.5,
    freezeOnceVisible: true 
  })

  return (
    <section ref={ref} className={isVisible ? 'animate-fade-in' : 'opacity-0'}>
      Content
    </section>
  )
}

// With entry data
export function ScrollTriggeredContent() {
  const { ref, entry } = useIntersectionObserver()

  return (
    <div ref={ref}>
      {entry && <p>Intersection ratio: {entry.intersectionRatio}</p>}
    </div>
  )
}
```

---

### 4. useScrollLock

Prevents scrolling on the body element when active. Useful for modals and mobile menus.

**Location:** `src/hooks/use-scroll-lock.ts`

**Usage:**
```typescript
import { useScrollLock } from '@/hooks/use-scroll-lock'
import { useMenuStore } from '@/stores/menuStore'

export function MobileMenu() {
  const { isMenuOpen } = useMenuStore()
  useScrollLock(isMenuOpen)

  return (
    <div className={isMenuOpen ? 'block' : 'hidden'}>
      {/* Menu content */}
    </div>
  )
}

// With modal
export function Modal({ isOpen }) {
  useScrollLock(isOpen)

  return isOpen && (
    <div className="fixed inset-0 bg-black/50">
      {/* Modal content */}
    </div>
  )
}
```

**Benefits:**
- Prevents scrollbar width shift
- Preserves original scroll position
- Automatically cleans up on unmount

---

## Utility Functions

### Formatters

**Location:** `src/lib/formatters.ts`

Provides common formatting functions:

```typescript
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatNumber,
  formatBytes,
  formatTitleCase,
  formatSlug,
  formatTruncate,
  formatPhoneNumber,
  formatRelativeTime,
} from '@/lib/formatters'

// Date formatting
formatDate(new Date()) // "December 3, 2025"
formatDateTime(new Date()) // "Dec 3, 2025, 2:30 PM"
formatRelativeTime(new Date(Date.now() - 3600000)) // "1 hour ago"

// Currency & numbers
formatCurrency(1234.56) // "$1,234.56"
formatNumber(1234567, 2) // "1,234,567.00"
formatBytes(1024 * 1024) // "1 MB"

// Text formatting
formatTitleCase("hello world") // "Hello World"
formatSlug("Hello World!") // "hello-world"
formatTruncate("Long text...", 10) // "Long te..."
formatPhoneNumber("1234567890") // "(123) 456-7890"
```

### Validators

**Location:** `src/lib/validators.ts`

Provides validation functions for forms and data:

```typescript
import {
  validateEmail,
  validatePassword,
  validateUrl,
  validatePhoneNumber,
  validateLength,
  validatePattern,
  validateCreditCard,
  validateUsername,
  validateDate,
  validateIPv4,
} from '@/lib/validators'

// Email validation
validateEmail("user@example.com") // true
validateEmail("invalid") // false

// Password strength
validatePassword("SecurePass1!") // true (requires uppercase, lowercase, number, special char)
validatePassword("weak") // false

// Other validations
validateUrl("https://example.com") // true
validatePhoneNumber("1234567890") // true
validateLength("hello", 2, 10) // true
validatePattern("hello123", /^[a-z]+\d+$/) // true
validateCreditCard("4532015112830366") // true (valid card number)
```

---

## Components

### OptimizedImage

Handles lazy loading, responsive images, and prevents layout shift.

**Location:** `src/components/optimized-image.tsx`

**Usage:**
```typescript
import { OptimizedImage, ResponsiveImage } from '@/components/optimized-image'

// Basic usage
<OptimizedImage
  src="/products/item.jpg"
  alt="Product name"
  width={400}
  height={300}
  lazyLoad={true}
/>

// With aspect ratio (prevents layout shift)
<OptimizedImage
  src="/images/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  aspectRatio="16:9"
  containerClassName="rounded-lg overflow-hidden"
/>

// Responsive images with different sources
<ResponsiveImage
  sources={[
    {
      media: '(max-width: 640px)',
      srcSet: '/images/product-mobile.jpg',
      sizes: '100vw'
    },
    {
      media: '(min-width: 641px)',
      srcSet: '/images/product-desktop.jpg',
      sizes: '50vw'
    }
  ]}
  fallback="/images/product.jpg"
  alt="Product"
  lazyLoad={true}
/>
```

**Features:**
- Automatic lazy loading with Intersection Observer
- Aspect ratio containers prevent CLS (Cumulative Layout Shift)
- Responsive image support
- Loading placeholders
- Priority loading for above-fold images

---

### Loading Skeletons

Placeholder components while content loads.

**Location:** `src/components/loading-skeletons.tsx`

**Usage:**
```typescript
import {
  ProductCardSkeleton,
  ProductGridSkeleton,
  BrandCardSkeleton,
  BrandGridSkeleton,
  TextSkeleton,
  HeaderSkeleton,
  CardSkeleton,
  TableSkeleton,
  HeroSkeleton,
} from '@/components/loading-skeletons'

// Single item
<ProductCardSkeleton />

// Grid of items
<ProductGridSkeleton count={6} />

// Text skeleton with multiple lines
<TextSkeleton lines={3} className="mb-4" />

// Custom skeleton
<div className="space-y-4">
  <HeaderSkeleton />
  <CardSkeleton />
  <TableSkeleton rows={5} cols={4} />
</div>
```

---

### Error Boundary

Catches errors and displays fallback UI.

**Location:** `src/components/error-boundary.tsx`

**Usage:**
```typescript
import { ErrorBoundary } from '@/components/error-boundary'

// Wrap entire app
<ErrorBoundary level="page">
  <App />
</ErrorBoundary>

// Wrap sections
<ErrorBoundary level="section" onError={(error) => console.error(error)}>
  <ExpensiveComponent />
</ErrorBoundary>

// Custom fallback
<ErrorBoundary
  fallback={<div className="p-4 text-red-500">Failed to load component</div>}
>
  <Component />
</ErrorBoundary>
```

**Features:**
- Error logging to console and external services
- Development error details
- User-friendly error messages
- Reset/retry functionality
- Error level tracking (page/section/component)

---

## State Management

### Menu Store

Manages mobile menu and submenu state.

**Location:** `src/stores/menuStore.ts`

**Usage:**
```typescript
import { useMenuStore } from '@/stores/menuStore'

export function MobileMenuButton() {
  const { isMenuOpen, toggleMenu, closeMenu, toggleSubmenu, isSubmenuOpen } = useMenuStore()

  return (
    <>
      <button onClick={toggleMenu}>
        {isMenuOpen ? 'Close' : 'Open'} Menu
      </button>

      {isMenuOpen && (
        <nav>
          <button onClick={() => toggleSubmenu('products')}>
            Products {isSubmenuOpen['products'] && '▼'}
          </button>
          {isSubmenuOpen['products'] && (
            <ul>{/* submenu items */}</ul>
          )}
        </nav>
      )}
    </>
  )
}
```

### Cart Store

Manages shopping cart state with localStorage persistence.

**Location:** `src/stores/cartStore.ts`

**Usage:**
```typescript
import { useCartStore } from '@/stores/cartStore'

export function CartSummary() {
  const { items, getTotal, getItemCount, addItem, removeItem, updateQuantity } = useCartStore()

  return (
    <div>
      <p>Items: {getItemCount()}</p>
      <p>Total: ${getTotal().toFixed(2)}</p>
    </div>
  )
}
```

### Preferences Store

Manages user preferences with localStorage persistence.

**Location:** `src/stores/preferencesStore.ts`

**Usage:**
```typescript
import { usePreferencesStore } from '@/stores/preferencesStore'

export function ThemeSwitcher() {
  const { theme, setTheme } = usePreferencesStore()

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  )
}
```

---

## Performance Optimization

### Code Splitting with React.lazy

Use React.lazy for route components:

```typescript
import { lazy, Suspense } from 'react'
import { ProductGridSkeleton } from '@/components/loading-skeletons'

const ProductsPage = lazy(() => import('@/app/products/page'))
const AccountPage = lazy(() => import('@/app/account/page'))

export function Routes() {
  return (
    <>
      <Suspense fallback={<ProductGridSkeleton count={6} />}>
        <ProductsPage />
      </Suspense>

      <Suspense fallback={<div>Loading account...</div>}>
        <AccountPage />
      </Suspense>
    </>
  )
}
```

### Image Optimization

Always use OptimizedImage with proper dimensions:

```typescript
// ✅ Good - prevents CLS
<OptimizedImage
  src="/image.jpg"
  alt="Description"
  width={1200}
  height={600}
  aspectRatio="16:9"
  lazyLoad={true}
/>

// ❌ Bad - causes layout shift
<img src="/image.jpg" alt="Description" />
```

---

## Accessibility

### Focus Indicators

All interactive elements have focus indicators:

**Location:** `src/styles/focus-visible.css`

The file is already imported in layout.tsx and provides:
- 2px focus outlines
- High contrast colors
- Proper focus offset
- Dark mode support

### Skip Link

Navigate to main content with keyboard:

**Location:** `src/components/skip-link.tsx`

- Press Tab immediately on page load
- Already included in layout.tsx

### ARIA Attributes

Use with state management:

```typescript
<button
  aria-expanded={isMenuOpen}
  aria-controls="mobile-menu"
  onClick={toggleMenu}
>
  Menu
</button>

<nav id="mobile-menu" hidden={!isMenuOpen}>
  {/* Menu items */}
</nav>
```

---

## Form Validation

Enhanced useForm hook with comprehensive validation rules.

**Location:** `src/hooks/use-form.ts`

**Usage:**
```typescript
import { useForm } from '@/hooks/use-form'

export function ContactForm() {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, submitSuccess } = useForm({
    initialValues: { email: '', message: '', subscribe: false },
    
    validationRules: {
      email: {
        required: 'Email is required',
        email: 'Please enter a valid email'
      },
      message: {
        required: 'Message is required',
        minLength: { value: 10, message: 'Min 10 characters' },
        maxLength: { value: 1000, message: 'Max 1000 characters' }
      }
    },
    
    onSubmit: async (values) => {
      const res = await fetch('/api/contact', { 
        method: 'POST', 
        body: JSON.stringify(values) 
      })
      if (!res.ok) throw new Error('Failed to submit')
    },
    
    onError: (error) => console.error('Form error:', error)
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Email"
          className={errors.email && touched.email ? 'border-red-500' : ''}
        />
        {errors.email && touched.email && <p className="text-red-500">{errors.email}</p>}
      </div>

      <div>
        <textarea
          name="message"
          value={values.message}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Message"
          className={errors.message && touched.message ? 'border-red-500' : ''}
        />
        {errors.message && touched.message && <p className="text-red-500">{errors.message}</p>}
      </div>

      <label>
        <input
          type="checkbox"
          name="subscribe"
          checked={values.subscribe}
          onChange={handleChange}
        />
        Subscribe
      </label>

      {submitSuccess && <p className="text-green-500">Form submitted successfully!</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
```

**Validation Features:**
- Real-time field validation on blur
- Built-in validators (email, minLength, maxLength, pattern)
- Custom validation functions
- Cross-field validation
- Touched field tracking for better UX
- Loading states during submission
- Success/error feedback
- Dirty state tracking

---

## Summary of Files Created/Modified

### New Files Created:
- `src/hooks/use-media-query.ts` - Media query hook
- `src/hooks/use-scroll-position.ts` - Scroll position tracking
- `src/hooks/use-intersection-observer.ts` - Element visibility detection
- `src/hooks/use-scroll-lock.ts` - Scroll prevention
- `src/lib/formatters.ts` - Text and number formatting functions
- `src/lib/validators.ts` - Form and data validation functions
- `src/components/loading-skeletons.tsx` - Loading placeholder components
- `src/components/optimized-image.tsx` - Optimized image components

### Modified Files:
- `src/hooks/use-form.ts` - Enhanced with validation rules and better error handling
- `src/stores/menuStore.ts` - Added submenu support
- `src/styles/focus-visible.css` - Enhanced focus styles
- `src/components/error-boundary.tsx` - Enhanced with better error logging and UI

---

## Best Practices

1. **Always use dimensions for images** - Prevents layout shift
2. **Implement lazy loading** - Use `useIntersectionObserver` or `OptimizedImage`
3. **Handle touch targets** - Minimum 44px for mobile
4. **Test keyboard navigation** - Use focus indicators
5. **Provide loading states** - Use skeleton components
6. **Log errors properly** - Error Boundary logs to console and can log to services
7. **Validate forms** - Use validation rules for consistent validation
8. **Test on actual devices** - Responsive design doesn't always match reality

---

## Resources

- [MDN: Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [MDN: Web Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Web.dev: Web Vitals](https://web.dev/vitals/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
