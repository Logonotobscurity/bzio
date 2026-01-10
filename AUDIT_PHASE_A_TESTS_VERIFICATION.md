# Phase A Audit - Tests and Verification Plan
# Generated: 2026-01-09

## Test Execution Plan

### Pre-Implementation Testing (Baseline)

Before any refactoring branch is created:

```bash
# 1. Type checking
npx tsc --noEmit

# 2. Linting
npx eslint "src/**/*.{ts,tsx,js,jsx}" 

# 3. Existing tests
npm test

# 4. Build
npm run build

# 5. Results capture
npm test -- --coverage > baseline-coverage.txt
npm run build > baseline-build.txt
```

**Expected State**: All green ✓
- No TypeScript errors
- No ESLint errors
- All tests passing
- Build succeeds

---

### Per-Branch Testing Protocol

For each feature branch (Fix 0-1 through Refactor 4-1):

#### Step 1: Verify No Regressions
```bash
cd <workspace>
git checkout <branch>

# Type safety
npx tsc --noEmit

# Linting
npx eslint "src/**/*.{ts,tsx,js,jsx}" --fix

# Unit tests
npm test -- --onlyChanged

# Full build
npm run build

# Document results
echo "✓ TypeCheck: PASS" >> <branch>-test-results.txt
echo "✓ ESLint: PASS" >> <branch>-test-results.txt
echo "✓ Tests: PASS" >> <branch>-test-results.txt
echo "✓ Build: PASS" >> <branch>-test-results.txt
```

#### Step 2: Run Module-Specific Tests
```bash
# For auth-related refactors
npm test -- --testPathPattern="auth|login|role"

# For Prisma refactor
npm test -- --testPathPattern="database|db|prisma"

# For analytics refactor
npm test -- --testPathPattern="analytics|tracking"
```

#### Step 3: Build Artifact Verification
```bash
# Verify no duplicate dependencies
npm ls prisma | grep -c "prisma@" # Should be exactly 1

# Check bundle size hasn't exploded
du -h .next/standalone
```

#### Step 4: Document Coverage
```bash
npm test -- --coverage > <branch>-coverage.json

# Compare to baseline
if [[ coverage < baseline ]]; then
  echo "❌ Coverage decreased!"
  exit 1
fi
```

---

## Specific Test Cases Per Refactor

### Fix 0-1: Cart DELETE Shadowing

**Test File**: `src/app/api/user/cart/items/__tests__/[id].route.test.ts`

```typescript
describe('DELETE /api/user/cart/items/[id]', () => {
  
  test('Removes correct cart item by ID', async () => {
    const session = { user: { id: '1', role: 'customer' } };
    const itemId = 'item-123';
    
    // Create test data
    const cartItem = await prisma.cartItem.create({
      data: { id: itemId, cartId: 1, quantity: 5 }
    });
    
    // Call DELETE
    const response = await DELETE(
      new Request('http://localhost:3000/api/user/cart/items/item-123'),
      { params: Promise.resolve({ id: itemId }) }
    );
    
    // Verify deletion
    expect(response.status).toBe(200);
    const deleted = await prisma.cartItem.findUnique({ where: { id: itemId } });
    expect(deleted).toBeNull();
  });
  
  test('Rejects unauthorized users', async () => {
    const response = await DELETE(
      new Request('...'),
      { params: Promise.resolve({ id: 'item-123' }) }
    );
    
    expect(response.status).toBe(401);
  });
  
  test('Handles invalid item ID gracefully', async () => {
    const response = await DELETE(
      new Request('...'),
      { params: Promise.resolve({ id: 'invalid' }) }
    );
    
    expect(response.status).toBeIn([404, 400]);
  });
});
```

---

### Refactor 1-1: Auth Constants Consolidation

**Test File**: `src/lib/__tests__/auth-constants.test.ts`

