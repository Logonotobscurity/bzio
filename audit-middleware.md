# Middleware Security Audit Report
**Date**: 2024-01-XX  
**File**: `middleware.ts`  
**Auditor**: AI Developer  
**Status**: Pre-PR Review

---

## Executive Summary

The middleware implements role-based access control for `/admin` and `/account` routes using NextAuth's `withAuth` wrapper. While the core logic is sound, several edge cases and security concerns require attention before production deployment.

**Overall Risk Level**: MEDIUM  
**Critical Issues**: 2  
**High Priority**: 3  
**Medium Priority**: 4  
**Low Priority**: 2

---

## 1. Edge Cases Analysis

### 1.1 Path Matching Edge Cases

#### Issue: Query String Preservation
**Status**: ❌ BROKEN  
**Severity**: P0 - CRITICAL  
**Location**: Line 80

```typescript
// CURRENT (BROKEN)
const callbackUrl = encodeURIComponent(pathname);
// Loses query string: /account/profile?tab=settings → /account/profile
```

**Impact**: User loses query parameters when redirected to login, breaking deep links and state preservation.

**Risk Matrix**:
| Change Complexity | Impact | Priority |
|-------------------|--------|----------|
| LOW (1 line) | HIGH | P0 |

**Fix Required**:
```typescript
const callbackUrl = encodeURIComponent(pathname + req.nextUrl.search);
```

---

#### Issue: Trailing Slash Normalization
**Status**: ⚠️ PARTIAL  
**Severity**: P1 - HIGH  
**Location**: Line 26

```typescript
// CURRENT
const normalizedPath = pathname.replace(/\/+$/, '');
```

**Edge Cases**:
- Root path `/` becomes empty string `''`
- Multiple trailing slashes `/admin///` → `/admin`
- Mixed case `/Admin/Login` not normalized

**Risk Matrix**:
| Change Complexity | Impact | Priority |
|-------------------|--------|----------|
| LOW | MEDIUM | P1 |

**Recommendation**: Add root path guard and lowercase normalization for case-insensitive matching.

---

#### Issue: Locale/i18n Support
**Status**: ❌ NOT HANDLED  
**Severity**: P2 - MEDIUM  
**Location**: Entire middleware

**Potential Issues**:
- `/en/admin/dashboard` won't match `/admin` prefix check
- `/fr/account/profile` won't be protected
- No locale stripping in path normalization

**Risk Matrix**:
| Change Complexity | Impact | Priority |
|-------------------|--------|----------|
| MEDIUM | LOW (if no i18n) | P2 |

**Action**: Add comment documenting locale support is NOT implemented. If i18n is planned, add `REQUIRES HUMAN REVIEW` flag.

---

#### Issue: basePath Configuration
**Status**: ❌ NOT HANDLED  
**Severity**: P2 - MEDIUM

**Scenario**: If Next.js `basePath: '/app'` is configured:
- Actual URL: `/app/admin/dashboard`
- Middleware sees: `/admin/dashboard` (Next.js strips basePath)
- Current code: Works correctly ✅

**Risk Matrix**:
| Change Complexity | Impact | Priority |
|-------------------|--------|----------|
| NONE | NONE | P2 (Documentation) |

**Action**: Add comment confirming basePath compatibility.

---

### 1.2 Authorization Callback Inconsistencies

#### Issue: Role Check Missing in `authorized` Callback
**Status**: ❌ SECURITY RISK  
**Severity**: P0 - CRITICAL  
**Location**: Lines 119-122

```typescript
// CURRENT (INSECURE)
if (pathname.startsWith(REDIRECT_PATHS.ADMIN_DASHBOARD)) {
  return !!token; // ❌ Allows ANY authenticated user
}
```

**Vulnerability**: Non-admin authenticated users can bypass middleware if they directly access admin routes before the middleware function runs.

**Risk Matrix**:
| Change Complexity | Impact | Priority |
|-------------------|--------|----------|
| LOW (1 line) | CRITICAL | P0 |

**Fix Required**:
```typescript
if (pathname.startsWith(REDIRECT_PATHS.ADMIN_DASHBOARD)) {
  return !!token && token.role === USER_ROLES.ADMIN;
}
```

---

### 1.3 Redirect Loop Potential

#### Issue: Authenticated Non-Admin on `/admin/login`
**Status**: ⚠️ EDGE CASE  
**Severity**: P1 - HIGH  
**Location**: Lines 47-56

**Scenario**:
1. Customer user navigates to `/admin/login`
2. Line 48: `isAuth && isAdminAuthRoute` → true
3. Line 49: `!isAdmin` → true
4. Line 56: `return NextResponse.next()` → Allows access ✅

**Current Behavior**: Customer can see admin login page (acceptable UX).

**Alternative Behavior**: Redirect customer to `/account` dashboard.

**Risk Matrix**:
| Change Complexity | Impact | Priority |
|-------------------|--------|----------|
| LOW | LOW (UX preference) | P1 |

