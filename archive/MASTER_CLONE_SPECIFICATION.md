# Pixel-Perfect Page Clone - Master Specification Prompt

## 🎯 MASTER CLONING REQUEST

```
I need a PIXEL-PERFECT clone of this page:landing page 

Create COMPLETE DETAILED SPECIFICATIONS for every section, including:

═══════════════════════════════════════════════════════════════
REQUIREMENTS
═══════════════════════════════════════════════════════════════
✓ Exact measurements (px, rem, spacing)
✓ Precise color codes (hex, rgb)
✓ Exact typography (font family, size, weight, line height, letter spacing)
✓ Layout grid specifications
✓ Component breakdown
✓ Responsive behavior at all breakpoints
✓ Hover states and interactions
✓ Animation timings and easings
✓ Z-index stacking
✓ Shadow specifications
✓ Border radius values
✓ Complete code for each section

Analyze the page section by section and provide implementable specifications.
```

---

## 📐 SECTION-BY-SECTION ANALYSIS PROMPT

```
Analyze this page and break it down SECTION BY SECTION with pixel-perfect details:

Page URL/Screenshot: [provide]

For EACH section, provide:

═══════════════════════════════════════════════════════════════
SECTION [NUMBER]: [SECTION NAME]
═══════════════════════════════════════════════════════════════

📏 DIMENSIONS & SPACING
────────────────────────────────────────────
- Section height: [px/vh/auto]
- Container max-width: [px]
- Padding top: [px/rem]
- Padding bottom: [px/rem]
- Padding left/right: [px/rem]
- Internal spacing between elements: [px/rem]
- Margin bottom: [px/rem]

🎨 BACKGROUND & VISUAL STYLE
────────────────────────────────────────────
- Background color: [#hex or rgb()]
- Background gradient: [if any, full CSS]
- Background image: [URL, size, position, repeat]
- Border: [width, style, color]
- Border radius: [px for each corner if different]
- Box shadow: [full CSS shadow values]
- Backdrop blur: [if any]
- Opacity: [if not 1]

📋 LAYOUT STRUCTURE
────────────────────────────────────────────
- Display type: [flex/grid/block]
- Flex/Grid properties:
  * Direction: [row/column]
  * Justify content: [value]
  * Align items: [value]
  * Gap: [px/rem]
  * Columns: [if grid, specify template]
  * Rows: [if grid, specify template]
- Z-index: [value if stacked]
- Position: [static/relative/absolute/fixed/sticky]

📝 CONTENT BREAKDOWN
────────────────────────────────────────────
List every element in order with exact specs:

ELEMENT 1: [Type - Heading/Text/Button/Image/etc.]
├─ Content: "[Exact text or description]"
├─ Font family: [name]
├─ Font size: [px/rem] Desktop, [px/rem] Mobile
├─ Font weight: [100-900]
├─ Line height: [value or ratio]
├─ Letter spacing: [px/em]
├─ Color: [#hex]
├─ Text transform: [none/uppercase/capitalize]
├─ Text align: [left/center/right]
├─ Margin: [top right bottom left]
├─ Padding: [top right bottom left]
├─ Max width: [px/% if constrained]
└─ Additional styles: [any other CSS]

ELEMENT 2: [Type]
[Same detailed breakdown]

[Continue for ALL elements]

🎭 INTERACTIVE STATES
────────────────────────────────────────────
For clickable/interactive elements:

DEFAULT STATE:
- All properties listed above

HOVER STATE:
- Changed properties: [list what changes]
- Transition: [duration, timing function]
- Transform: [scale, translate, etc.]
- Cursor: [pointer/default/etc.]

ACTIVE/PRESSED STATE:
- Changed properties: [list what changes]
- Transition: [if different from hover]

FOCUS STATE:
- Outline: [style]
- Ring: [if using focus ring]
- Changed properties: [list]

DISABLED STATE (if applicable):
- Opacity: [value]
- Cursor: [not-allowed]
- Color changes: [list]

🎬 ANIMATIONS & TRANSITIONS
────────────────────────────────────────────
- On scroll animations: [fade in, slide up, etc.]
- Trigger point: [% of viewport]
- Animation duration: [ms]
- Animation timing: [ease/ease-in/ease-out/cubic-bezier()]
- Animation delay: [ms]
- Transform origin: [if needed]
- Keyframes: [if custom animation needed]

📱 RESPONSIVE BEHAVIOR
────────────────────────────────────────────

DESKTOP (1440px+):
- [All measurements as specified above]

LAPTOP (1024px - 1439px):
- Changes from desktop: [list differences]

TABLET (768px - 1023px):
- Layout changes: [stack/reorder/hide]
- Font size adjustments: [list]
- Spacing adjustments: [list]
- Grid/Flex changes: [columns, direction]

MOBILE (320px - 767px):
- Layout: [usually single column]
- Font sizes: [reduced values]
- Spacing: [reduced values]
- Hidden elements: [list]
- Reordered elements: [list]
- Touch targets: [minimum 44x44px]

🔧 TECHNICAL IMPLEMENTATION
────────────────────────────────────────────

HTML STRUCTURE:
```html
<section class="[section-name]">
  <div class="container">
    <!-- Exact nested structure -->
  </div>
