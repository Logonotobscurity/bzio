# Categorized Pending Issues for Production Readiness

## 1. Infrastructure & Database
- [ ] **Production Migration**: Execute `npx prisma migrate deploy` in the production environment.
- [ ] **Backup Verification**: Confirm automated backups are active and restoration has been tested.
- [ ] **Pool Scaling**: Monitor PostgreSQL connection pool (max 20) under load tests.

## 2. Security & Compliance
- [ ] **Rate Limiting**: Implement rate limiting middleware for sensitive endpoints (Login, Register, RFQ Submit).
- [ ] **Audit Logging**: Roll out `UserActivity` logging across all high-value admin and user actions.
- [ ] **Secret Management**: Formalize `NEXTAUTH_SECRET` rotation policy.

## 3. Monitoring & Performance
- [ ] **Sentry Integration**: Finalize Sentry SDK configuration for production error capture.
- [ ] **Performance Baseline**: Verify Time to First Byte (TTFB) and page load metrics in a production-like environment.
- [ ] **Log Alerting**: Set up alerts for high-severity `ErrorLog` entries.

## 4. Code Quality & Maintenance
- [ ] **Brand Card Consolidation**: Merge redundant implementations in `src/components/BrandCard.tsx` and `src/components/brand-card.tsx` into `src/components/ui/brand-card.tsx`.
- [ ] **Routing Conflict Resolution**: Remove `route.ts` handlers in `src/app/products/brands/[slug]` and `categories/[slug]` that conflict with `page.tsx`.
- [ ] **Authentication Cleanup**: Consolidate duplicate login pages and update `next.config.js` redirects to point to the canonical versions.
- [ ] **Service Unification**: Complete the removal of `analytics.service.ts` in favor of the unified `src/lib/analytics.ts`.
- [ ] **Test Stability**: Resolve Jest environment issues (ESM imports for `lucide-react`) to ensure a passing CI/CD pipeline.
