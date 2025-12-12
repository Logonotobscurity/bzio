# Project Structure

## Directory Organization

### `/src/app` - Next.js App Router Pages
Application routes using Next.js 15 App Router with server and client components:
- `about/` - Company information and mission
- `account/` - User dashboard with activity tracking
- `api/` - API routes for backend operations
- `careers/` - Job listings and applications
- `checkout/` - Quote checkout flow
- `companies/` - Supplier directory
- `compliance/` - Legal and compliance information
- `contact/` - Contact forms and support
- `customers/` - Customer success stories
- `dashboard/` - Admin dashboard (future)
- `faq/` - Frequently asked questions
- `login/` - Authentication pages
- `news/` - News and updates
- `products/` - Product catalog with categories and brands
- `resources/` - Educational content and guides
- `suppliers/` - Supplier management (redirects to companies)

### `/src/components` - React Components
Reusable UI components organized by feature:
- `ui/` - Base UI components (buttons, cards, dialogs, forms)
- `layout/` - Header, footer, navigation components
- `products/` - Product cards, grids, filters
- `sections/` - Page sections (hero, CTA, testimonials)
- `emails/` - Email templates for notifications
- Feature-specific components (quote forms, search bars, carousels)

### `/src/hooks` - Custom React Hooks
Reusable logic hooks:
- `use-form.ts` - Form state management with validation
- `use-intersection-observer.ts` - Viewport intersection detection
- `use-media-query.ts` - Responsive breakpoint detection
- `use-monitoring.ts` - Performance and error monitoring
- `use-scroll-lock.ts` - Body scroll control for modals
- `use-scroll-position.ts` - Scroll position tracking
- `use-toast.ts` - Toast notification management

### `/src/lib` - Core Libraries and Utilities
Business logic and shared utilities:
- `api/` - API client functions
- `cache/` - Caching strategies and utilities
- `config/` - Application configuration
- `data/` - Static data and mock data
- `db/` - Database client and connection
- `domain/` - Domain models and business logic
- `monitoring/` - Error tracking and analytics
- `store/` - Zustand state management stores
- `types/` - TypeScript type definitions
- `utils/` - Helper functions and utilities
- `validations/` - Zod schemas for data validation

### `/src/services` - Service Layer
Business logic services for data operations:
- `productService.ts` - Product CRUD and queries
- `authService.ts` - Authentication and authorization
- `quoteService.ts` - Quote management
- `searchService.ts` - Search functionality
- `analyticsService.ts` - Analytics tracking
- `notificationService.ts` - User notifications
- Additional services for brands, categories, news, resources

### `/src/repositories` - Data Access Layer
Database abstraction layer:
- `db/` - Prisma-based database repositories
- `static/` - Static data repositories
- `interfaces/` - Repository interface definitions

### `/src/stores` - State Management
Zustand stores for global state:
- `authStore.ts` - User authentication state
- `cartStore.ts` - Shopping cart (quote items)
- `quoteStore.ts` - Quote management state
- `activity.ts` - User activity tracking
- `menuStore.ts` - Navigation menu state
- `preferencesStore.ts` - User preferences
- `uiStore.ts` - UI state (modals, toasts)

### `/prisma` - Database Schema
- `schema.prisma` - Database models and relations
- `migrations/` - Database migration history
- `seeds/` - Seed data for development
- `seed.ts` - Seed script

### `/public` - Static Assets
- `images/products/` - Product images
- `favicon.svg`, `logo.svg` - Brand assets
- `manifest.json` - PWA manifest

### `/k8s` - Kubernetes Configuration
- `deployment.yaml` - Kubernetes deployment config
- `service.yaml` - Service definitions
- `ingress.yaml` - Ingress rules

## Core Components and Relationships

### Authentication Flow
`login/page.tsx` → `authService.ts` → `authStore.ts` → Protected routes

### Product Browsing Flow
`products/page.tsx` → `productService.ts` → `repositories/db/` → Prisma → PostgreSQL

### Quote Request Flow
`product-card.tsx` → `quoteStore.ts` → `checkout/page.tsx` → `quoteService.ts` → Database

### State Management Flow
Components → Zustand Stores → Services → Repositories → Database

## Architectural Patterns

### Layered Architecture
1. **Presentation Layer**: React components in `/src/components` and `/src/app`
2. **Service Layer**: Business logic in `/src/services`
3. **Data Access Layer**: Repositories in `/src/repositories`
4. **Database Layer**: Prisma ORM with PostgreSQL

### Design Patterns
- **Repository Pattern**: Abstraction over data access
- **Service Pattern**: Business logic encapsulation
- **Store Pattern**: Centralized state management with Zustand
- **Hook Pattern**: Reusable component logic
- **Component Composition**: Atomic design with shadcn/ui

### Data Flow
```
User Interaction → Component → Hook → Store → Service → Repository → Database
                                  ↓
                              Local State
```

### Key Relationships
- Products belong to Brands and Categories (many-to-many)
- Users have Addresses, Quotes, and Activity tracking
- Quotes contain QuoteLines and NegotiationMessages
- Products track Views, Favorites, and SearchQueries