**Recommendation**: Add redirect for non-admin users on `/admin/login` to prevent confusion.

---

#### Issue: Admin on `/login` (Customer Login)
**Status**: ✅ HANDLED CORRECTLY  
**Location**: Lines 35-44

Admin is redirected to `/admin` dashboard. No loop risk.

---

### 1.4 Matcher Configuration Gaps

#### Issue: Missing `/admin` Root Path
**Status**: ⚠️ POTENTIAL GAP  
**Severity**: P1 - HIGH  
**Location**: Lines 143-150

```typescript
matcher: [
  "/admin/:path*",  // ❌ Does NOT match /admin (no trailing path)
  "/account/:path*",
  // ...
]
```

**Test Cases**:
- `/admin` → ❌ NOT matched (middleware skipped)
- `/admin/` → ✅ Matched
- `/admin/dashboard` → ✅ Matched

**Risk Matrix**:
| Change Complexity | Impact | Priority |
|-------------------|--------|----------|
| LOW | HIGH | P1 |

**Fix Required**:
```typescript
matcher: [
  "/admin",         // Add explicit root
  "/admin/:path*",
  "/account",       // Add explicit root
  "/account/:path*",
  // ...
]
```

---

## 2. Security Concerns

### 2.1 PII Exposure in Logs

#### Issue: User ID Logged in Console
**Status**: ⚠️ GDPR/PRIVACY RISK  
**Severity**: P1 - HIGH  
**Location**: Lines 37, 51, 68, 87

```typescript
console.log('[MIDDLEWARE] Admin redirected from /login to /admin', {
  userId: token?.id,  // ❌ PII exposure
  role: token?.role,
  pathname,
});
```

**Compliance Risks**:
- GDPR Article 32: Logging personal identifiers
- CCPA: User tracking without consent
- Production logs may be stored/transmitted insecurely

**Risk Matrix**:
| Change Complexity | Impact | Priority |
|-------------------|--------|----------|
| LOW | HIGH (Legal) | P1 |

**Fix Required**:
```typescript
// Option 1: Hash user ID
userId: token?.id ? `user_${hashUserId(token.id)}` : 'unknown',

// Option 2: Remove entirely (RECOMMENDED)
console.log('[MIDDLEWARE] Admin redirected from /login to /admin', {
  role: token?.role,
  pathname,
});
```

---

### 2.2 Rewrite vs Redirect for Unauthorized Access

#### Issue: Using Redirect (Correct)
**Status**: ✅ SECURE  
**Location**: Lines 42, 54, 72, 81, 91

All unauthorized access uses `NextResponse.redirect()` which is correct. Previous audit recommended changing from `rewrite` to `redirect` - this has been implemented.

---

### 2.3 Token Validation

#### Issue: No Token Expiry Check
**Status**: ⚠️ POTENTIAL ISSUE  
**Severity**: P2 - MEDIUM

**Current**: Middleware trusts `withAuth` to validate token freshness.

**Risk**: If NextAuth session strategy has bugs, stale tokens could be accepted.

**Risk Matrix**:
| Change Complexity | Impact | Priority |
|-------------------|--------|----------|
| MEDIUM | LOW (NextAuth handles) | P2 |

**Recommendation**: Add explicit token expiry check if custom JWT logic is added.

---

## 3. Performance Concerns

### 3.1 Synchronous Path Normalization

**Status**: ✅ ACCEPTABLE  
**Location**: Line 26

```typescript
const normalizedPath = pathname.replace(/\/+$/, '');
```

**Analysis**: Regex is simple and fast. No performance concern for middleware.

---

### 3.2 Multiple String Comparisons

**Status**: ✅ ACCEPTABLE  
**Location**: Lines 28-33

**Analysis**: 
- 4 boolean checks per request
- All use fast string operations (startsWith, ===)
- No database calls or async operations
- Acceptable overhead for middleware

---

### 3.3 Console Logging in Production

**Status**: ⚠️ PERFORMANCE RISK  
**Severity**: P1 - HIGH  
**Location**: Lines 37, 51, 62, 68, 80, 87

**Impact**:
- Console.log is synchronous and blocks event loop
- High-traffic sites: 1000s of logs/second
- Vercel/serverless: Logs sent to external service (network overhead)

**Risk Matrix**:
| Change Complexity | Impact | Priority |
|-------------------|--------|----------|
| MEDIUM | MEDIUM | P1 |

**Fix Required**:
```typescript
// Option 1: Conditional logging
if (process.env.NODE_ENV === 'development') {
  console.log('[MIDDLEWARE] ...');
}

// Option 2: Structured logger (RECOMMENDED)
import { logger } from '@/lib/logger';
logger.info('middleware.redirect', { role, pathname });
```

---

## 4. Code Quality Issues

### 4.1 Hardcoded Paths

#### Issue: `/admin/login` Hardcoded
**Status**: ⚠️ INCONSISTENT  
**Severity**: P2 - MEDIUM  
**Location**: Lines 29, 62, 109, 113

