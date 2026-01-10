# Phase A Audit - Risk Assessment
# Generated: 2026-01-09

## Risk Matrix

### CRITICAL RISKS

#### Risk C-1: Type Safety on Auth Constants

**Refactors Affected**: 1-1, 1-2, 4-1

**Issue**: Multiple REDIRECT_PATHS definitions with different values
- `auth-constants.ts`: LOGIN = '/login'
- `auth/constants.ts`: LOGIN = '/auth/customer/login'

**Scenario**:
- Code A imports from auth-constants: routes to '/login'
- Code B imports from auth/constants: routes to '/auth/customer/login'
- Redirect loops if both are active

**Mitigation**:
1. Complete audit of all import statements before refactoring
2. grep search for all REDIRECT_PATHS references
3. Type check after consolidation: `npm run typecheck`
4. Add unit tests for path constants:
   ```typescript
   test('All redirect paths are consistent', () => {
     expect(REDIRECT_PATHS.LOGIN).toBe('/login');
     expect(REDIRECT_PATHS.ADMIN_DASHBOARD).toBe('/admin');
   });
   ```

**Rollback Complexity**: MEDIUM
- May need to check 100+ files
- Import statement reversal

---

#### Risk C-2: Prisma Client Singleton Breaking

**Refactors Affected**: 2-1

**Issue**: 95 files importing Prisma from different paths
- If singleton breaks, database corruption possible
- Connection pool exhaustion if multiple instances created

**Scenario**:
- Some code uses `import prisma from '@/lib/prisma'`
- Some uses `import { prisma } from '@/lib/db'`
- If re-export in prisma.ts fails, two instances created
- Connection pool conflict

**Mitigation**:
1. Test prisma singleton before and after refactor
   ```typescript
   test('Prisma is singleton', async () => {
     const prisma1 = require('@/lib/prisma').default;
     const prisma2 = require('@/lib/db').prisma;
     expect(prisma1).toBe(prisma2);
   });
   ```
2. Monitor database connection count during build
3. Run integration tests with database
4. Test with actual data operations

**Rollback Complexity**: HIGH
- 95 import revert operations
- May require database reconnection

---

#### Risk C-3: Authentication Flow Breakage

**Refactors Affected**: 1-1, 1-2, 4-1

**Issue**: Auth system depends on exact role values and redirect paths

**Scenario**:
- USER_ROLES.ADMIN is used in 50+ places
- If consolidated constant has typo, all admin auth fails
- If REDIRECT_PATHS change, users get 404s

**Mitigation**:
1. Write comprehensive auth flow tests:
   ```typescript
   describe('Admin Authentication Flow', () => {
     test('Admin login redirects to /admin', () => {});
     test('Admin accessing /account redirects to /admin', () => {});
     test('Customer accessing /admin redirects to /login', () => {});
   });
   ```
2. Manual testing before PR:
   - Admin login flow
   - Customer login flow
   - Role-based redirects
3. Monitor session management
4. Verify JWT tokens include role

**Rollback Complexity**: MEDIUM
- Revert constant definitions
- Clear cached values

---

### HIGH RISKS

#### Risk H-1: Import Path Standardization Conflicts

**Refactors Affected**: 2-1

**Issue**: 95 files with inconsistent import paths

**Scenario**:
- File A updates imports to `@/lib/db`
- File B still uses `@/lib/prisma`
- Build succeeds but runtime behavior diverges
- Two Prisma instances created, connection pool issues

**Mitigation**:
1. Use automated find/replace:
   ```bash
   find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|import prisma from.*prisma|import { prisma } from "@/lib/db"|g'
   ```
2. Verify with grep:
   ```bash
   grep -r "import prisma" src/ | grep -v "@/lib/db"
   ```
3. Test with:
   ```bash
   npm run build
   npm test
   ```

**Rollback Complexity**: HIGH
- 95 import reversions

---

#### Risk H-2: Route Redirect Loops

**Refactors Affected**: 4-1

**Issue**: Duplicate routes with redirects could create loops

**Scenario**:
- `/auth/admin/login` redirects to `/admin/login`
- But middleware routes both to login page
- Infinite redirect possibility

**Mitigation**:
1. Test redirect chains:
   ```typescript
   test('No redirect loops exist', async () => {
     const chain = await followRedirects('/auth/admin/login');
     expect(chain.length).toBeLessThan(5);
     expect(chain[chain.length-1]).toBe('/admin/login');
   });
   ```
2. Manual browser testing
3. Check middleware doesn't double-redirect

**Rollback Complexity**: LOW
- Revert redirect logic

---

### MEDIUM RISKS

#### Risk M-1: Test Coverage Gaps

**Refactors Affected**: All

**Issue**: Some services have no tests

**Scenario**:
- Consolidate analytics services
- Run tests: pass
- Deploy: analytics fails silently
- Root cause: Untested function used in production

**Mitigation**:
1. Audit test coverage before each refactor:
   ```bash
   npm test -- --coverage
   ```
2. Add tests for consolidated functions:
   - At least 1 test per exported function
   - At least 1 integration test per service
3. Test both old and new imports:
   ```typescript
   test('Old import path works (deprecated)', () => {
     import { trackEvent } from '@/services/analyticsService';
     expect(trackEvent).toBeDefined();
   });
   
   test('New import path works (preferred)', () => {
     import { trackEvent } from '@/lib/analytics';
     expect(trackEvent).toBeDefined();
   });
   ```

**Rollback Complexity**: LOW
- Tests can be reverted separately

---

#### Risk M-2: Large Changeset Review Burden