```typescript
describe('auth-constants consolidation', () => {
  
  test('USER_ROLES are consistent across all imports', async () => {
    const roles1 = require('@/lib/auth-constants').USER_ROLES;
    const roles2 = require('@/lib/auth/constants').USER_ROLES;
    
    expect(roles1.ADMIN).toBe('admin');
    expect(roles1.USER).toBe('customer');
    expect(roles1).toEqual(roles2);
  });
  
  test('REDIRECT_PATHS are unified', async () => {
    const paths1 = require('@/lib/auth-constants').REDIRECT_PATHS;
    const paths2 = require('@/lib/auth/constants').REDIRECT_PATHS;
    
    expect(paths1.LOGIN).toBe('/login');
    expect(paths1.ADMIN_DASHBOARD).toBe('/admin');
    expect(paths1.USER_DASHBOARD).toBe('/account');
    expect(paths1).toEqual(paths2);
  });
  
  test('getUserDashboardPath returns correct values', () => {
    const { getUserDashboardPath } = require('@/lib/auth-constants');
    
    expect(getUserDashboardPath('admin')).toBe('/admin');
    expect(getUserDashboardPath('customer')).toBe('/account');
    expect(getUserDashboardPath(undefined)).toBe('/account');
  });
  
  test('Type guards work correctly', () => {
    const { isAdmin, isUser, isValidRole } = require('@/lib/auth-constants');
    
    expect(isAdmin('admin')).toBe(true);
    expect(isAdmin('customer')).toBe(false);
    expect(isUser('customer')).toBe(true);
    expect(isValidRole('admin')).toBe(true);
    expect(isValidRole('invalid')).toBe(false);
  });
  
  test('No old import patterns remain', async () => {
    const fs = require('fs');
    const path = require('path');
    const srcDir = path.join(__dirname, '../../');
    
    const files = [];
    const walk = (dir) => {
      for (const file of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          walk(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          files.push(fs.readFileSync(fullPath, 'utf-8'));
        }
      }
    };
    walk(srcDir);
    
    const foundOldImports = files.some(f =>
      f.includes('from "@/lib/auth/constants"') && 
      f.includes('USER_ROLES')
    );
    
    expect(foundOldImports).toBe(false);
  });
});
```

---

### Refactor 1-2: Role Utilities Consolidation

**Test File**: `src/lib/__tests__/auth-role-utils.test.ts`

```typescript
describe('auth-role-utils consolidation', () => {
  
  test('getRoleProtectedRoutes returns correct paths', () => {
    const { getRoleProtectedRoutes } = require('@/lib/auth-constants');
    
    const adminRoutes = getRoleProtectedRoutes('admin');
    expect(adminRoutes).toContain('/admin');
    expect(adminRoutes).toContain('/admin/users');
    
    const userRoutes = getRoleProtectedRoutes('customer');
    expect(userRoutes).toContain('/account');
    expect(userRoutes).toContain('/account/quotes');
  });
  
  test('isRolePath validates correctly', () => {
    const { isRolePath } = require('@/lib/auth-constants');
    
    expect(isRolePath('/admin/users', 'admin')).toBe(true);
    expect(isRolePath('/admin/login', 'admin')).toBe(false);
    expect(isRolePath('/account', 'customer')).toBe(true);
    expect(isRolePath('/admin', 'customer')).toBe(false);
  });
  
  test('getRoleInfo provides metadata', () => {
    const { getRoleInfo } = require('@/lib/auth-constants');
    
    const adminInfo = getRoleInfo('admin');
    expect(adminInfo.label).toBe('Administrator');
    expect(adminInfo.dashboardPath).toBe('/admin');
    
    const userInfo = getRoleInfo('customer');
    expect(userInfo.label).toBe('Customer');
    expect(userInfo.dashboardPath).toBe('/account');
  });
});
```

---

### Refactor 2-1: Prisma Standardization

**Test File**: `src/lib/__tests__/prisma-singleton.test.ts`