</section>
```

CSS/TAILWIND CLASSES:
[List every class needed]

COMPONENT CODE:
```tsx
// Complete, copy-paste ready component code
```

🎯 ASSETS REQUIRED
────────────────────────────────────────────
- Images: [dimensions, format, optimization]
- Icons: [source, size, color]
- Fonts: [Google Fonts link or file]
- SVGs: [list all needed]

✅ ACCESSIBILITY
────────────────────────────────────────────
- Semantic HTML: [section/article/nav/etc.]
- ARIA labels: [list]
- Heading hierarchy: [H1, H2, H3 structure]
- Alt text: [for all images]
- Focus order: [tab sequence]
- Color contrast ratio: [WCAG level]

═══════════════════════════════════════════════════════════════
END OF SECTION [NUMBER]
═══════════════════════════════════════════════════════════════

[REPEAT THIS ENTIRE FORMAT FOR EVERY SECTION ON THE PAGE]
```

---

## 🎨 COLOR EXTRACTION PROMPT

```
Extract ALL colors used on this page: [URL/Screenshot]

Provide a complete color palette with:

PRIMARY COLORS:
- Brand Primary: [#hex] rgb([r,g,b]) hsl([h,s,l])
  Used for: [buttons, links, accents]
  
- Brand Secondary: [#hex] rgb([r,g,b]) hsl([h,s,l])
  Used for: [secondary buttons, highlights]

NEUTRAL COLORS:
- Background: [#hex]
- Surface/Card: [#hex]
- Border: [#hex]
- Text Primary: [#hex]
- Text Secondary: [#hex]
- Text Muted: [#hex]
- Gray-50: [#hex]
- Gray-100: [#hex]
- Gray-200: [#hex]
[continue through Gray-900]

SEMANTIC COLORS:
- Success: [#hex] - Used for: [specific elements]
- Warning: [#hex] - Used for: [specific elements]
- Error: [#hex] - Used for: [specific elements]
- Info: [#hex] - Used for: [specific elements]

GRADIENTS:
- Gradient 1: [CSS gradient code]
  Used in: [sections]
- Gradient 2: [CSS gradient code]
  Used in: [sections]

SHADOWS:
- Shadow colors: [all rgba values]
- Shadow hierarchy: [sm, md, lg, xl specifications]

OVERLAY/TRANSPARENCY:
- Modal overlay: [rgba()]
- Hover overlays: [rgba()]
- Image overlays: [rgba()]

COLOR UTILITIES (for implementation):
```css
:root {
  --color-primary: [value];
  --color-secondary: [value];
  /* ... all colors as CSS variables */
}
```

Tailwind config:
```js
colors: {
  primary: '[hex]',
  secondary: '[hex]',
  // ... all colors
}
```
```

---

## 📝 TYPOGRAPHY EXTRACTION PROMPT

