import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { USER_ROLES, REDIRECT_PATHS } from "@/lib/auth-constants";

/**
 * Enhanced middleware for sophisticated role-based routing
 * Single source of truth for redirect logic and access control
 * Prevents infinite redirect loops by centralizing all redirect decisions
 * 
 * ROUTE CATEGORIZATION:
 * 1. Public routes: No authentication required
 * 2. Customer authentication routes: /login
 * 3. Administrative authentication routes: /admin/login
 * 4. Protected customer routes: /account/*
 * 5. Protected administrative routes: /admin/* (excluding /admin/login)
 */
export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAdmin = token?.role === USER_ROLES.ADMIN;

    /**
     * PHASE 1: Categorize route type
     */
    const isCustomerAuthRoute = pathname === REDIRECT_PATHS.LOGIN;
    const isAdminAuthRoute = pathname === "/admin/login";
    const isProtectedCustomerRoute = pathname.startsWith(REDIRECT_PATHS.USER_DASHBOARD);
    const isProtectedAdminRoute = 
      pathname.startsWith(REDIRECT_PATHS.ADMIN_DASHBOARD) && 
      pathname !== "/admin/login";

    /**
     * PHASE 2: Redirection for authenticated users accessing auth pages
     * Prevent authenticated users from seeing login interfaces
     * Redirect them to role-appropriate dashboards
     */
    if (isAuth && isCustomerAuthRoute) {
      // Authenticated user accessing customer login
      if (isAdmin) {
        // Admin user -> redirect to admin dashboard
        console.log('[MIDDLEWARE] Admin redirected from /login to /admin', {
          userId: token?.id,
          role: token?.role,
          pathname,
          timestamp: new Date().toISOString(),
        });
        return NextResponse.redirect(new URL(REDIRECT_PATHS.ADMIN_DASHBOARD, req.url));
      } else {
        // Customer user -> allow to proceed (they're already logged in but may want to re-auth)
        // Let the component handle the redirect
        return NextResponse.next();
      }
    }

    if (isAuth && isAdminAuthRoute) {
      // Authenticated user accessing admin login
      if (isAdmin) {
        // Admin user -> redirect to admin dashboard
        console.log('[MIDDLEWARE] Admin redirected from /admin/login to /admin', {
          userId: token?.id,
          role: token?.role,
          pathname,
          timestamp: new Date().toISOString(),
        });
        return NextResponse.redirect(new URL(REDIRECT_PATHS.ADMIN_DASHBOARD, req.url));
      } else {
        // Customer user -> redirect to customer dashboard
        console.log('[MIDDLEWARE] Customer redirected from /admin/login to /account', {
          userId: token?.id,
          role: token?.role,
          pathname,
          timestamp: new Date().toISOString(),
        });
        return NextResponse.redirect(new URL(REDIRECT_PATHS.USER_DASHBOARD, req.url));
      }
    }

    /**
     * PHASE 3: Protection logic for protected admin routes
     * Two-stage validation: authentication status + role verification
     * Use rewrite instead of redirect to prevent redirect loops
     */
    if (isProtectedAdminRoute) {
      if (!isAuth) {
        // Not authenticated -> redirect to admin login
        console.log('[MIDDLEWARE] Unauthenticated access to admin route', {
          pathname,
          timestamp: new Date().toISOString(),
        });
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }

      if (!isAdmin) {
        // Authenticated but not admin -> rewrite to unauthorized page
        // Use rewrite instead of redirect to prevent redirect loops
        console.log('[MIDDLEWARE] Non-admin access attempt to admin route', {
          userId: token?.id,
          role: token?.role,
          pathname,
          timestamp: new Date().toISOString(),
        });
        return NextResponse.rewrite(new URL(REDIRECT_PATHS.UNAUTHORIZED, req.url));
      }

      // Authenticated and admin -> allow access
      return NextResponse.next();
    }

    /**
     * PHASE 4: Protection logic for protected customer routes
     * Allow only authenticated customers (non-admins)
     * Redirect admins to admin dashboard
     */
    if (isProtectedCustomerRoute) {
      if (!isAuth) {
        // Not authenticated -> redirect to login with callback URL
        const callbackUrl = encodeURIComponent(pathname);
        console.log('[MIDDLEWARE] Unauthenticated access to customer route', {
          pathname,
          timestamp: new Date().toISOString(),
        });
        return NextResponse.redirect(
          new URL(`${REDIRECT_PATHS.LOGIN}?callbackUrl=${callbackUrl}`, req.url)
        );
      }

      if (isAdmin) {
        // Authenticated but admin -> redirect to admin dashboard
        console.log('[MIDDLEWARE] Admin attempting to access customer route', {
          userId: token?.id,
          role: token?.role,
          pathname,
          timestamp: new Date().toISOString(),
        });
        return NextResponse.redirect(new URL(REDIRECT_PATHS.ADMIN_DASHBOARD, req.url));
      }

      // Authenticated and customer -> allow access
      return NextResponse.next();
    }

    // Allow all other routes
    return NextResponse.next();
  },
  {
    callbacks: {
      /**
       * Callback to determine if the request is authorized
       * Return true to allow, false to block (middleware will redirect)
       * This is used by withAuth to determine which routes need protection
       */
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Authentication pages - allow all access, middleware handles redirects
        if (
          pathname === REDIRECT_PATHS.LOGIN ||
          pathname === "/admin/login"
        ) {
          return true;
        }

        // Protected customer routes - require authentication
        if (pathname.startsWith(REDIRECT_PATHS.USER_DASHBOARD)) {
          return !!token;
        }

        // Protected admin routes - require authentication
        if (pathname.startsWith(REDIRECT_PATHS.ADMIN_DASHBOARD)) {
          return !!token;
        }

        // Default - allow
        return true;
      },
    },
  }
);

/**
 * Middleware matcher configuration
 * Explicitly includes all authentication-sensitive route patterns
 * Avoids unnecessary processing for public assets and internal Next.js routes
 * NOTE: "/" (home page) is not included since it's a public page accessible to all
 */
export const config = {
  matcher: [
    "/admin/:path*", // All administrative routes
    "/account/:path*", // All customer routes
    "/login", // Customer authentication
    "/admin/login", // Administrative authentication
  ],
};