```typescript
describe('Prisma client standardization', () => {
  
  test('Prisma client is singleton', async () => {
    const prisma1 = require('@/lib/db').prisma;
    const prisma2 = require('@/lib/prisma').default;
    
    expect(prisma1).toBe(prisma2);
  });
  
  test('No duplicate Prisma instances created', async () => {
    const Module = require('module');
    const originalRequire = Module.prototype.require;
    let prismaRequests = 0;
    
    Module.prototype.require = function(id) {
      if (id.includes('prisma') && id.includes('@prisma')) {
        prismaRequests++;
      }
      return originalRequire.apply(this, arguments);
    };
    
    // Force re-require
    delete require.cache[require.resolve('@/lib/db')];
    delete require.cache[require.resolve('@/lib/prisma')];
    
    require('@/lib/db');
    require('@/lib/prisma');
    
    expect(prismaRequests).toBeLessThanOrEqual(1);
    Module.prototype.require = originalRequire;
  });
  
  test('Database operations work after consolidation', async () => {
    const { prisma } = require('@/lib/db');
    
    // Simple read test
    const users = await prisma.user.findMany({ take: 1 });
    expect(Array.isArray(users)).toBe(true);
  });
  
  test('Connection pool is healthy', async () => {
    const { prisma } = require('@/lib/db');
    
    // Multiple concurrent operations
    const operations = Array(10).fill(null).map(() =>
      prisma.user.count()
    );
    
    const results = await Promise.all(operations);
    expect(results.every(r => r >= 0)).toBe(true);
  });
});
```

---

### Refactor 3-1: Analytics Consolidation

**Test File**: `src/lib/__tests__/analytics.test.ts`

```typescript
describe('Analytics service consolidation', () => {
  
  test('Fire-and-forget pattern works', async () => {
    const { trackEvent } = require('@/lib/analytics');
    
    // Should not throw or await
    const result = trackEvent('TEST_EVENT', '123', { foo: 'bar' });
    expect(result).toBeUndefined();
  });
  
  test('Deprecated imports still work', async () => {
    const oldService = require('@/services/analyticsService');
    const oldLib = require('@/lib/analytics');
    
    expect(typeof oldService.trackEvent).toBe('function');
    expect(oldService.trackEvent).toBe(oldLib.trackEvent);
  });
  
  test('Multiple analytics patterns converge', async () => {
    const pattern1 = require('@/services/analytics.service');
    const pattern2 = require('@/services/analyticsService');
    const pattern3 = require('@/lib/analytics');
    
    // All should export same functions
    expect(pattern1.trackEvent).toBe(pattern3.trackEvent);
    expect(pattern2.trackEvent).toBe(pattern3.trackEvent);
  });
  
  test('No double-tracking after consolidation', async () => {
    const spy = jest.spyOn(console, 'log');
    const { trackEvent } = require('@/lib/analytics');
    
    trackEvent('DOUBLE_TEST', '123');
    
    // Should only log once (check by event, not by call count)
    const logs = spy.mock.calls.filter(call => 
      call[0].includes('DOUBLE_TEST')
    );
    
    expect(logs.length).toBe(1);
    spy.mockRestore();
  });
});
```

---

### Refactor 4-1: Route Consolidation

**Test File**: `src/app/__tests__/auth-routes.test.ts`

```typescript
describe('Authentication route consolidation', () => {
  
  test('Duplicate routes redirect to canonical', async () => {
    // Simulate navigation
    const { redirect } = require('next/navigation');
    
    // /auth/admin/login should redirect to /admin/login
    const authAdminPage = require('@/app/auth/admin/login/page').default;
    expect(() => authAdminPage()).toThrow();
    
    // Check that redirect was called
    expect(redirect).toHaveBeenCalledWith('/admin/login');
  });
  
  test('Canonical routes still work', async () => {
    const adminLoginPage = require('@/app/admin/login/page').default;
    expect(adminLoginPage).toBeDefined();
    
    const customerLoginPage = require('@/app/login/page').default;
    expect(customerLoginPage).toBeDefined();
  });
  
  test('No redirect loops exist', async () => {
    // Follow redirect chain
    const chain = [];
    let current = '/auth/admin/login';
    
    while (chain.length < 10) {
      chain.push(current);
      
      // Simulate navigation (in real test, use browser)
      const response = await fetch(current);
      
      if (response.headers.get('location')) {
        current = response.headers.get('location');
        if (chain.includes(current)) {
          throw new Error(`Redirect loop detected: ${chain.join(' -> ')}`);
        }
      } else {
        break;
      }
    }
    
    expect(chain.length).toBeLessThan(5);
  });
});
```

