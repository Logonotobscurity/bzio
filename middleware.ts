import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { USER_ROLES, REDIRECT_PATHS } from "@/lib/auth/constants";

const isDev = process.env.NODE_ENV === 'development';

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
 * 
 * COMPATIBILITY NOTES:
 * - basePath: Compatible (Next.js strips basePath before middleware)
 * - Locales: NOT supported (add locale stripping if i18n is enabled)
 * - Trailing slashes: Normalized automatically
 */
export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAdmin = token?.role === USER_ROLES.ADMIN;

    // Normalize pathname (remove trailing slash, preserve root)
    const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');

    const isCustomerAuthRoute = normalizedPath === REDIRECT_PATHS.LOGIN || normalizedPath === REDIRECT_PATHS.CUSTOMER_LOGIN;
    const isAdminAuthRoute = normalizedPath === REDIRECT_PATHS.ADMIN_LOGIN || normalizedPath === "/admin/login";
    const isProtectedCustomerRoute = normalizedPath.startsWith(REDIRECT_PATHS.USER_DASHBOARD);
    const isProtectedAdminRoute = 
      normalizedPath.startsWith(REDIRECT_PATHS.ADMIN_DASHBOARD) && 
      normalizedPath !== REDIRECT_PATHS.ADMIN_LOGIN &&
      normalizedPath !== "/admin/login";

    if (isAuth && isCustomerAuthRoute) {
      if (isAdmin) {
        if (isDev) {
          console.log('[MIDDLEWARE] Admin redirected from customer login', { pathname });
        }
        return NextResponse.redirect(new URL(REDIRECT_PATHS.ADMIN_DASHBOARD, req.url));
      }
      return NextResponse.next();
    }

    if (isAuth && isAdminAuthRoute) {
      if (isAdmin) {
        if (isDev) {
          console.log('[MIDDLEWARE] Admin redirected from admin login', { pathname });
        }
        return NextResponse.redirect(new URL(REDIRECT_PATHS.ADMIN_DASHBOARD, req.url));
      }
      if (isDev) {
        console.log('[MIDDLEWARE] Non-admin redirected from admin login', { pathname });
      }
      return NextResponse.redirect(new URL(REDIRECT_PATHS.USER_DASHBOARD, req.url));
    }

    if (isProtectedAdminRoute) {
      if (!isAuth) {
        if (isDev) {
          console.log('[MIDDLEWARE] Unauthenticated admin access', { pathname });
        }
        return NextResponse.redirect(new URL(REDIRECT_PATHS.ADMIN_LOGIN, req.url));
      }

      if (!isAdmin) {
        if (isDev) {
          console.log('[MIDDLEWARE] Non-admin blocked', { pathname });
        }
        return NextResponse.redirect(new URL(REDIRECT_PATHS.UNAUTHORIZED, req.url));
      }

      return NextResponse.next();
    }

    if (isProtectedCustomerRoute) {
      if (!isAuth) {
        const callbackUrl = encodeURIComponent(pathname + req.nextUrl.search);
        if (isDev) {
          console.log('[MIDDLEWARE] Unauthenticated customer access', { pathname });
        }
        return NextResponse.redirect(
          new URL(`${REDIRECT_PATHS.LOGIN}?callbackUrl=${callbackUrl}`, req.url)
        );
      }

      if (isAdmin) {
        if (isDev) {
          console.log('[MIDDLEWARE] Admin blocked from customer route', { pathname });
        }
        return NextResponse.redirect(new URL(REDIRECT_PATHS.ADMIN_DASHBOARD, req.url));
      }

      return NextResponse.next();
    }

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
        const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');

        // Authentication pages - allow all access, middleware handles redirects
        if (
          normalizedPath === REDIRECT_PATHS.LOGIN ||
          normalizedPath === REDIRECT_PATHS.CUSTOMER_LOGIN ||
          normalizedPath === REDIRECT_PATHS.ADMIN_LOGIN ||
          normalizedPath === "/admin/login"
        ) {
          return true;
        }

        // Protected customer routes - require authentication
        if (normalizedPath.startsWith(REDIRECT_PATHS.USER_DASHBOARD)) {
          return !!token;
        }

        // Protected admin routes - require authentication AND admin role
        if (normalizedPath.startsWith(REDIRECT_PATHS.ADMIN_DASHBOARD)) {
          return !!token && token.role === USER_ROLES.ADMIN;
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
    "/admin",
    "/admin/:path*",
    "/account",
    "/account/:path*",
    "/login",
    "/auth/:path*",
    "/admin/login",
  ],
};
