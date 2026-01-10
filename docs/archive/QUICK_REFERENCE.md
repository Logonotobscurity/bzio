# Quick Reference: Common Implementation Patterns

This document provides quick-copy code snippets for common patterns using the new features.

## Mobile Menu with Scroll Lock

```typescript
'use client'

import { useMenuStore } from '@/stores/menuStore'
import { useScrollLock } from '@/hooks/use-scroll-lock'

export function MobileMenu() {
  const { isMenuOpen, toggleMenu, closeMenu } = useMenuStore()
  useScrollLock(isMenuOpen)

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden"
        aria-expanded={isMenuOpen}
        aria-controls="mobile-menu"
      >
        <span className="sr-only">Toggle menu</span>
        {/* hamburger icon */}
      </button>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeMenu}
          role="presentation"
        />
      )}

      {/* Menu */}
      <nav
        id="mobile-menu"
        className={`fixed inset-0 top-16 bg-white z-50 transition-transform ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <ul className="space-y-2 p-4">
          <li><a href="/" onClick={closeMenu}>Home</a></li>
          <li><a href="/products" onClick={closeMenu}>Products</a></li>
          <li><a href="/about" onClick={closeMenu}>About</a></li>
        </ul>
      </nav>
    </>
  )
}
```

## Responsive Component with useMediaQuery

```typescript
'use client'

import { useMediaQuery } from '@/hooks/use-media-query'

export function ResponsiveGallery() {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)')

  const columns = isMobile ? 1 : isTablet ? 2 : 3

  return (
    <div className={`grid grid-cols-${columns} gap-4`}>
      {/* Items */}
    </div>
  )
}
```

## Lazy Loading Images with Skeleton

```typescript
'use client'

import { Suspense } from 'react'
import { OptimizedImage } from '@/components/optimized-image'
import { ProductCardSkeleton } from '@/components/loading-skeletons'

function ProductCard({ product }) {
  return (
    <div className="rounded-lg overflow-hidden bg-white">
      <Suspense fallback={<div className="aspect-square bg-gray-200 animate-pulse" />}>
        <OptimizedImage
          src={product.image}
          alt={product.name}
          width={400}
          height={400}
          aspectRatio="square"
          lazyLoad={true}
        />
      </Suspense>
      <div className="p-4">
        <h3>{product.name}</h3>
        <p className="text-gray-600">${product.price}</p>
      </div>
    </div>
  )
}

export function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
        <Suspense key={product.id} fallback={<ProductCardSkeleton />}>
          <ProductCard product={product} />
        </Suspense>
      ))}
    </div>
  )
}
```

## Form with Validation

```typescript
'use client'

import { useForm } from '@/hooks/use-form'

export function NewsletterForm() {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, submitSuccess, submitError } = useForm({
    initialValues: { email: '' },
    
    validationRules: {
      email: {
        required: 'Email is required',
        email: 'Please enter a valid email address'
      }
    },
    
    onSubmit: async (values) => {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      if (!res.ok) throw new Error('Failed to subscribe')
    }
  })

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter your email"
          className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </button>
      </div>
      
      {errors.email && touched.email && (
        <p className="mt-2 text-sm text-red-500">{errors.email}</p>
      )}
      
      {submitSuccess && (
        <p className="mt-2 text-sm text-green-500">✓ Subscribed successfully!</p>
      )}
      
      {submitError && (
        <p className="mt-2 text-sm text-red-500">Error: {submitError}</p>
      )}
    </form>
  )
}
```

## Scroll Progress Indicator

```typescript
'use client'

import { useScrollPosition } from '@/hooks/use-scroll-position'

export function ScrollProgress() {
  const { y } = useScrollPosition(null, { throttle: 50 })
  
  const height = document.documentElement.scrollHeight - window.innerHeight
  const progress = height > 0 ? (y / height) * 100 : 0

  return (
    <div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-50" 
         style={{ width: `${progress}%` }} 
    />
  )
}
```

## Scroll-Triggered Animation

```typescript
'use client'

import { useIntersectionObserver } from '@/hooks/use-intersection-observer'

export function AnimatedSection() {
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0.2,
    freezeOnceVisible: true
  })

  return (
    <section
      ref={ref}
      className={`transition-all duration-1000 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-10'
      }`}
    >
      <h2>This animates when scrolled into view</h2>
      <p>Content appears smoothly as you scroll</p>
    </section>
  )
}
```

## Advanced Form with Multiple Fields

```typescript
'use client'

import { useForm } from '@/hooks/use-form'
import { validatePassword } from '@/lib/validators'

