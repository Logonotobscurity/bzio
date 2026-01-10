# BZION Responsive Design System

## Overview

This document outlines the responsive design patterns applied to the BZION website, based on modern CSS fluid typography and responsive layout techniques. The system uses CSS `clamp()` for smooth scaling without breakpoints, responsive grid/flexbox layouts, and proportional spacing.

---

## Core Principles

### 1. **Fluid Typography with `clamp()`**

All typography scales smoothly based on viewport width without media queries.

**Formula:** `clamp(min, preferred, max)`
- **Min:** Minimum size on mobile
- **Preferred:** Scale value (percentage of viewport)
- **Max:** Maximum size on desktop

#### Typography Scales:

```css
/* Headings */
h1: clamp(2rem, 5vw + 1rem, 4.5rem)        /* 32px → 72px */
h2: clamp(1.75rem, 3.5vw + 0.75rem, 3.5rem) /* 28px → 56px */
h3: clamp(1.5rem, 2.5vw + 0.5rem, 2.5rem)   /* 24px → 40px */
h4: clamp(1.125rem, 1.5vw + 0.5rem, 1.75rem) /* 18px → 28px */

/* Body Text */
body: clamp(1rem, 0.5vw + 0.875rem, 1.125rem) /* 16px → 18px */
small: clamp(0.875rem, 0.25vw + 0.75rem, 1.0625rem) /* 14px → 17px */
nav: clamp(0.875rem, 0.5vw + 0.75rem, 1rem) /* 14px → 16px */
```

**Benefits:**
- ✅ No breakpoints needed for typography
- ✅ Smooth transitions across all screen sizes
- ✅ Better readability at every size
- ✅ Reduced CSS complexity

---

## 2. **Responsive Spacing System**

All spacing uses CSS custom properties with `clamp()` for proportional scaling.

### Spacing Variables:

```css
/* Section Vertical Spacing */
--section-spacing-xs:  clamp(2rem, 4vw, 3.5rem)     /* 32px → 56px */
--section-spacing-sm:  clamp(3rem, 6vw, 5rem)       /* 48px → 80px */
--section-spacing-md:  clamp(4rem, 8vw, 6.5rem)     /* 64px → 104px */
--section-spacing-lg:  clamp(5rem, 10vw, 8rem)      /* 80px → 128px */
--section-spacing-xl:  clamp(6rem, 12vw, 10rem)     /* 96px → 160px */

/* Grid Gap (Horizontal) */
--gap-xxs: clamp(0.5rem, 1vw, 0.75rem)     /* 8px → 12px */
--gap-xs:  clamp(0.75rem, 1.5vw, 1.25rem)  /* 12px → 20px */
--gap-sm:  clamp(1rem, 2vw, 1.5rem)        /* 16px → 24px */
--gap-md:  clamp(1.5rem, 3vw, 2.5rem)      /* 24px → 40px */
--gap-lg:  clamp(2rem, 4vw, 3.5rem)        /* 32px → 56px */
--gap-xl:  clamp(3rem, 6vw, 5rem)          /* 48px → 80px */

/* Container Padding */
--container-padding-x: clamp(1rem, 4vw, 3.5rem)  /* 16px → 56px */

/* Navbar */
--navbar-padding-block: clamp(0.75rem, 2vw, 1.25rem)  /* 12px → 20px */
--navbar-padding-inline: clamp(1rem, 5vw, 4rem)       /* 16px → 64px */
--navbar-gap: clamp(0.75rem, 2vw, 2rem)               /* 12px → 32px */

/* Card Styling */
--card-padding: clamp(1.5rem, 3vw, 2.5rem)   /* 24px → 40px */
--card-gap: clamp(1rem, 2vw, 1.5rem)         /* 16px → 24px */
```

### Usage:

