# Technology Stack

## Core Technologies

### Frontend Framework
- **Next.js 16.0.8** - React framework with App Router
- **React 19.2.1** - UI library
- **TypeScript 5.9.3** - Type safety

### Backend & API
- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js 4.24.7** - Authentication
- **Prisma 7.1.0** - ORM and database toolkit

### Database
- **PostgreSQL** - Primary database
- **Prisma Client** - Type-safe database client
- **Prisma Accelerate** - Query caching and connection pooling

### Styling & UI
- **Tailwind CSS 3.4.1** - Utility-first CSS
- **Shadcn/UI** - Component library built on Radix UI
- **Radix UI** - Headless UI primitives
- **Framer Motion 11.5.7** - Animation library
- **Lucide React** - Icon library

### State Management
- **Zustand 4.5.4** - Client state management
- **TanStack Query 5.45.0** - Server state management
- **React Hook Form 7.54.2** - Form state

### Validation & Schema
- **Zod 3.24.2** - Schema validation
- **@hookform/resolvers** - Form validation integration

### Email Services
- **Resend 6.6.0** - Email delivery
- **Nodemailer 7.0.11** - Email sending
- **React Email** - Email templates

### Caching & Performance
- **Redis 5.10.0** - In-memory caching
- **Upstash Redis** - Serverless Redis
- **Upstash Ratelimit** - API rate limiting

### Real-time Features
- **Socket.io 4.7.2** - WebSocket server
- **Socket.io Client 4.7.2** - WebSocket client

### AI Integration
- **Genkit 1.20.0** - AI framework
- **@genkit-ai/google-genai** - Google AI integration

### Testing
- **Jest 30.2.0** - Testing framework
- **Testing Library** - React component testing
- **@testing-library/jest-dom** - DOM matchers

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript linting
- **Husky** - Git hooks
- **tsx** - TypeScript execution
- **ts-node** - TypeScript runtime

### Security
- **bcryptjs 3.0.3** - Password hashing
- **sanitize-html 2.17.0** - HTML sanitization
- **Rate limiting** - API protection

### Utilities
- **date-fns 3.6.0** - Date manipulation
- **axios 1.13.2** - HTTP client
- **clsx** - Conditional classnames
- **class-variance-authority** - Component variants

### Carousel & Media
- **embla-carousel-react 8.6.0** - Carousel component
- **embla-carousel-autoplay** - Autoplay plugin

### Charts & Visualization
- **Recharts 2.15.1** - Chart library

## Build Configuration

### Next.js Configuration
```javascript
// next.config.js
- Image optimization with multiple remote patterns
- Security headers (X-Frame-Options, CSP, etc.)
- Redirects for legacy routes
- AVIF/WebP image formats
- Experimental: authInterrupts
```

### TypeScript Configuration
```json
// tsconfig.json
- Strict mode enabled
- Path aliases (@/ for src/)
- ES2022 target
- Module: ESNext
```

### Prisma Configuration
```prisma
// schema.prisma
- Provider: PostgreSQL
- Preview features: fullTextSearchPostgres
- 30+ models with relations
```

### Tailwind Configuration
```typescript
// tailwind.config.ts
- Custom color scheme
- Extended animations
- Custom utilities
- Dark mode support
```

## Development Commands

### Core Commands
```bash
npm run dev          # Start development server (port 3000)
npm run build        # Production build with Prisma generation
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
npm run test         # Run Jest tests
npm run seed         # Seed database
```

### AI Development
```bash
npm run genkit:dev   # Start Genkit development
npm run genkit:watch # Start Genkit with watch mode
```

## Environment Variables

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXTAUTH_URL` - Application URL
- `RESEND_API_KEY` - Email service API key
- `UPSTASH_REDIS_REST_URL` - Redis URL
- `UPSTASH_REDIS_REST_TOKEN` - Redis token

### Optional Variables
- `GOOGLE_GENAI_API_KEY` - Google AI API key
- `NODE_ENV` - Environment (development/production)

## Deployment Targets

### Supported Platforms
- **Vercel** - Primary deployment platform
- **Netlify** - Alternative deployment
- **Docker** - Containerized deployment (Dockerfile included)
- **Kubernetes** - K8s manifests in /k8s directory

## Database Schema

### Key Models (30+ total)
- User, Account, Session - Authentication
- Product, Brand, Category - Catalog
- Cart, CartItem - Shopping
- Quote, QuoteLine, QuoteMessage - Quotes
- Lead, Customer, FormSubmission - CRM
- AnalyticsEvent, ProductView - Analytics
- Notification, AdminNotification - Notifications
- StockMovement - Inventory

## Performance Optimizations
- Image optimization with Next.js Image
- Code splitting with dynamic imports
- Redis caching for sessions and data
- Prisma query optimization
- Rate limiting on API routes
- Static page generation where possible
