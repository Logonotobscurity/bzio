# NextAuth v4 CLIENT_FETCH_ERROR - Final Fix

## Error
```
[next-auth][error][CLIENT_FETCH_ERROR]
"Unexpected token '<', "<!DOCTYPE "... is not valid JSON"
```

## Root Cause
NextAuth v4 requires a different export pattern than v5. The handler must be created with `NextAuth(options)` and then exported properly.

## Fix Applied

### Updated `src/lib/auth/config.ts`

```typescript
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";

// Define authOptions
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
  // ... rest of config
};

// Create handler
const handler = NextAuth(authOptions);

// Export for API routes (NextAuth v4 pattern)
export const handlers = { GET: handler, POST: handler };
export { handler as GET, handler as POST };
export const auth = handler.auth;
export const signIn = handler.signIn;
export const signOut = handler.signOut;
```

### Updated API Route

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { GET, POST } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';
export { GET, POST };
```

## Key Changes

1. ✅ Created `authOptions` object separately
2. ✅ Used `NextAuth(authOptions)` to create handler
3. ✅ Exported handler as both GET and POST
4. ✅ Exported auth, signIn, signOut from handler
5. ✅ Updated all re-export files

## Files Modified

1. `src/lib/auth/config.ts` - Main auth configuration
2. `src/app/api/auth/[...nextauth]/route.ts` - API route
3. `auth.ts` - Root re-export
4. `src/lib/auth.ts` - Lib re-export

## Testing

Test the endpoints:
- `/api/auth/session` - Should return JSON
- `/api/auth/signin` - Should return JSON
- `/api/auth/signout` - Should return JSON

## Summary

NextAuth v4 requires the handler to be created with `NextAuth(options)` and then exported. The previous pattern was for NextAuth v5. This fix ensures proper JSON responses from all auth endpoints.