```tsx
/* Section padding */
<section className="py-section-lg px-container-px">
  {/* content */}
</section>

/* Grid gap */
<div className="grid gap-gap-md">
  {/* items */}
</div>

/* Navbar spacing */
<header className="px-[var(--navbar-padding-inline)] py-[var(--navbar-padding-block)]">
  {/* nav items */}
</header>
```

---

## 3. **Responsive Grid Layouts**

### Auto-Responsive Grid (No Breakpoints)

Uses CSS Grid with `auto-fit` and `minmax()` to automatically adjust columns based on available space.

#### Grid Classes:

```tsx
/* Default: 3-column on desktop, 1 on mobile */
<div className="grid-auto-responsive">
  {/* items auto-flow into columns */}
</div>

/* 2-column: Larger items (280px min) */
<div className="grid-auto-fit-2">
  {/* items */}
</div>

/* 3-column: Medium items (250px min) */
<div className="grid-auto-fit-3">
  {/* items */}
</div>

/* 4-column: Smaller items (200px min) */
<div className="grid-auto-fit-4">
  {/* items */}
</div>
```

#### Example Implementation:

```tsx
// Before (with breakpoints)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">

// After (responsive without breakpoints)
<div className="grid-auto-responsive gap-gap-md">
  {items.map(item => <Card key={item.id} item={item} />)}
</div>
```

**How It Works:**
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
gap: var(--gap-md);
```

- **`auto-fit`**: Automatically fits as many columns as will fit
- **`minmax(min(300px, 100%), 1fr)`**: Min 300px per item, but never wider than 100%
- **`1fr`**: Remaining space distributed equally
- **Result**: 1 column on mobile, 2 on tablet, 3+ on desktop—automatically!

---

## 4. **Responsive Flexbox Layouts**

### Auto-Wrapping Flex (No Breakpoints)

```tsx
/* Default: wraps with large gap */
<div className="flex-auto-wrap">
  {/* items wrap naturally */}
</div>

/* Smaller gap variant */
<div className="flex-auto-wrap-sm">
  {/* items wrap with smaller gap */}
</div>
```

#### Flex Item Sizing:

```tsx
/* Standard: 350px min */
<div className="flex-item">
  {/* grows/shrinks with min 350px */}
</div>

/* Smaller: 280px min */
<div className="flex-item-sm">
  {/* compact variant */}
</div>

/* Larger: 400px min */
<div className="flex-item-lg">
  {/* spacious variant */}
</div>
```

**CSS:**
```css
flex: 1 1 min(350px, 100%);  /* grow, shrink, min 350px or 100% */
```

---

## 5. **Full-Width Sections with Proportional Padding**

Unlike traditional centered containers, BZION sections use full width with responsive padding.

```tsx
<section className="w-full px-container-px py-section-lg bg-primary">
  <div className="container-full">
    {/* content always respects left/right padding */}
  </div>
</section>
```

**Benefits:**
- ✅ Full-width backgrounds (color/gradients reach edges)
- ✅ Content never touches screen edges
- ✅ Responsive padding scales with viewport
- ✅ No arbitrary max-width breakpoints

---

## 6. **Navbar & Header Scaling**

Header uses responsive padding and gap to scale smoothly.

```tsx
<header className="px-[var(--navbar-padding-inline)] py-[var(--navbar-padding-block)]">
  <div className="flex items-center gap-[var(--navbar-gap)]">
    <Logo className="flex-shrink-0" />
    <nav className="flex gap-[var(--nav-link-spacing)]">
      {/* nav items */}
    </nav>
  </div>
</header>
```

**Values:**
```
Mobile (320px):     padding: 16px 1rem, gap: 12px
Tablet (768px):     padding: 16px 2rem, gap: 18px
Desktop (1440px):   padding: 20px 4rem, gap: 32px
```

---

## 7. **Card & Component Styling**

### Responsive Card:

```tsx
<div className="card-responsive">
  <h3 className="text-h3 font-bold">{title}</h3>
  <p className="text-fluid-body">{description}</p>
