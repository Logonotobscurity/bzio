/**
 * NextAuth.js wrapper for server-side auth operations
 * Re-exports from config to ensure proper module resolution
 */

export { auth, handlers, signIn, signOut } from './auth/config';