export function RegistrationForm() {
  const { 
    values, 
    errors, 
    touched, 
    handleChange, 
    handleBlur, 
    handleSubmit, 
    isSubmitting, 
    submitSuccess, 
    submitError,
    isDirty 
  } = useForm({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      agreeToTerms: false
    },
    
    validationRules: {
      firstName: {
        required: 'First name is required',
        minLength: { value: 2, message: 'Min 2 characters' }
      },
      lastName: {
        required: 'Last name is required',
        minLength: { value: 2, message: 'Min 2 characters' }
      },
      email: {
        required: 'Email is required',
        email: 'Invalid email format'
      },
      password: {
        required: 'Password is required',
        minLength: { value: 8, message: 'Min 8 characters' },
        validate: (value) => validatePassword(value) ? true : 'Must contain uppercase, lowercase, number, and special char'
      },
      confirmPassword: {
        required: 'Please confirm your password',
        custom: (value, allValues) => 
          value === allValues.password ? true : 'Passwords do not match'
      },
      agreeToTerms: {
        validate: (value) => value ? true : 'You must agree to the terms'
      }
    },
    
    onSubmit: async (values) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(values)
      })
      if (!res.ok) throw new Error('Registration failed')
    }
  })

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="First name"
            className={`w-full px-3 py-2 border rounded ${
              errors.firstName && touched.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.firstName && touched.firstName && (
            <p className="text-sm text-red-500">{errors.firstName}</p>
          )}
        </div>
        
        <div>
          <input
            type="text"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Last name"
            className={`w-full px-3 py-2 border rounded ${
              errors.lastName && touched.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.lastName && touched.lastName && (
            <p className="text-sm text-red-500">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Email"
          className={`w-full px-3 py-2 border rounded ${
            errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.email && touched.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div>
        <input
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Password"
          className={`w-full px-3 py-2 border rounded ${
            errors.password && touched.password ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.password && touched.password && (
          <p className="text-sm text-red-500">{errors.password}</p>
        )}
      </div>

      <div>
        <input
          type="password"
          name="confirmPassword"
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Confirm password"
          className={`w-full px-3 py-2 border rounded ${
            errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.confirmPassword && touched.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword}</p>
        )}
      </div>

      <label className="flex items-center">
        <input
          type="checkbox"
          name="agreeToTerms"
          checked={values.agreeToTerms}
          onChange={handleChange}
          className="mr-2"
        />
        <span>I agree to the Terms and Conditions</span>
      </label>
      {errors.agreeToTerms && touched.agreeToTerms && (
        <p className="text-sm text-red-500">{errors.agreeToTerms}</p>
      )}

      {submitSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700">
          ✓ Registration successful! Please check your email.
        </div>
      )}

      {submitError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !isDirty}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  )
}
```

## Error Boundary Wrapping

```typescript
'use client'

import { ErrorBoundary } from '@/components/error-boundary'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary level="page" onError={(error) => console.error('Layout error:', error)}>
          <header>
            <ErrorBoundary level="component">
              <Navigation />
            </ErrorBoundary>
          </header>
          
          <main>
            <ErrorBoundary level="section">
              {children}
            </ErrorBoundary>
          </main>
          
          <footer>
            <ErrorBoundary level="component">
              <Footer />
            </ErrorBoundary>
          </footer>
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

## Formatting Examples

```typescript
import { 
  formatDate, 
  formatCurrency, 
  formatBytes, 
  formatRelativeTime,
  formatTruncate 
} from '@/lib/formatters'

// In a product component
export function ProductCard({ product }) {
  return (
    <div>
      <h3>{formatTruncate(product.name, 30)}</h3>
      <p className="text-2xl font-bold">{formatCurrency(product.price)}</p>
      <p className="text-sm text-gray-500">Added {formatRelativeTime(product.createdAt)}</p>
      {product.fileSize && <p className="text-sm">{formatBytes(product.fileSize)}</p>}
    </div>
  )
}

// In an order history component
export function OrderHistory({ orders }) {
  return (
    <ul>
      {orders.map(order => (
        <li key={order.id}>
          <p className="font-semibold">{formatDate(order.date)}</p>
          <p className="text-gray-600">{formatCurrency(order.total)}</p>
        </li>
      ))}
    </ul>
  )
}
```

## Validation Examples

```typescript
import { validateEmail, validatePassword, validatePhoneNumber } from '@/lib/validators'

// In a contact form
const handleSubmit = (formData) => {
  if (!validateEmail(formData.email)) {
    setError('email', 'Invalid email')
    return
  }
  
  if (!validatePhoneNumber(formData.phone)) {
    setError('phone', 'Invalid phone number')
    return
  }
  
  // Submit form
}

// In a password change form
const handlePasswordChange = (newPassword, confirmPassword) => {
  if (!validatePassword(newPassword)) {
    setError('Password must be at least 8 chars with uppercase, lowercase, number, and special char')
    return
  }
  
  if (newPassword !== confirmPassword) {
    setError('Passwords do not match')
    return
  }
  
  // Update password
}
```

---

## Performance Checklist

- [ ] All images have width/height attributes
- [ ] Images below the fold use `lazyLoad={true}`
- [ ] Critical images use `priority={true}`
- [ ] All images have descriptive alt text
- [ ] Forms use validation to reduce server requests
- [ ] Heavy components are code-split with React.lazy
- [ ] Loading states use skeleton components
- [ ] Scroll handlers are throttled
- [ ] Error boundaries wrap major sections
- [ ] Menu state is managed with Zustand

---

## Accessibility Checklist

- [ ] All buttons/links have visible focus indicators
- [ ] Mobile menu is keyboard accessible
- [ ] Form labels are associated with inputs
- [ ] Error messages are associated with fields
- [ ] Images have descriptive alt text
- [ ] Color is not the only indicator
- [ ] Touch targets are at least 44x44px
- [ ] Focus order is logical
- [ ] Skip link is available
- [ ] ARIA attributes are used correctly