```
Extract COMPLETE typography system from: [URL/Screenshot]

Provide specifications for EVERY text element:

FONT FAMILIES:
────────────────────────────────────────────
- Primary font: [Name]
  * Google Fonts link: [URL]
  * Weights used: [300, 400, 600, 700, etc.]
  * Used for: [body text, paragraphs]
  
- Heading font: [Name]
  * Google Fonts link: [URL]
  * Weights used: [list]
  * Used for: [all headings]
  
- Monospace font: [if used]
  * Used for: [code blocks, etc.]

TYPE SCALE:
────────────────────────────────────────────

H1 (Main Page Title):
- Font size: [px] desktop / [px] mobile
- Font weight: [value]
- Line height: [value or ratio]
- Letter spacing: [px or em]
- Color: [#hex]
- Text transform: [if any]
- Margin bottom: [px]

H2 (Section Headings):
- Font size: [px] desktop / [px] mobile
- Font weight: [value]
- Line height: [value or ratio]
- Letter spacing: [px or em]
- Color: [#hex]
- Text transform: [if any]
- Margin bottom: [px]

H3 (Sub-headings):
- Font size: [px] desktop / [px] mobile
- Font weight: [value]
- Line height: [value or ratio]
- Letter spacing: [px or em]
- Color: [#hex]
- Text transform: [if any]
- Margin bottom: [px]

H4, H5, H6:
[Same format for each]

BODY TEXT:
- Large body: [full specs]
- Regular body: [full specs]
- Small body: [full specs]
- Caption/Fine print: [full specs]

BUTTON TEXT:
- Primary button: [full specs]
- Secondary button: [full specs]
- Text link: [full specs]

SPECIALIZED TEXT:
- Navigation links: [full specs]
- Footer text: [full specs]
- Form labels: [full specs]
- Form input text: [full specs]
- Placeholder text: [full specs]
- Error messages: [full specs]

IMPLEMENTATION:
────────────────────────────────────────────

CSS:
```css
/* Exact CSS for each text style */
.heading-1 {
  font-family: 'Font Name', sans-serif;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #1a1a1a;
}
/* ... all styles */
```

Tailwind Config:
```js
fontSize: {
  'h1': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
  // ... all sizes
}
```
```

---

## 📐 SPACING & LAYOUT SYSTEM PROMPT

```
Extract the COMPLETE spacing and layout system from: [URL/Screenshot]

Analyze and provide:

SPACING SCALE:
────────────────────────────────────────────
Document every spacing value used:
- 4px (0.25rem) - Used for: [list]
- 8px (0.5rem) - Used for: [list]
- 12px (0.75rem) - Used for: [list]
- 16px (1rem) - Used for: [list]
- 24px (1.5rem) - Used for: [list]
- 32px (2rem) - Used for: [list]
- 48px (3rem) - Used for: [list]
- 64px (4rem) - Used for: [list]
- 96px (6rem) - Used for: [list]
- 128px (8rem) - Used for: [list]

CONTAINER WIDTHS:
────────────────────────────────────────────
- Max content width: [px]
- Mobile container padding: [px]
- Tablet container padding: [px]
- Desktop container padding: [px]

SECTION SPACING:
────────────────────────────────────────────
For each section:
- Padding top: [px]
- Padding bottom: [px]
- Gap between sections: [px]

GRID SYSTEM:
────────────────────────────────────────────
- Number of columns: [12/16/etc.]
- Gutter width: [px]
- Column width calculation: [formula]
- Breakpoint behavior: [how grid adapts]

COMPONENT SPACING:
────────────────────────────────────────────

Cards:
- Internal padding: [px]
- Gap between cards: [px]
- Border width: [px]

Buttons:
- Padding horizontal: [px]
- Padding vertical: [px]
- Gap between buttons: [px]
- Icon spacing: [px]

Forms:
- Field spacing: [px]
- Label to input gap: [px]
- Input padding: [px]

Navigation:
- Item spacing: [px]
- Vertical padding: [px]

IMPLEMENTATION:
```css
/* CSS Variables */
:root {
  --spacing-1: 4px;
  --spacing-2: 8px;
  /* ... all spacing */
}
```

```js
// Tailwind Config
spacing: {
  '1': '4px',
  '2': '8px',
  // ... all spacing
}
```
```

---

## 🎭 COMPONENT LIBRARY EXTRACTION PROMPT

