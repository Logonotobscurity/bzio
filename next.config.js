import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    authInterrupts: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/suppliers',
        destination: '/companies',
        permanent: true,
      },
      {
        source: '/brand',
        destination: '/products/brands',
        permanent: true,
      },
      {
        source: '/brands',
        destination: '/products/brands',
        permanent: true,
      },
      {
        source: '/categories/:slug*',
        destination: '/products/category/:slug*',
        permanent: true,
      },
      {
        source: '/products/categories/:slug*',
        destination: '/products/category/:slug*',
        permanent: true,
      },
      {
        source: '/products/brands/:slug*',
        destination: '/products/brand/:slug*',
        permanent: true,
      },
      {
        source: '/products/category',
        destination: '/products/categories',
        permanent: true,
      },
      {
        source: '/admin/login',
        destination: '/auth/admin/login',
        permanent: true,
      },
      {
        source: '/login/customer',
        destination: '/auth/customer/login',
        permanent: true,
      },
      {
        source: '/login/admin',
        destination: '/auth/admin/login',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/account',
        permanent: true,
      },
    ];
  },
  images: {
    // Disable optimization in development to prevent timeout errors
    unoptimized: process.env.NODE_ENV === 'development',
    
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.bzion.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.legal500.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.bofikng.com',
        pathname: '/**',
      },
    ],
    // Cache optimized images for 1 year in production
    minimumCacheTTL: 31536000,
    // Improved device sizes for better responsiveness
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 80, 85],
    dangerouslyAllowSVG: true,
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "bzion",
  project: "bzion-hub",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from visitors
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with self-hosted Sentry Plants)
  // See https://docs.sentry.io/product/crons/ for more information.
  automaticVercelMonitors: true,
});
