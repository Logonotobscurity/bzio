# Project Structure

## Directory Organization

### `/src/app` - Next.js App Router
Application routes using Next.js 16 App Router with nested layouts:
- `about/` - Company information pages
- `account/` - Customer account dashboard
- `admin/` - Admin panel with sub-routes (_actions, _components, customers, dashboard, quotes)
- `api/` - API routes (auth, user, admin, products, quotes, forms, analytics)
- `auth/` - Authentication pages (login, register, verify-email)
- `checkout/` - Quote checkout flow
- `companies/` - Supplier/company listings
- `contact/` - Contact forms
- `products/` - Product catalog with brand/category filtering
- `guest-quote/` - Guest quote request flow

### `/src/components` - React Components
Organized by feature and UI type:
- `auth/` - Authentication components (WelcomeAlert, login forms)
- `banner/` - Marketing banners
- `emails/` - Email templates
- `forms/` - Form components
- `layout/` - Header, Footer, Navigation
- `products/` - Product cards, grids, filters
- `sections/` - Page sections (testimonials, CTAs)
- `ui/` - Shadcn/UI components (button, dialog, tabs, etc.)

### `/src/lib` - Core Libraries
Business logic and utilities:
- `auth/` - Authentication logic and NextAuth configuration
- `cache/` - Redis caching layer
- `config/` - Application configuration
- `constants/` - Shared constants
- `database/` - Database utilities
- `email/` - Email service (Resend integration)
- `monitoring/` - Performance monitoring
- `security/` - Security utilities
- `types/` - TypeScript type definitions
- `utils/` - Helper functions
- `validations/` - Zod schemas

### `/src/repositories` - Data Access Layer
Repository pattern for database operations:
- `address.repository.ts` - Address CRUD
- `admin-notification.repository.ts` - Admin notifications
- `analytics-event.repository.ts` - Analytics tracking
- `quote.repository.ts` - Quote management
- `user.repository.ts` - User operations

### `/src/services` - Business Logic Layer
Service layer for complex operations:
- `productService.ts` - Product operations
- `quoteService.ts` - Quote processing
- `enrichmentService.ts` - Data enrichment
- `analytics.service.ts` - Analytics processing
- `notification.service.ts` - Notification handling

### `/src/stores` - State Management
Zustand stores for client state:
- `activity.ts` - User activity tracking
- `authStore.ts` - Authentication state
- `cartStore.ts` - Shopping cart
- `quoteStore.ts` - Quote state
- `preferencesStore.ts` - User preferences

### `/src/hooks` - Custom React Hooks
Reusable hooks:
- `use-toast.ts` - Toast notifications
- `use-media-query.ts` - Responsive breakpoints
- `use-monitoring.ts` - Performance monitoring
- `useRealtime.ts` - WebSocket connections

### `/prisma` - Database Schema
- `schema.prisma` - Prisma schema with 30+ models
- `migrations/` - Database migrations
- `seeds/` - Seed data

### `/docs` - Documentation
Extensive documentation organized by phase:
- `01-getting-started/` - Setup guides
- `02-authentication/` - Auth documentation
- `03-admin-panel/` - Admin features
- `04-features/` - Feature documentation
- `05-deployment/` - Deployment guides

### `/scripts` - Utility Scripts
Admin and database management scripts:
- `create-admin-account.mjs` - Admin creation
- `seed-admin.ts` - Admin seeding
- `db-diagnostic.js` - Database diagnostics

## Core Components & Relationships

### Authentication Flow
```
middleware.ts → proxy.ts → auth.ts (NextAuth) → User model
```

### Data Flow Architecture
```
API Route → Service Layer → Repository Layer → Prisma → PostgreSQL
```

### Admin Dashboard
```
/admin/dashboard → AdminDashboard component → API routes → Services → Repositories
```

### Quote System
```
Cart → Quote Request → Admin Review → Negotiation → Conversion
```

## Architectural Patterns

### Repository Pattern
Abstracts database operations with dedicated repository classes for each entity.

### Service Layer
Business logic separated from API routes and repositories.

### Component Composition
Atomic design with UI components, feature components, and page layouts.

### Server/Client Separation
- Server Components for data fetching
- Client Components for interactivity
- API routes for mutations

### State Management Strategy
- Server state: React Query (TanStack Query)
- Client state: Zustand stores
- Form state: React Hook Form

### Caching Strategy
- Redis for session and data caching
- Next.js cache for static content
- Prisma Accelerate for query caching