```
Extract ALL reusable components from: [URL/Screenshot]

For EACH component type, provide complete specifications:

═══════════════════════════════════════════════════════════════
COMPONENT: [Name - e.g., "Primary Button"]
═══════════════════════════════════════════════════════════════

VISUAL SPECIFICATIONS:
────────────────────────────────────────────
- Width: [auto/px/%]
- Height: [px]
- Padding: [top] [right] [bottom] [left]
- Border: [width style color]
- Border radius: [px]
- Background: [color/gradient]
- Box shadow: [CSS shadow]
- Font size: [px]
- Font weight: [value]
- Color: [#hex]
- Text transform: [if any]

VARIANTS:
────────────────────────────────────────────

Default/Primary:
- Background: [#hex]
- Text color: [#hex]
- Border: [spec]
- Shadow: [spec]

Secondary/Outline:
- Background: [transparent/color]
- Text color: [#hex]
- Border: [spec]
- Shadow: [spec]

Ghost/Text:
- Background: [transparent]
- Text color: [#hex]
- No border
- No shadow

Destructive/Danger:
- Background: [#hex]
- Text color: [#hex]
- Border: [spec]

SIZES:
────────────────────────────────────────────

Small:
- Height: [px]
- Padding: [spec]
- Font size: [px]

Medium (Default):
- Height: [px]
- Padding: [spec]
- Font size: [px]

Large:
- Height: [px]
- Padding: [spec]
- Font size: [px]

STATES:
────────────────────────────────────────────

Hover:
- Background: [changes to]
- Transform: [if any]
- Shadow: [if changes]
- Transition: [duration easing]

Active/Pressed:
- Background: [changes to]
- Transform: [if any]
- Box shadow: [if changes]

Focus:
- Outline: [spec]
- Ring: [if using focus ring]
- Offset: [px]

Disabled:
- Opacity: [value]
- Cursor: not-allowed
- Background: [if different]
- Color: [if different]

Loading:
- Spinner: [position, size, color]
- Text: [hidden/visible]
- Pointer events: none

IMPLEMENTATION:
────────────────────────────────────────────

React Component:
```tsx
// Complete component code with all variants and states
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes {
  variant?: 'default' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC = ({ 
  variant = 'default',
  size = 'md',
  isLoading = false,
  className,
  children,
  ...props 
}) => {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        
        // Variants
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
          'border border-input bg-background hover:bg-accent': variant === 'secondary',
          'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
          'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
        },
        
        // Sizes
        {
          'h-9 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-base': size === 'md',
          'h-11 px-8 text-lg': size === 'lg',
        },
        
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading && '⏳'}
      {children}
    </button>
  );
};
```

CSS Only:
```css
/* Complete CSS for all variants and states */
.btn {
  /* Base styles */
}

.btn-primary {
  /* Primary variant */
}

.btn-primary:hover {
  /* Hover state */
}
/* ... all combinations */
```

USAGE EXAMPLES:
```tsx
<Button>Click Me</Button>
<Button variant="secondary">Secondary</Button>
<Button isLoading>Loading...</Button>
```

═══════════════════════════════════════════════════════════════
[REPEAT FOR ALL COMPONENTS: Cards, Inputs, Modals, Navigation, etc.]
═══════════════════════════════════════════════════════════════
```

---

## 📸 VISUAL INSPECTION CHECKLIST PROMPT

```
Perform a DETAILED VISUAL INSPECTION of: [URL/Screenshot]

Use browser DevTools to extract exact values:

INSPECTION CHECKLIST:
═══════════════════════════════════════════════════════════════

✓ Open browser DevTools (F12)
✓ Use Inspect Element on each section
✓ Record computed styles for each element
✓ Measure exact pixel distances
✓ Extract all color values
✓ Document all font properties
✓ Note all spacing values
✓ Capture hover states
✓ Check responsive breakpoints
✓ Screenshot each section for reference

FOR EACH ELEMENT, EXTRACT FROM DEVTOOLS:
────────────────────────────────────────────

Right-click element → Inspect → Computed tab:

Box Model:
- Margin: [top right bottom left]
- Border: [top right bottom left]
- Padding: [top right bottom left]
- Width: [px]
- Height: [px]

Typography:
- font-family: "[exact value]"
- font-size: [px]
- font-weight: [value]
- line-height: [px or ratio]
- letter-spacing: [px]
- text-transform: [value]
- color: rgb([r, g, b])

Layout:
- display: [value]
- position: [value]
- top/right/bottom/left: [if positioned]
- z-index: [value]
- flex/grid properties: [all values]

Visual:
- background-color: rgb([r, g, b])
- background-image: [if any]
- border: [all values]
- border-radius: [px]
- box-shadow: [all values]
- opacity: [value]
- transform: [if any]

MEASUREMENTS TO TAKE:
────────────────────────────────────────────
Use DevTools ruler/measurement tools:
- Section heights: [px]
- Element widths: [px]
- Gaps between elements: [px]
- Icon sizes: [px]
- Image dimensions: [px]
- Button sizes: [px]
- Input field heights: [px]

BREAKPOINT TESTING:
────────────────────────────────────────────
Test and document at each breakpoint:
- 320px (Mobile S)
- 375px (Mobile M)
- 425px (Mobile L)
- 768px (Tablet)
- 1024px (Laptop)
- 1440px (Desktop)
- 1920px (Desktop L)

For each breakpoint, note:
- Layout changes
- Font size changes
- Spacing adjustments
- Hidden/shown elements
- Stacking order changes

EXPORT FORMAT:
────────────────────────────────────────────
Provide all data in structured format:

```json
{
  "section_name": {
    "container": {
      "maxWidth": "1200px",
      "padding": "0 24px"
    },
    "elements": [
      {
        "type": "heading",
        "tag": "h1",
        "fontSize": "48px",
        "fontWeight": "700",
        "lineHeight": "1.2",
        "color": "#1a1a1a",
        "marginBottom": "24px"
      }
    ]
  }
}
```
```

