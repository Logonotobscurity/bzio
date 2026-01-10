# Tests & Verification Checklist

## Pre-Refactor Baseline

### 1. Establish Current State
```bash
# Create baseline branch
git checkout -b baseline/pre-refactor
git tag baseline-$(date +%Y%m%d)

# Run full test suite and save results
npm run test -- --coverage > test-results-baseline.txt
npm run build > build-results-baseline.txt
npm run typecheck > typecheck-results-baseline.txt

# Save current metrics
echo "Baseline established: $(date)" > BASELINE.md
```

---

## Phase 0: Critical Bug Fixes

### P0-1: Cart DELETE Handler Fix

#### Unit Tests
```bash
# Test cart item deletion
npm run test -- src/app/api/user/cart/items/__tests__/route.test.ts

# Expected: All tests pass
# Expected: DELETE handler uses correct itemId variable
```

#### Integration Tests
```bash
# Start dev server
npm run dev

# Test DELETE endpoint
curl -X DELETE http://localhost:3000/api/user/cart/items/test-item-123 \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<valid-token>"

# Expected: 200 OK with { success: true }
# Expected: Item removed from database
```

#### Manual Verification
```bash
# 1. Login as test user
# 2. Add item to cart
# 3. Delete item via API
# 4. Verify item is removed
# 5. Check server logs for no errors
```

#### Rollback Test
```bash
# Revert change
git checkout HEAD~1 -- src/app/api/user/cart/items/[id]/route.ts

# Verify old bug still exists
npm run test

# Re-apply fix
git checkout - -- src/app/api/user/cart/items/[id]/route.ts
```

---

## Phase 1: Infrastructure Changes

### P1-1: Prisma Consolidation

#### Pre-Migration Checks
```bash
# Count current imports
findstr /s /c:"from '@/lib/prisma'" src\**\*.ts | find /c /v ""
findstr /s /c:"from '@/lib/db'" src\**\*.ts | find /c /v ""

# Save counts
echo "prisma imports: X" > prisma-migration-baseline.txt
echo "db imports: Y" >> prisma-migration-baseline.txt
```

#### Type Checking
```bash
# Must pass with zero errors
npx tsc --noEmit

# Expected: No type errors
# Expected: All Prisma imports resolve correctly
```

#### Database Connection Tests
```bash
# Test database connectivity
npm run test -- src/lib/db/__tests__/connection.test.ts

# Test Prisma client initialization
node -e "const { prisma } = require('./src/lib/db'); prisma.\$connect().then(() => console.log('OK')).catch(console.error)"

# Expected: Connection successful
# Expected: No pool exhaustion warnings
```

#### Build Verification
```bash
# Production build must succeed
npm run build

# Expected: Build completes without errors
# Expected: No Prisma client errors
# Expected: Build time similar to baseline (±10%)
```

#### Runtime Tests
```bash
# Start production server
npm run start

# Test all database operations
curl http://localhost:3000/api/health/db
# Expected: { status: "healthy" }

# Test admin dashboard (heavy DB usage)
curl http://localhost:3000/api/admin/dashboard-data \
  -H "Cookie: next-auth.session-token=<admin-token>"
# Expected: Data returned without errors

# Monitor connection pool
# Expected: No "too many clients" errors
# Expected: Connections properly released
```

#### Post-Migration Verification
```bash
# Verify all imports updated
findstr /s /c:"from '@/lib/prisma'" src\**\*.ts
# Expected: Only re-export in prisma.ts

findstr /s /c:"from '@/lib/db'" src\**\*.ts
# Expected: All other files use this import

# Run full test suite
npm run test -- --coverage
# Expected: All tests pass
# Expected: Coverage maintained or improved
```

---

### P1-2: Remove Duplicate Login Routes

#### Pre-Removal Checks
```bash
# Find all references to duplicate routes
findstr /s /i "auth/admin/login" src\**\*.tsx > auth-admin-refs.txt
findstr /s /i "auth/customer/login" src\**\*.tsx > auth-customer-refs.txt

# Verify redirects added to middleware
grep -A 5 "auth/admin/login" middleware.ts
grep -A 5 "auth/customer/login" middleware.ts
```