**Refactors Affected**: 2-1 (95 files), 3-1 (25 files)

**Issue**: PR with 95+ file changes is hard to review

**Scenario**:
- PR changes 95 files
- Reviewer overwhelmed
- Risk of undetected bugs

**Mitigation**:
1. Break into smaller PRs per Refactor (already planned)
2. Create focused PRs:
   - PR 1: Consolidate constants (5 files)
   - PR 2: Update imports (95 files) - make this mechanical
3. Use git commit messages clearly:
   ```
   commit: "refactor(prisma): standardize imports from @/lib/prisma to @/lib/db"
   ```
4. Automated find/replace + tests verify correctness

**Rollback Complexity**: MEDIUM
- Per-PR revert

---

#### Risk M-3: Incomplete Import Migrations

**Refactors Affected**: 1-1, 1-2, 2-1, 3-1

**Issue**: Some files missed in import update

**Scenario**:
- Update 94 of 95 files to new Prisma import
- 1 file still uses old import
- Build passes (both exist)
- Runtime uses different instance
- Data corruption if one writes, other reads stale

**Mitigation**:
1. Automated grep check after each refactor:
   ```bash
   OLD_PATTERN="import.*analyticsService"
   if grep -r "$OLD_PATTERN" src/; then
     echo "❌ Found old import patterns!"
     exit 1
   fi
   ```
2. Add linting rule:
   ```javascript
   // .eslintrc.js
   rules: {
     'no-restricted-imports': [
       'error',
       {
         name: '@/services/analyticsService',
         message: 'Use @/lib/analytics instead (deprecated)',
       },
     ],
   }
   ```
3. Pre-commit hook to check for old imports

**Rollback Complexity**: LOW
- Single grep find/replace

---

### LOW RISKS

#### Risk L-1: Deprecation Warning Fatigue

**Refactors Affected**: 1-1, 1-2, 2-1, 3-1

**Issue**: Creating redirect files with deprecation notices

**Scenario**:
- Create `error-logging.service.ts` as redirect
- ESLint complains about unused imports
- Developers see deprecation warnings but old files still exist

**Mitigation**:
1. Use clear deprecation markers:
   ```typescript
   /**
    * @deprecated Use @/lib/analytics instead
    * This file will be removed in v2.0
    * Migration guide: [link]
    */
   export * from '@/lib/analytics';
   ```
2. Mark in package.json or docs
3. Plan removal timeline (e.g., "remove after 3 releases")

**Rollback Complexity**: MINIMAL
- Delete redirect files

---

#### Risk L-2: Ecosystem Import Conflicts

**Refactors Affected**: 1-1, 2-1

**Issue**: Third-party modules might import from old paths

**Scenario**:
- Internal service consolidates
- But custom package in node_modules still imports old path
- Build breaks

**Mitigation**:
1. Audit package.json for internal packages
2. Check if any imports from path-aliased libraries
3. Test full install + build:
   ```bash
   rm -rf node_modules
   npm install
   npm run build
   ```

**Rollback Complexity**: LOW
- Restore package files

---

## Dependency Matrix

```
Fix 0-1 (Shadowing)
  └─ No dependencies

Refactor 1-1 (Auth Const)
  └─ No dependencies
  └─ Required by: 1-2

Refactor 1-2 (Role Utils)
  ├─ Depends on: 1-1
  └─ No downstreams

Refactor 2-1 (Prisma)
  ├─ No dependencies
  ├─ Can run in parallel with: 2-2, 3-1
  └─ No downstreams

Refactor 2-2 (Error Log)
  ├─ No dependencies
  ├─ Can run in parallel with: 2-1, 3-1
  └─ No downstreams

Refactor 3-1 (Analytics)
  ├─ No dependencies
  ├─ Can run in parallel with: 2-1, 2-2
  └─ No downstreams

Refactor 4-1 (Routes)
  ├─ No dependencies
  └─ Should run after: 1-1 (uses new REDIRECT_PATHS)
```

---

## Testing Strategy

### Test Levels

**Level 1: Unit Tests** (Per function)
```typescript
test('getUserDashboardPath returns correct path', () => {
  expect(getUserDashboardPath('admin')).toBe('/admin');
  expect(getUserDashboardPath('customer')).toBe('/account');
});
```

**Level 2: Integration Tests** (Per service)
```typescript
test('Complete auth flow: login → redirect → dashboard', async () => {
  const result = await loginAdmin('admin@bzion.shop', 'password');
  expect(result.redirectTo).toBe('/admin');
});
```

**Level 3: E2E Tests** (Browser-level)
```typescript
test('Admin can login and access dashboard', async ({ page }) => {
  await page.goto('/admin/login');
  await page.fill('[name="email"]', 'admin@bzion.shop');
  await page.fill('[name="password"]', 'password');
  await page.click('[type="submit"]');
  await expect(page).toHaveURL('/admin');
});
```

---

## Pre-Merge Checklist

For each refactor branch before PR approval:

- [ ] TypeCheck: `npm run typecheck` passes
- [ ] Lint: `npm run lint` passes
- [ ] Tests: `npm test` passes with >80% coverage
- [ ] Build: `npm run build` succeeds
- [ ] Manual testing: Feature works as expected
- [ ] No console errors in dev/prod
- [ ] No new warnings in build output
- [ ] Git history clean (interactive rebase if needed)
- [ ] Commit messages follow convention
- [ ] PR description includes:
  - Problem statement
  - Solution overview
  - Changed files list
  - Test results
  - Risk notes
  - Rollback steps

