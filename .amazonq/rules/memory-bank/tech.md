# Technology Stack

## Core Technologies

### Frontend Framework
- **Next.js 15.5.7**: React framework with App Router, server components, and streaming SSR
- **React 18.3.1**: UI library with concurrent features
- **TypeScript 5**: Strict type checking enabled

### Styling
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **tailwindcss-animate**: Animation utilities
- **tailwind-merge**: Class name merging utility
- **Framer Motion 11.5.7**: Animation library for complex interactions

### UI Components
- **Radix UI**: Headless accessible component primitives
  - Dialog, Dropdown, Select, Accordion, Tabs, Toast, etc.
- **shadcn/ui**: Pre-built component library built on Radix
- **Lucide React 0.475.0**: Icon library
- **class-variance-authority**: Component variant management

### State Management
- **Zustand 4.5.4**: Lightweight state management
- **React Hook Form 7.54.2**: Form state and validation
- **@hookform/resolvers 3.9.0**: Validation schema integration

### Data & Validation
- **Zod 3.24.2**: TypeScript-first schema validation
- **date-fns 3.6.0**: Date manipulation and formatting

### Database
- **PostgreSQL**: Primary database
- **Prisma 7.1.0**: ORM and database toolkit
- **@prisma/adapter-pg 7.1.0**: PostgreSQL adapter
- **pg 8.16.3**: PostgreSQL client

### AI Integration
- **Genkit 1.20.0**: AI framework for generative AI features
- **@genkit-ai/google-genai 1.20.0**: Google Generative AI integration

### Data Visualization
- **Recharts 2.15.1**: Chart library for analytics dashboards
- **@tanstack/react-table 8.21.3**: Table component with sorting/filtering

### Carousel
- **embla-carousel-react 8.6.0**: Carousel component
- **embla-carousel-autoplay 8.1.7**: Autoplay plugin

### Email
- **Resend 6.5.2**: Email API for transactional emails

### SEO
- **schema-dts 1.1.5**: TypeScript definitions for Schema.org structured data

## Development Tools

### Build & Development
- **Turbopack**: Next.js bundler (via `--turbopack` flag)
- **tsx 4.7.1**: TypeScript execution for scripts
- **cross-env 7.0.3**: Cross-platform environment variables

### Code Quality
- **ESLint 9.39.1**: Linting with TypeScript ESLint 8.49.0
- **@next/eslint-plugin-next 16.0.7**: Next.js specific rules
- **Husky**: Git hooks for pre-commit checks

### Testing
- **Jest 30.2.0**: Testing framework
- **@testing-library/react 16.3.0**: React component testing
- **@testing-library/jest-dom 6.9.1**: DOM matchers
- **jest-environment-jsdom 30.2.0**: Browser environment simulation

### Environment
- **dotenv 16.6.1**: Environment variable management

## TypeScript Configuration

### Compiler Options (tsconfig.json)
- **Target**: ES2020
- **Module**: ESNext with bundler resolution
- **Strict Mode**: Enabled with all strict flags
- **Path Aliases**: `@/*` maps to `src/*`
- **Additional Checks**:
  - noUnusedLocals
  - noUnusedParameters
  - noImplicitReturns
  - noFallthroughCasesInSwitch

## Build Configuration

### Next.js Config (next.config.js)
- **Security Headers**: X-Frame-Options, CSP, XSS Protection
- **Image Optimization**: Remote patterns for external images
- **Redirects**: Legacy route redirects configured
- **Image Qualities**: [75, 80, 85]

### Prisma Configuration
- **Provider**: PostgreSQL
- **Client Generation**: Automatic on build
- **Seed Script**: `tsx prisma/seed.ts`

## Development Commands

### Primary Commands
```bash
npm run dev              # Start dev server on port 9003 with Turbopack
npm run build            # Production build with Prisma generation
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # TypeScript type checking
npm run test             # Run Jest tests
npm run seed             # Seed database with initial data
```

### AI Development
```bash
npm run genkit:dev       # Start Genkit development server
npm run genkit:watch     # Start Genkit with file watching
```

## Deployment

### Platforms
- **Netlify**: Primary deployment target (netlify.toml configured)
- **Firebase App Hosting**: Alternative deployment (apphosting.yaml)
- **Kubernetes**: Container orchestration (k8s/ configs)
- **Docker**: Containerization (Dockerfile included)

### CI/CD
GitHub Actions workflows configured:
- `ci.yml` - Continuous integration
- `deploy.yml` - Deployment automation
- `deploy-netlify.yml` - Netlify-specific deployment
- `lint.yml` - Code quality checks
- `lint-and-type-check.yml` - Combined linting and type checking

## Environment Variables
Required environment variables (see .env.example):
- Database connection strings
- API keys for external services
- Authentication secrets
- AI service credentials

## Browser Support
- Modern browsers with ES2020 support
- Progressive enhancement for older browsers
- Mobile-first responsive design
