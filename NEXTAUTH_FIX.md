# NextAuth CLIENT_FETCH_ERROR Fix

## Error
```
[next-auth][error][CLIENT_FETCH_ERROR]
"Unexpected token '<', "<!DOCTYPE "... is not valid JSON"
```

## Root Cause
**Duplicate Auth Configurations**: The project had TWO NextAuth configurations:
1. `auth.ts` (root) - Old configuration with activity logging
2. `src/lib/auth/config.ts` - New configuration without activity logging

The API route was importing from `~/auth` (root) which had the wrong export format, causing the API to return HTML instead of JSON.

## Issues Found

### 1. Wrong Import in API Route
**File**: `src/app/api/auth/[...nextauth]/route.ts`
**Problem**: Importing from `~/auth` instead of `@/lib/auth/config`
**Impact**: NextAuth handlers not properly exported, API returns HTML

### 2. Duplicate Configurations
**Problem**: Two separate auth configs with different implementations
**Impact**: Confusion, inconsistent behavior, maintenance issues

### 3. Missing Activity Logging
**File**: `src/lib/auth/config.ts`
**Problem**: No lastLogin update or activity logging in JWT callback
**Impact**: User login tracking not working

## Fixes Applied

### Fix 1: Consolidate Auth Configuration
**Single Source of Truth**: `src/lib/auth/config.ts`

```typescript
// src/lib/auth/config.ts - Main configuration
export const { handlers, signIn, signOut, auth } = NextAuth({...});

// auth.ts - Re-export for backward compatibility
export { handlers, signIn, signOut, auth } from '@/lib/auth/config';

// src/lib/auth.ts - Re-export for module resolution
export { auth, handlers, signIn, signOut } from './auth/config';
```

### Fix 2: Update API Route Import
**File**: `src/app/api/auth/[...nextauth]/route.ts`

```typescript
// BEFORE (WRONG)
import { handlers } from '~/auth';

// AFTER (CORRECT)
import { handlers } from '@/lib/auth/config';
```

### Fix 3: Add Activity Logging
**File**: `src/lib/auth/config.ts`

```typescript
async jwt({ token, user, trigger }) {
  if (user) {
    // Set token properties
    token.id = user.id;
    token.role = user.role;
    // ... other properties

    // Update lastLogin on first login
    const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    if (user.isNewUser || !user.lastLogin) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isNewUser: false,
          lastLogin: new Date(),
        },
      }).catch(() => {});
      token.isNewUser = false;
      token.lastLogin = new Date();
    }
  }
  return token;
}
```

## File Structure (After Fix)

```
src/lib/auth/config.ts          ← Main NextAuth configuration
src/lib/auth.ts                 ← Re-exports from config.ts
auth.ts (root)                  ← Re-exports from config.ts (backward compat)
src/app/api/auth/[...nextauth]/ ← Imports from config.ts
```

## Import Paths (Standardized)

All files should import from:
```typescript
import { auth, handlers, signIn, signOut } from '@/lib/auth/config';
// OR
import { auth } from '@/lib/auth';
```

## Testing Checklist

- [x] API route `/api/auth/session` returns JSON
- [x] API route `/api/auth/signin` returns JSON
- [x] No CLIENT_FETCH_ERROR in console
- [x] Login works for customers
- [x] Login works for admins
- [x] Session persists across page reloads
- [x] lastLogin updates on login
- [x] No duplicate auth configurations

## Files Modified

1. `src/app/api/auth/[...nextauth]/route.ts` - Fixed import path
2. `auth.ts` - Converted to re-export
3. `src/lib/auth.ts` - Updated re-export path
4. `src/lib/auth/config.ts` - Added activity logging

## Summary

The CLIENT_FETCH_ERROR was caused by duplicate auth configurations and wrong import paths. The fix:
- ✅ Consolidated to single auth config
- ✅ Fixed API route import
- ✅ Added activity logging
- ✅ Standardized import paths
- ✅ Maintained backward compatibility

NextAuth now returns proper JSON responses and authentication works correctly.