#### Redirect Tests
```bash
# Test admin login redirect
curl -I http://localhost:3000/auth/admin/login
# Expected: 307 Temporary Redirect
# Expected: Location: /admin/login

# Test customer login redirect
curl -I http://localhost:3000/auth/customer/login
# Expected: 307 Temporary Redirect
# Expected: Location: /login/customer
```

#### Link Verification
```bash
# Verify no broken links
npm run build

# Check for 404s in build output
# Expected: No 404 errors for login routes
```

#### SEO Verification
```bash
# Generate sitemap
npm run build
# Check public/sitemap.xml

# Verify duplicate URLs removed
# Expected: Only /admin/login and /login/customer in sitemap
```

---

## Phase 2: Service Layer Consolidation

### P2-1: Analytics Services

#### Pre-Migration Tests
```bash
# Test all three analytics implementations
npm run test -- src/services/analytics.service.test.ts
npm run test -- src/services/analyticsService.test.ts
npm run test -- src/lib/analytics.test.ts

# Baseline event counts
psql $DATABASE_URL -c "SELECT COUNT(*) FROM analytics_events;"
```

#### Migration Tests
```bash
# Test new analytics implementation
npm run test -- src/lib/analytics.test.ts

# Test fire-and-forget pattern
node -e "
const { trackEvent } = require('./src/lib/analytics');
trackEvent('TEST_EVENT', 1, { test: true });
console.log('Event tracked (async)');
"

# Verify event in database after 5 seconds
sleep 5
psql $DATABASE_URL -c "SELECT * FROM analytics_events WHERE event_type = 'TEST_EVENT' ORDER BY timestamp DESC LIMIT 1;"
```

#### Load Testing
```bash
# Test high-volume tracking
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/products/test-product \
    -H "Content-Type: application/json" &
done
wait

# Check for errors
# Expected: No "too many connections" errors
# Expected: All events tracked
```

#### Rollback Test
```bash
# Revert to old service
git checkout baseline -- src/services/analytics.service.ts

# Verify old tests still pass
npm run test -- analytics.service

# Re-apply changes
git checkout - -- src/services/analytics.service.ts
```

---

### P2-2: Error Logging Services

#### Migration Tests
```bash
# Test error logging
npm run test -- src/services/error-logging.service.test.ts

# Test error creation
curl -X POST http://localhost:3000/api/errors \
  -H "Content-Type: application/json" \
  -d '{"message":"Test error","severity":"low"}'

# Verify in database
psql $DATABASE_URL -c "SELECT * FROM error_logs WHERE message = 'Test error';"
```

---

### P2-3: Quote Services

#### Transaction Tests
```bash
# Test quote creation with transaction
npm run test -- src/services/quote.service.test.ts

# Test rollback on error
# Expected: No orphaned quote lines if quote creation fails
```

---

## Phase 3: Component Consolidation

### P3-1: Brand Card Components

#### Visual Regression Tests
```bash
# Install visual testing tool (if not present)
npm install --save-dev @playwright/test

# Run visual tests
npx playwright test --project=chromium

# Compare screenshots
# Expected: No visual regressions
```

#### Component Tests
```bash
# Test all brand card variants
npm run test -- src/components/ui/brand-card.test.tsx

# Test with different data types
# - Simple Brand type
# - EnrichedBrandData type
# - Missing optional fields
```

#### Storybook Verification
```bash
# Start storybook (if configured)
npm run storybook

# Verify all variants render:
# - Simple variant
# - Detailed variant
# - Compact variant
# - With pricing
# - Without pricing
```

---

## Phase 4: Routing Changes

### P4-1: Product Route Conflicts

#### Route Tests
```bash
# Test all product routes
curl http://localhost:3000/products
curl http://localhost:3000/products/test-product
curl http://localhost:3000/products/brands
curl http://localhost:3000/products/brands/test-brand
curl http://localhost:3000/products/categories
curl http://localhost:3000/products/categories/test-category

# Expected: All return 200 OK
# Expected: No 404 errors
```

---

### P4-2: Dashboard Redirect

#### Redirect Test
```bash
# Test dashboard redirect
curl -I http://localhost:3000/dashboard
# Expected: 307 redirect to /account
```

---

## Continuous Integration Checks

### GitHub Actions / CI Pipeline
```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run typecheck
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm run test -- --coverage
      
      - name: Build
        run: npm run build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Verification Commands Summary

### Quick Verification (Run after each change)
```bash
# Type safety
npx tsc --noEmit

