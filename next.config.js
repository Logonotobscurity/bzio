/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ];
  },
  images: {
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
    qualities: [75, 80, 85],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