---

## Integration Test Suite

```typescript
describe('Full Application Integration After Refactoring', () => {
  
  beforeAll(async () => {
    await prisma.$connect();
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });
  
  test('Admin login flow end-to-end', async () => {
    // 1. Navigate to /admin/login
    // 2. Enter credentials
    // 3. POST /api/auth/callback/credentials
    // 4. Verify redirect to /admin
    // 5. Verify session has role: 'admin'
    // 6. Verify access to /admin/customers
    // 7. Verify redirect from /account to /admin
  });
  
  test('Customer login flow end-to-end', async () => {
    // 1. Navigate to /login
    // 2. Enter credentials
    // 3. POST /api/auth/callback/credentials
    // 4. Verify redirect to /account
    // 5. Verify session has role: 'customer'
    // 6. Verify access to /account
    // 7. Verify redirect from /admin to /account
  });
  
  test('Role-based access control after consolidation', async () => {
    // 1. Admin accessing /account → redirect to /admin
    // 2. Customer accessing /admin → redirect to /account
    // 3. Unauthenticated accessing /admin → redirect to /admin/login
    // 4. Unauthenticated accessing /account → redirect to /login
  });
});
```

---

## Manual Testing Checklist

For human review before PR approval:

- [ ] Admin login works (`/admin/login`)
- [ ] Customer login works (`/login`)
- [ ] Redirect after admin login goes to `/admin`
- [ ] Redirect after customer login goes to `/account`
- [ ] Admin cannot access `/account` (redirects to `/admin`)
- [ ] Customer cannot access `/admin` (redirects to `/account`)
- [ ] Unauthenticated access to `/admin` redirects to `/admin/login`
- [ ] Unauthenticated access to `/account` redirects to `/login`
- [ ] Analytics tracking works (check DevTools console)
- [ ] No console errors in browser
- [ ] No console errors in terminal
- [ ] Build size unchanged (or decreased)
- [ ] No unused imports warnings
- [ ] Performance metrics unchanged

---

## Continuous Integration Configuration

```yaml
# .github/workflows/test-refactors.yml
name: Test Refactored Branches

on:
  pull_request:
    branches:
      - main
    paths:
      - 'src/lib/auth**'
      - 'src/lib/prisma.ts'
      - 'src/lib/analytics.ts'
      - 'src/lib/db/**'
      - 'src/services/*analytics*'
      - 'src/services/*error*'
      - 'src/app/**login**'
      - 'src/app/admin/**'
      - 'src/app/account/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install
        run: npm ci
      
      - name: TypeCheck
        run: npm run typecheck
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm test -- --coverage
      
      - name: Build
        run: npm run build
      
      - name: Check imports
        run: |
          grep -r "from.*auth/constants" src/ && echo "❌ Old import found" && exit 1 || true
          grep -r "from.*analyticsService" src/ && echo "❌ Old import found" && exit 1 || true
```

---

## Test Execution Report Template

```markdown
# Test Report: <Branch Name>

## Test Execution Date: <Date>
## Executor: Automated CI / Human

### Results Summary
- TypeCheck: ✓ PASS / ❌ FAIL
- ESLint: ✓ PASS / ❌ FAIL
- Unit Tests: ✓ PASS / ❌ FAIL (X/Y passing)
- Integration Tests: ✓ PASS / ❌ FAIL
- Build: ✓ PASS / ❌ FAIL
- Manual Testing: ✓ PASS / ⏳ PENDING

### Coverage
- Before: X%
- After: Y%
- Change: +/-Z%

### Performance
- Build time: X seconds
- Bundle size: X bytes (change: +/- Y%)

### Issues Found
- [ ] None
- [ ] <Issue 1>
- [ ] <Issue 2>

### Rollback Instructions
```bash
git checkout main
git branch -D <branch>
npm install
npm run build
```

### Sign-off
- [ ] Code review approved
- [ ] Tests approved
- [ ] Ready to merge
- [ ] Blocked: <reason>
```