---

## 🎯 COMPLETE PAGE CLONE - MASTER PROMPT

```
I need a COMPLETE, PIXEL-PERFECT clone of this page:

URL/Screenshot: [provide]

Target Framework: [React/Next.js/Vue/HTML]
Styling Method: [Tailwind/CSS Modules/Styled Components]

Provide COMPREHENSIVE DOCUMENTATION including:

═══════════════════════════════════════════════════════════════
1. PAGE OVERVIEW
═══════════════════════════════════════════════════════════════
- Total sections: [number]
- Page type: [Landing/Dashboard/etc.]
- Key features: [list]
- Design style: [Modern/Minimalist/etc.]
- Color scheme: [Light/Dark/Mixed]

═══════════════════════════════════════════════════════════════
2. COMPLETE COLOR PALETTE
═══════════════════════════════════════════════════════════════
[All colors as specified in Color Extraction Prompt above]

═══════════════════════════════════════════════════════════════
3. COMPLETE TYPOGRAPHY SYSTEM
═══════════════════════════════════════════════════════════════
[All typography as specified in Typography Prompt above]

═══════════════════════════════════════════════════════════════
4. SPACING & LAYOUT SYSTEM
═══════════════════════════════════════════════════════════════
[All spacing as specified in Spacing Prompt above]

═══════════════════════════════════════════════════════════════
5. SECTION-BY-SECTION BREAKDOWN
═══════════════════════════════════════════════════════════════

[FOR EACH SECTION - Use Section Analysis Format above]

SECTION 1: [Name]
[Complete specifications]
[Complete code]

SECTION 2: [Name]
[Complete specifications]
[Complete code]

[Continue for ALL sections]

═══════════════════════════════════════════════════════════════
6. COMPONENT LIBRARY
═══════════════════════════════════════════════════════════════
[All reusable components with complete specs and code]

═══════════════════════════════════════════════════════════════
7. COMPLETE PAGE CODE
═══════════════════════════════════════════════════════════════

File Structure:
\`\`\`
/components
  /ui
    - button.tsx
    - card.tsx
    - input.tsx
    [all components]
  /sections
    - hero.tsx
    - features.tsx
    - cta.tsx
    [all sections]
/app
  - page.tsx
  - layout.tsx
  - globals.css
/lib
  - utils.ts
\`\`\`

Main Page Component:
```tsx
// app/page.tsx
// Complete, production-ready code
```

All Section Components:
```tsx
// components/sections/[section-name].tsx
// Complete code for each
```

All UI Components:
```tsx
// components/ui/[component-name].tsx
// Complete code for each
```

Global Styles:
```css
/* app/globals.css */
/* All global styles and CSS variables */
```

Tailwind Config (if using):
```js
// tailwind.config.js
// Complete configuration with all customizations
```

═══════════════════════════════════════════════════════════════
8. RESPONSIVE BEHAVIOR MATRIX
═══════════════════════════════════════════════════════════════

| Element/Section | Mobile (320-767) | Tablet (768-1023) | Desktop (1024+) |
|----------------|------------------|-------------------|-----------------|
| Hero Height    | [value]          | [value]           | [value]         |
| H1 Font Size   | [value]          | [value]           | [value]         |
| Grid Columns   | [value]          | [value]           | [value]         |
[Complete table for all elements]

═══════════════════════════════════════════════════════════════
9. ASSETS REQUIRED
═══════════════════════════════════════════════════════════════
Images:
- hero-image.jpg (1920x1080, optimized)
- logo.svg (vector, exported)
- [all other images with specs]

Icons:
- Source: [Lucide/Heroicons/Font Awesome]
- Icons needed: [list all with names]

Fonts:
- Google Fonts: [exact URL to embed]
- or Font Files: [list all with weights]

═══════════════════════════════════════════════════════════════
10. IMPLEMENTATION CHECKLIST
═══════════════════════════════════════════════════════════════
Installation:
\`\`\`bash
# Commands to set up project
npx create-next-app@latest project-name
cd project-name
npm install [all dependencies]
\`\`\`

Setup Steps:
[ ] Create file structure
[ ] Add all components
[ ] Add all sections
[ ] Configure Tailwind/styling
[ ] Add global styles
[ ] Import fonts
[ ] Add images to public folder
[ ] Test responsive breakpoints
[ ] Test all interactions
[ ] Verify accessibility
[ ] Optimize performance
[ ] Deploy

═══════════════════════════════════════════════════════════════
11. TESTING & VERIFICATION
═══════════════════════════════════════════════════════════════
Visual Comparison:
[ ] Side-by-side screenshot comparison
[ ] Pixel-perfect overlay test
[ ] Color accuracy check
[ ] Typography matching
[ ] Spacing verification

Responsive Testing:
[ ] Test at all breakpoints
[ ] Verify no horizontal scroll
[ ] Check touch targets (44x44px minimum)
[ ] Test on actual devices

Interaction Testing:
[ ] All hover states work
[ ] All animations smooth
[ ] All links/buttons functional
[ ] Forms validate correctly

Performance:
[ ] Lighthouse score > 90
[ ] Images optimized
[ ] No layout shift
[ ] Fast load time

Accessibility:
[ ] WCAG 2.1 AA compliant
[ ] Keyboard navigation works
[ ] Screen reader tested
[ ] Color contrast passing

═══════════════════════════════════════════════════════════════
END OF COMPLETE SPECIFICATION
═══════════════════════════════════════════════════════════════

DELIVERABLES:
✓ Complete specifications document
✓ All component code files
✓ All section code files
✓ Main page file
✓ Configuration files
✓ Asset list with specifications
✓ Implementation guide
✓ Testing checklist

This should be PRODUCTION-READY code that creates an exact clone.
```

