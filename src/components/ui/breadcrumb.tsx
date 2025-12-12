
'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BreadcrumbItem = {
  label: string;
  href: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
  lightText?: boolean;
};

export const Breadcrumbs = ({ items, className, lightText = true }: BreadcrumbProps) => {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center space-x-2', className)}>
      {items.map((item, index) => (
        <React.Fragment key={`${item.href}-${item.label}`}>
          {index > 0 && <ChevronRight className={cn("h-4 w-4", lightText ? "text-slate-400" : "text-slate-500")} />}
          <Link
            href={item.href}
            className={cn(
              'text-sm font-medium transition-colors',
              index === items.length - 1
                ? (lightText ? 'text-white pointer-events-none' : 'text-primary pointer-events-none')
                : (lightText ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-primary')
            )}
            aria-current={index === items.length - 1 ? 'page' : undefined}
          >
            {item.label}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
};
