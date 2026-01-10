# Migration Plan: From Static JSON/TS to Postgres+Prisma

This document outlines the step-by-step plan to migrate the application's product data from static files to a Postgres database managed by Prisma.

## 1. Scaffolding & Setup

- [x] Create new directory structure:
  - `src/services/`
  - `src/repositories/`
  - `src/repositories/static/`
  - `src/repositories/db/`
  - `prisma/`
  - `worker/`
  - `tests/`
- [x] Create `prisma/schema.prisma` with initial models for `Product`, `Brand`, `Category`, and `Image`.
- [x] Create `src/lib/db.ts` for the Prisma client singleton.
- [x] Create `src/lib/featureFlags.ts` to manage the `DATA_SOURCE` environment variable.
- [x] Create placeholder files for `prisma/seed.ts`, `worker/whatsappWorker.ts`, and test files.

## 2. Static Repository Implementation

- [ ] Implement the static repository in `src/repositories/static/` to read data from the existing `src/lib/all-products-data.ts` and `src/lib/brand-data.ts` files.
- [ ] The static repository will expose the following methods: `findBySku`, `findBySlug`, `findByBrand`, `findByCategory`, `search`, `all`.
- [ ] The repository index file (`src/repositories/index.ts`) will be updated to select the static repository by default.

## 3. Service Facade Implementation

- [ ] Implement the `productService` in `src/services/productService.ts`.
- [ ] The service will use the repository to fetch data.
- [ ] The service will have the same public API as the one currently used by the pages.
- [ ] Replace direct imports of static data in the UI with calls to the `productService`.

## 4. DB Repository and Seed Implementation

- [ ] Implement the database repository in `src/repositories/db/` using Prisma.
- [ ] Implement the seed script in `prisma/seed.ts` to populate the database from the existing static data.
- [ ] The seed script will be idempotent, allowing it to be run multiple times without creating duplicate data.

## 5. Testing

- [ ] Create unit tests for the service facade, mocking the repository.
- [ ] Create integration tests that run against a seeded Postgres database in a container.
- [ ] The CI pipeline will be configured to run both test suites.

## 6. Migration and Rollout

- [ ] The `DATA_SOURCE` environment variable will be set to `db` in a staging environment.
- [ ] Smoke tests will be performed to verify the application's functionality.
- [ ] A canary deployment will be used to roll out the changes to a small percentage of production traffic.
- [ ] After successful verification, the changes will be rolled out to all of production.

## 7. Rollback Plan

- In case of any issues, the `DATA_SOURCE` environment variable can be changed back to `static` to immediately restore the previous behavior.
