'use client';

import dynamic from 'next/dynamic';

/**
 * Lazy-loaded widget components
 * These are non-critical UI enhancements that can be deferred
 * Uses dynamic() from Next.js to split them into separate chunks
 */

// Lazy load WhatsApp widget (non-critical engagement tool)
export const LazyWhatsappWidget = dynamic(
  () => import('@/components/layout/WhatsappWidget'),
  {
    ssr: false, // Don't render on server
    loading: () => null, // No loading skeleton needed
  }
);

// Lazy load Chat widget (non-critical engagement tool)
export const LazyChatWidget = dynamic(
  () => import('@/components/layout/ClientChatWidget').then(mod => ({
    default: mod.ClientChatWidget
  })),
  {
    ssr: false,
    loading: () => null,
  }
);

// Lazy load Newsletter popup (non-critical, appears after delay)
export const LazyNewsletterPopup = dynamic(
  () => import('@/components/newsletter-popup'),
  {
    ssr: false,
    loading: () => null,
  }
);

// Lazy load Cookie banner (non-critical)
export const LazyCookieBanner = dynamic(
  () => import('@/components/cookie-banner').then(mod => ({
    default: mod.CookieBanner
  })),
  {
    ssr: false,
    loading: () => null,
  }
);

/**
 * Usage in layout.tsx:
 * 
 * Replace direct imports with:
 * import { LazyWhatsappWidget, LazyChatWidget, ... } from '@/components/lazy-widgets';
 * 
 * Then use:
 * <LazyWhatsappWidget />
 * <LazyChatWidget />
 * <LazyNewsletterPopup delay={10000} />
 * <LazyCookieBanner />
 */