```typescript
// INCONSISTENT
const isAdminAuthRoute = normalizedPath === "/admin/login" || ...
return NextResponse.redirect(new URL("/admin/login", req.url));
```

**Problem**: `REDIRECT_PATHS` constant exists but not used consistently.

**Risk Matrix**:
| Change Complexity | Impact | Priority |
|-------------------|--------|----------|
| LOW | LOW | P2 |

**Fix Required**:
```typescript
// Add to auth-constants.ts
export const REDIRECT_PATHS = {
  // ...existing
  ADMIN_LOGIN: '/admin/login',
  CUSTOMER_LOGIN: '/login',
} as const;

// Use in middleware
const isAdminAuthRoute = normalizedPath === REDIRECT_PATHS.ADMIN_LOGIN || ...
```

---

### 4.2 Duplicate Logic in `authorized` Callback

**Status**: ⚠️ CODE SMELL  
**Severity**: P2 - MEDIUM  
**Location**: Lines 104-127

**Issue**: Path matching logic duplicated between middleware function and `authorized` callback.

**Risk**: Changes to one location may not be reflected in the other.

**Risk Matrix**:
| Change Complexity | Impact | Priority |
|-------------------|--------|----------|
| MEDIUM | LOW | P2 |

**Recommendation**: Extract path classification to shared function.

---

## 5. Testing Gaps

### 5.1 Missing Unit Tests

**Status**: ❌ NO TESTS  
**Severity**: P0 - CRITICAL

**Required Test Coverage**:
1. Path normalization edge cases
2. Role-based access control
3. Redirect logic for each route type
4. Query string preservation
5. Trailing slash handling
6. Authorized callback behavior

**Risk Matrix**:
| Change Complexity | Impact | Priority |
|-------------------|--------|----------|
| HIGH | CRITICAL | P0 |

---

## 6. Risk Matrix Summary

| Issue | Severity | Change | Impact | Priority |
|-------|----------|--------|--------|----------|
| Query string lost in callbackUrl | CRITICAL | LOW | HIGH | P0 |
| Admin role not checked in authorized | CRITICAL | LOW | CRITICAL | P0 |
| Missing unit tests | CRITICAL | HIGH | CRITICAL | P0 |
| PII in console logs | HIGH | LOW | HIGH | P1 |
| Console.log performance | HIGH | MEDIUM | MEDIUM | P1 |
| Matcher missing root paths | HIGH | LOW | HIGH | P1 |
| Non-admin on /admin/login | HIGH | LOW | LOW | P1 |
| Hardcoded paths | MEDIUM | LOW | LOW | P2 |
| Duplicate logic | MEDIUM | MEDIUM | LOW | P2 |
| Locale support | MEDIUM | MEDIUM | LOW | P2 |
| Token expiry check | MEDIUM | MEDIUM | LOW | P2 |

---

## 7. Recommended Action Plan

### Phase 1: P0 Fixes (MUST FIX BEFORE MERGE)
1. ✅ Add query string to callbackUrl
2. ✅ Add admin role check in authorized callback
3. ✅ Create comprehensive unit tests

### Phase 2: P1 Fixes (SHOULD FIX BEFORE MERGE)
1. ✅ Remove PII from logs or hash user IDs
2. ✅ Add conditional logging or structured logger
3. ✅ Add root paths to matcher config
4. ✅ Redirect non-admin from /admin/login

### Phase 3: P2 Fixes (NICE TO HAVE)
1. Extract ADMIN_LOGIN constant
2. Add locale support documentation
3. Refactor duplicate path logic

---

## 8. Rollback Plan

If issues arise post-deployment:

1. **Immediate Rollback**: Revert to previous middleware version
2. **Monitoring**: Check for 401/403 spike in logs
3. **User Impact**: Admin users unable to access dashboard
4. **Recovery Time**: < 5 minutes (git revert + redeploy)

---

## 9. Sign-Off Checklist

- [ ] All P0 issues resolved
- [ ] All P1 issues resolved or documented
- [ ] Unit tests passing (>80% coverage)
- [ ] TypeScript compilation successful
- [ ] ESLint passing
- [ ] Manual testing completed
- [ ] Security review approved
- [ ] Performance testing completed

---

## 10. Appendix: Test Scenarios

### Critical Test Cases
1. Unauthenticated user → `/admin` → Redirect to `/admin/login`
2. Customer user → `/admin` → Redirect to `/unauthorized`
3. Admin user → `/admin` → Allow access
4. Admin user → `/account` → Redirect to `/admin`
5. Customer user → `/account` → Allow access
6. Unauthenticated → `/account/profile?tab=settings` → Preserve query in callbackUrl
7. Admin user → `/admin/login` → Redirect to `/admin`
8. Customer user → `/admin/login` → Redirect to `/account`
9. Path `/admin/` (trailing slash) → Normalize to `/admin`
10. Path `/admin` (no trailing slash) → Match in config

---

**End of Audit Report**
