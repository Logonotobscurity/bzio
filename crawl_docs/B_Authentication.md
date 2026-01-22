# Section B: Authentication

### 1. Implementation
- **Library:** Auth.js (NextAuth.js) v5.
- **Providers:** Email (Magic Link) and Credentials (Email/Password).
- **Configuration:** `src/lib/auth/config.ts`.

### 2. User Resolution
- **Server-side:** `auth()` call from `src/lib/auth/config.ts`.
- **Client-side:** `useSession()` hook from `next-auth/react`.
- **Helpers:** `src/hooks/use-auth.ts` provides `useAuth` hook for simplified client access.

### 3. Protection Enforcement
- **Middleware:** Currently no global `middleware.ts` found.
- **Route Handlers:** Manual checks in each handler using `await auth()`.
- **Server Components:** Manual checks or use of `requireAdmin()` / `requireAuth()` from `src/lib/auth-server.ts`.
- **UI Gating:** Components check `session.user.role` to toggle visibility.

### 4. Session & JWT
- **Storage:** Encrypted cookies using JWT strategy.
- **Expiry:** Configured in `src/lib/auth/config.ts`.
- **Refresh:** Not explicitly configured for credentials; magic links handle re-authentication.

### 5. Logout
- **Implementation:** `signOut()` function from Auth.js.
- **Effect:** Clears the session cookie.

### Auth Entrypoints
- **Login:** `/login` (Customer), `/auth/admin/login` (Admin).
- **Register:** `/register` (Customer only).
- **Logout:** Handled via standard Auth.js signout triggers.
