/**
 * Auth.js v5 Edge-Safe Configuration
 * 
 * This file contains ONLY edge-compatible configuration.
 * NO Prisma or Node.js-only imports allowed here.
 * 
 * This config is used by middleware for route protection.
 */

import type { NextAuthConfig } from "next-auth";
import { USER_ROLES } from "@/lib/auth-constants";

/**
 * Edge-safe auth configuration
 * Used by middleware for route protection without database calls
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    /**
     * Authorized callback - runs in middleware (edge runtime)
     * NO database calls allowed here
     * 
     * Route protection logic:
     * - Public routes: accessible to everyone
     * - User routes (/account, /checkout): require authentication
     * - Admin routes (/admin): require ADMIN role
     */
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const path = nextUrl.pathname;
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as { role?: string })?.role ?? USER_ROLES.CUSTOMER;

      // Public routes - no auth required
      // Note: "/" must use exact match, others use prefix match
      const exactPublicPaths = ["/"];
      const prefixPublicPaths = [
        "/products",
        "/quote",
        "/guest-quote",
        "/newsletter",
        "/contact",
        "/login",
        "/register",
        "/auth/",
        "/api/auth/",
        "/_next/",
        "/favicon.ico",
        "/403",
        "/404",
        "/admin/login", // Admin login page should be public
      ];

      const isExactPublic = exactPublicPaths.includes(path);
      const isPrefixPublic = prefixPublicPaths.some((p) => path.startsWith(p));

      if (isExactPublic || isPrefixPublic) return true;

      // User routes - require authentication (any role)
      const isUserRoute =
        path.startsWith("/account") || path.startsWith("/checkout");

      if (isUserRoute) {
        if (!isLoggedIn) {
          const loginUrl = new URL("/login", nextUrl);
          loginUrl.searchParams.set("callbackUrl", path);
          return Response.redirect(loginUrl);
        }
        return true;
      }

      // Admin routes - require ADMIN role
      const isAdminRoute = path.startsWith("/admin");

      if (isAdminRoute) {
        if (!isLoggedIn) {
          const loginUrl = new URL("/login", nextUrl);
          loginUrl.searchParams.set("callbackUrl", path);
          return Response.redirect(loginUrl);
        }
        if (role !== USER_ROLES.ADMIN) {
          return Response.redirect(new URL("/403", nextUrl));
        }
        return true;
      }

      // API routes - handled by individual route handlers
      if (path.startsWith("/api/")) {
        return true;
      }

      // Default: allow
      return true;
    },
  },
  providers: [], // Providers configured in auth.ts (Node.js runtime)
};
