'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface CTASectionProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  customContent?: ReactNode;
  variant?: 'default' | 'minimal' | 'dark';
  className?: string;
}

export function CTASection({
  title = "Still Need Help?",
  description = "Our team is ready to assist you. Reach out with any questions about our products, services, or how we can help grow your business.",
  ctaText = "Get in Touch",
  ctaHref = "/contact",
  customContent,
  variant = 'default',
  className,
}: CTASectionProps) {
  const variantStyles = {
    default: 'bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20',
    minimal: 'bg-slate-50 border border-slate-200',
    dark: 'bg-gradient-to-r from-primary to-secondary text-white',
  };

  const textColor = variant === 'dark' ? 'text-white' : 'text-primary';
  const descriptionColor = variant === 'dark' ? 'text-white/90' : 'text-slate-600';

  return (
    <div className={cn(variantStyles[variant], 'rounded-lg p-8 text-center', className)}>
      {customContent ? (
        customContent
      ) : (
        <>
          <h3 className={cn('text-3xl sm:text-4xl font-bold mb-3', textColor)}>
            {title}
          </h3>
          <p className={cn('max-w-2xl mx-auto mb-6 text-lg sm:text-xl', descriptionColor)}>
            {description}
          </p>
          <Button
            asChild
            size="lg"
            variant={variant === 'dark' ? 'secondary' : 'default'}
            className="font-bold rounded-2xl h-12 px-8 shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Link href={ctaHref}>{ctaText}</Link>
          </Button>
        </>
      )}
    </div>
  );
}
