# Architecture

This document provides a high-level overview of the BZION Hub codebase, including its structure, technologies, and data flows.

## 1. Top-Level Overview

### 1.1. Project Purpose

BZION Hub is a modern B2B e-commerce platform. Its core purpose is to connect buyers with suppliers in the Fast-Moving Consumer Goods (FMCG) sector.

The main business domains are:
*   **Product Catalog:** Managing brands, categories, and products.
*   **User Management:** Handling user accounts and authentication.
*   **Quoting:** Allowing users to request quotes for products.
*   **Analytics & Monitoring:** Tracking application performance and user behavior.

### 1.2. Core Technologies

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Language:** TypeScript
*   **UI Library:** [React](https://reactjs.org/)
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **ORM:** [Prisma](https://www.prisma.io/)
*   **Database:** PostgreSQL
*   **Deployment:** Google Cloud App Hosting (as per `apphosting.yaml`), with legacy configurations for Netlify and Docker/Kubernetes present.
*   **Monitoring:** Custom solution routing to `/api/monitoring/*` endpoints.
*   **AI:** [Genkit](https://firebase.google.com/docs/genkit) for AI-powered flows.
*   **Testing:** Jest, React Testing Library.

### 1.3. Main Entrypoints

*   **Web App:** The Next.js application serves both web pages (server components in `src/app/**/*.tsx`) and the API.
*   **API Handlers:** Located under `src/app/api/`. Key handlers include:
    *   `POST /api/v1/rfq/submit`: Submits a Request for Quote.
    *   `GET /api/products`: Fetches products.
    *   `GET /api/categories`: Fetches categories.
    *   `POST /api/newsletter-subscribe`: Handles newsletter sign-ups.
    *   `POST /api/monitoring/*`: Endpoints for custom error, metric, and web-vitals logging.
*   **Background Worker:**
    *   `worker/whatsappWorker.ts`: A worker to handle WhatsApp messaging, though its integration point is not immediately clear.
*   **CLI Commands** (from `package.json`):
    *   `npm run dev`: Starts the development server.
    *   `npm run build`: Creates a production build.
    *   `npm start`: Starts the production server.
    *   `npm run lint`: Lints the codebase using ESLint.
    *   `npm test`: Runs tests using Jest.
    *   `npm run seed`: Seeds the database using `prisma/seed.ts`.

## 2. Folder & Module Structure

The project follows a structure largely defined by Next.js and component-based architecture best practices.

*   `src/app/`: The heart of the Next.js application, containing all pages and API routes.
    *   `api/`: Contains all backend API route handlers.
    *   `[page]/page.tsx`: Each folder represents a route, with `page.tsx` as the entry point for that route's UI.
*   `src/components/`: Contains reusable React components.
    *   `ui/`: Atomic components from `shadcn/ui` (Button, Card, Input, etc.).
    *   `layout/`: Components that define the page structure (Header, Footer, etc.).
    *   `sections/`: Larger components that compose a full page section (e.g., `AboutContent`).
*   `src/lib/`: Core business logic, utilities, and client-side data stores.
    *   `db.ts`: Initializes and exports the Prisma client.
    *   `schema.ts`: Zod schemas for validation.
    *   `quote-store.ts`, `auth-store.ts`: Client-side state management (using Zustand).
*   `src/services/`: Modules responsible for interacting with external systems or abstracting data access.
*   `src/repositories/`: Data access layer, abstracting direct Prisma calls. It has both `db` and `static` implementations, suggesting a flexible data sourcing strategy.
*   `prisma/`: Database schema, migrations, and seeding scripts.
    *   `schema.prisma`: The single source of truth for the database structure.
*   `docs/`: Contains supplementary documentation.
*   `k8s/`: Kubernetes configuration files.

### Architectural Layers

The structure implies a classic N-tier architecture:
1.  **Presentation Layer:** React components in `src/app` and `src/components`.
2.  **Application Layer:** API routes in `src/app/api` and business logic in `src/services` and `src/lib`.
3.  **Domain Layer:** Implicitly defined by the data structures in `src/lib/types.ts` and the Prisma schema.
4.  **Infrastructure/Data Access Layer:** `src/repositories` and `prisma` abstract the database interaction.

## 3. Key Data Flows

### Request for Quote (RFQ)

1.  **Client:** User fills the form in `quote-request-form.tsx`.
2.  **API Route:** The form submits a `POST` request to `/api/v1/rfq/submit/route.ts`.
3.  **Validation:** The request body is validated (likely using Zod schemas from `src/lib/validators.ts`).
4.  **Business Logic:** The handler in `route.ts` calls `quoteService.ts`.
5.  **Persistence:** `quoteService.ts` uses `productRepository.ts` and other repositories to interact with the Prisma client (`db.ts`), saving the quote request to the database.
6.  **External Services:** An email is sent via `send-email.ts` and a WhatsApp message via `send-whatsapp.ts`.

### Cross-Cutting Concerns

*   **Authentication:** Managed via `src/lib/auth-store.ts` (client-side) and likely a middleware (not explicitly found, but standard for Next.js).
*   **Logging & Monitoring:** Handled by a custom `MonitoringProvider` and services that post data to `/api/monitoring/*`.
*   **Error Handling:** `ErrorBoundary.tsx` provides a client-side recovery mechanism. The `error-logger.ts` service sends errors to the backend.
*   **Feature Flags:** A simple feature flag system exists in `src/lib/featureFlags.ts`.
*   **Caching:** Handled by Next.js data fetching and caching mechanisms.