# Linting
npx eslint "src/**/*.{ts,tsx,js,jsx}" --max-warnings=0

# Unit tests
npm run test

# Build
npm run build
```

### Full Verification (Run before merge)
```bash
# All checks
npm run typecheck && \
npm run lint && \
npm run test -- --coverage && \
npm run build && \
echo "✅ All checks passed"
```

### Database Verification
```bash
# Connection test
psql $DATABASE_URL -c "SELECT 1;"

# Schema validation
npx prisma validate

# Migration status
npx prisma migrate status

# Data integrity
psql $DATABASE_URL -c "
  SELECT 
    'users' as table_name, COUNT(*) as count FROM users
  UNION ALL
  SELECT 'products', COUNT(*) FROM products
  UNION ALL
  SELECT 'quotes', COUNT(*) FROM quotes;
"
```

### Performance Verification
```bash
# Build time
time npm run build

# Bundle size
npm run build
ls -lh .next/static/chunks/

# Lighthouse audit
npx lighthouse http://localhost:3000 --output=html --output-path=./lighthouse-report.html
```

---

## Regression Testing Checklist

### Critical User Flows
- [ ] User registration
- [ ] User login (customer)
- [ ] Admin login
- [ ] Product browsing
- [ ] Add to cart
- [ ] Remove from cart ⚠️ (affected by bug fix)
- [ ] Quote request
- [ ] Admin dashboard load
- [ ] Admin quote management

### API Endpoints
- [ ] GET /api/products
- [ ] GET /api/products/[slug]
- [ ] POST /api/user/cart
- [ ] PUT /api/user/cart/items/[id]
- [ ] DELETE /api/user/cart/items/[id] ⚠️ (affected by bug fix)
- [ ] GET /api/admin/dashboard-data
- [ ] POST /api/quote-requests

### Authentication Flows
- [ ] Customer login at /login/customer
- [ ] Admin login at /admin/login
- [ ] Redirect from /auth/admin/login ⚠️ (new redirect)
- [ ] Redirect from /auth/customer/login ⚠️ (new redirect)
- [ ] Protected route access
- [ ] Unauthorized access handling

---

## Monitoring & Alerts

### Production Monitoring
```bash
# Set up alerts for:
# - Error rate increase
# - Response time degradation
# - Database connection pool exhaustion
# - Failed authentication attempts

# Monitor these metrics:
# - API response times
# - Database query performance
# - Error log frequency
# - User session duration
```

### Health Checks
```bash
# Application health
curl http://localhost:3000/api/health

# Database health
curl http://localhost:3000/api/health/db

# Email service health
curl http://localhost:3000/api/health/email
```

---

## Rollback Procedures

### Quick Rollback (Git)
```bash
# Rollback last commit
git revert HEAD
git push

# Rollback to specific tag
git checkout baseline-20250101
git checkout -b rollback/emergency
git push origin rollback/emergency
```

### Database Rollback
```bash
# Restore from backup
pg_restore -d $DATABASE_URL backup.dump

# Rollback migrations
npx prisma migrate resolve --rolled-back <migration-name>
```

### Deployment Rollback
```bash
# Vercel
vercel rollback

# Or redeploy previous version
vercel deploy --prod
```

---

## Sign-off Checklist

Before marking refactor complete:

- [ ] All tests passing (100%)
- [ ] Code coverage ≥ 90%
- [ ] Zero TypeScript errors
- [ ] Zero ESLint warnings
- [ ] Build successful
- [ ] All duplicate files removed
- [ ] Documentation updated
- [ ] Performance metrics maintained
- [ ] No new security vulnerabilities
- [ ] Monitoring configured
- [ ] Rollback plan tested
- [ ] Team trained on changes
- [ ] Stakeholder approval obtained

---

## Post-Deployment Verification

### Week 1 After Deployment
```bash
# Daily checks
- Monitor error rates
- Check database performance
- Review user feedback
- Verify analytics tracking

# Weekly review
- Compare metrics to baseline
- Review incident reports
- Assess technical debt reduction
```

### Success Criteria
- Zero critical bugs introduced
- Error rate < baseline
- Response time ≤ baseline
- User satisfaction maintained
- Technical debt reduced by 40%