</div>
```

**CSS:**
```css
.card-responsive {
  padding: var(--card-padding);           /* 24px → 40px */
  border-radius: var(--radius-lg);        /* 12px → 24px */
  transition: all 0.3s ease;
}

.card-responsive:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}
```

---

## 8. **Practical Examples**

### Example 1: Product Grid

```tsx
export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <section className="section-padding-lg">
      <div className="container-full">
        <h2 className="text-h2 mb-section-md">Our Products</h2>
        <div className="grid-auto-responsive">
          {products.map(product => (
            <div key={product.id} className="card-responsive">
              <img src={product.image} alt={product.name} />
              <h3 className="text-h3 mt-gap-md">{product.name}</h3>
              <p className="text-fluid-body text-muted-foreground">
                {product.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Behavior:**
- Mobile (320px): 1 column, 16px padding, 24px gap
- Tablet (768px): 2 columns, 32px padding, 32px gap
- Desktop (1440px): 3 columns, 56px padding, 40px gap
- **No CSS media queries needed!**

### Example 2: Two-Column Layout with Image

```tsx
<section className="section-padding-lg">
  <div className="container-full">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-section-md">
      {/* Text column */}
      <div className="flex flex-col justify-center">
        <h2 className="text-h2 mb-gap-md">Why Choose Us?</h2>
        <p className="text-fluid-body-lg mb-gap-md text-muted-foreground">
          Our responsive design system ensures consistency across all devices.
        </p>
        <ul className="space-y-gap-sm">
          {features.map(feature => (
            <li key={feature} className="flex items-start gap-gap-sm">
              <CheckIcon className="text-secondary flex-shrink-0" />
              <span className="text-fluid-body">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Image column */}
      <div className="relative h-96 w-full overflow-hidden rounded-lg">
        <Image
          src={imageUrl}
          alt="Why BZION"
          fill
          className="object-cover"
        />
      </div>
    </div>
  </div>
</section>
```

### Example 3: Feature Cards Row

```tsx
<section className="section-padding-md">
  <div className="container-full">
    <h2 className="text-h2 text-center mb-section-lg">Features</h2>
    <div className="flex-auto-wrap gap-gap-lg">
      {features.map(feature => (
        <div
          key={feature.id}
          className="flex-item card-responsive"
        >
          <feature.Icon className="h-8 w-8 text-secondary mb-gap-md" />
          <h3 className="text-h4 font-bold mb-gap-xs">{feature.title}</h3>
          <p className="text-fluid-body text-muted-foreground">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>
```

**Behavior:**
- Mobile: Stacks to 1 column, full width items
- Tablet: Wraps to 2 columns naturally
- Desktop: Wraps to 3+ columns as space allows
- **Automatically responsive without breakpoints!**

---

## 9. **Migration Guide**

### Converting Existing Components

#### Old Approach (with breakpoints):
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 px-4 md:px-8 lg:px-12 py-8 md:py-12 lg:py-16">
```

#### New Approach (fluid):
```tsx
<div className="grid-auto-responsive gap-gap-md px-container-px py-section-md">
```

### CSS Variables in Your Components:

```tsx
// Instead of hardcoded padding
<div className="p-4 md:p-6 lg:p-8">

// Use CSS variables
<div className="p-[var(--card-padding)]">

// Or Tailwind utilities
<div className="px-container-px py-section-lg">
```

---

## 10. **Browser Support**

- ✅ `clamp()`: Modern browsers (Chrome 79+, Firefox 75+, Safari 13.1+)
- ✅ `auto-fit`: All modern browsers
- ✅ CSS custom properties: All modern browsers (IE 11 not supported)

**Fallback for older browsers:**
- Uses fixed values if `clamp()` not supported
- Progressive enhancement recommended

---

## 11. **Performance Benefits**

1. **Reduced CSS**: No media queries for typography or spacing
2. **Smaller bundle**: Fewer utility classes needed
3. **Better performance**: Less CSS parsing needed
4. **Smooth animations**: No jarring jumps at breakpoints
5. **Accessibility**: Always readable at any size

---

## 12. **Testing Responsive Layouts**

### Test Sizes:
- **Mobile**: 320px (iPhone SE), 375px (iPhone), 414px (iPhone Plus)
- **Tablet**: 600px, 768px (iPad), 1024px (iPad Pro)
- **Desktop**: 1440px, 1920px, 2560px (4K)

### Browser DevTools:
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Use responsive mode to test all sizes
4. Watch typography and spacing scale smoothly

---

## 13. **CSS Variables Reference**

Access all responsive variables in your components:

```css
/* Spacing */
var(--section-spacing-xs)    /* 2rem → 3.5rem */
var(--section-spacing-sm)    /* 3rem → 5rem */
var(--section-spacing-md)    /* 4rem → 6.5rem */
var(--section-spacing-lg)    /* 5rem → 8rem */
var(--section-spacing-xl)    /* 6rem → 10rem */

/* Gaps */
var(--gap-xxs)   /* 0.5rem → 0.75rem */
var(--gap-xs)    /* 0.75rem → 1.25rem */
var(--gap-sm)    /* 1rem → 1.5rem */
var(--gap-md)    /* 1.5rem → 2.5rem */
var(--gap-lg)    /* 2rem → 3.5rem */
var(--gap-xl)    /* 3rem → 5rem */

/* Container */
var(--container-padding-x)   /* 1rem → 3.5rem */

/* Navbar */
var(--navbar-padding-block)  /* 0.75rem → 1.25rem */
var(--navbar-padding-inline) /* 1rem → 4rem */
var(--navbar-gap)            /* 0.75rem → 2rem */

/* Cards */
var(--card-padding)          /* 1.5rem → 2.5rem */
var(--card-gap)              /* 1rem → 1.5rem */
```

---

## 14. **Best Practices**

### DO:
✅ Use `grid-auto-responsive` for product/card grids
✅ Use `flex-auto-wrap` for flexible layouts
✅ Use CSS variables for all spacing/sizing
✅ Use `clamp()` for typography
✅ Test at multiple viewport sizes
✅ Use `container-full` with full-width sections

### DON'T:
❌ Avoid fixed pixel sizes (use `clamp()` instead)
❌ Avoid media queries for spacing/typography
❌ Avoid hardcoded breakpoints (480px, 768px, etc.)
❌ Avoid arbitrary padding/gaps (use CSS variables)
❌ Avoid `max-width` containers (use full-width + padding)

---

## 15. **Advanced: Creating Custom Clamp Values**

For specific components needing custom scaling:

```css
/* Custom clamp for specific element */
.custom-spacing {
  padding: clamp(1.5rem, 3vw, 3rem);  /* min, preferred, max */
  font-size: clamp(1.125rem, 1.5vw + 0.75rem, 1.5rem);
  gap: clamp(0.75rem, 1.5vw, 1.5rem);
}
```

**Formula for custom clamp:**
- `min`: Smallest acceptable value
- `preferred`: `X%vw + Ypx` (X% of viewport width + Y pixels)
- `max`: Largest acceptable value

---

## Summary

The BZION Responsive Design System provides:

1. **Fluid Typography** - Scales smoothly without breakpoints
2. **Proportional Spacing** - Responsive gaps and padding
3. **Auto-Responsive Grids** - Adapts columns automatically
4. **Flexible Layouts** - Components that flow naturally
5. **Full-Width Sections** - With responsive internal padding
6. **CSS Variables** - Centralized, consistent spacing
7. **Better Performance** - Smaller CSS, fewer rules
8. **Improved UX** - Smooth transitions, always readable

This system maintains your visual design while making responsive implementation cleaner, more maintainable, and more performant across all devices.

---

**For questions or updates:** Update this document when adding new CSS variables or layout patterns.
