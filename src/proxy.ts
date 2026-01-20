import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * NextAuth v5 Middleware
 * Uses edge-safe configuration from auth.config.ts
 * 
 * Route protection is handled by the authorized() callback in authConfig
 */
export default NextAuth(authConfig).auth;

/**
 * Middleware matcher configuration
 * Explicitly includes all authentication-sensitive route patterns
 * Avoids unnecessary processing for public assets and internal Next.js routes
 */
export const config = {
  matcher: [
    "/", // Landing/home page
    "/admin/:path*", // All administrative routes
    "/account/:path*", // All customer routes
    "/login", // Customer authentication
    "/admin/login", // Administrative authentication
    "/checkout/:path*", // Checkout routes
  ],
};