---

## 🚀 QUICK CLONE PROMPT (Streamlined)

For faster results, use this condensed version:

```
Clone this page pixel-perfect: [URL]

Framework: [Next.js/React]
Styling: [Tailwind CSS]

For each section provide:
1. Screenshot analysis
2. Exact measurements (spacing, sizes, colors)
3. Complete component code
4. Responsive breakpoints
5. Hover/interaction states

Deliver as:
- Design tokens (colors, typography, spacing)
- Component library (buttons, cards, inputs)
- Section components (hero, features, CTA)
- Main page file (assembling everything)
- Tailwind config
- Implementation steps

Make it production-ready and pixel-perfect.
```

---

## 💡 USAGE TIPS

1. **Provide Clear Reference**: High-res screenshot or live URL
2. **Specify Framework**: React, Vue, HTML, etc.
3. **Choose Styling Method**: Tailwind, CSS, Styled Components
4. **Request Specific Sections**: Can clone just one section at a time
5. **Iterate**: Start with overview, then drill into details
6. **Save Specifications**: Export to .txt for reference
7. **Use DevTools**: Extract exact values from inspected elements
8. **Test at Breakpoints**: Verify responsive behavior
9. **Compare Side-by-Side**: Place original and clone next to each other
10. **Measure Differences**: Use overlay tools to verify pixel accuracy

---

## 📦 EXPORT FORMAT FOR SHARING

When you receive the specifications, save as:

```
pixel_perfect_clone_[page_name]_[date].txt

Contents:
- Complete specifications
- All component code
- All section code
- Configuration files
- Asset requirements
- Implementation guide
```

This becomes your single source of truth for implementation!
