'use client';

import { Suspense } from 'react';
// Import Recharts components directly - they're typically bundled in admin dashboards anyway
// and their TypeScript types don't work well with dynamic() wrappers
import { ChartContainer, ChartTooltip, ChartLegend, ChartStyle } from '@/components/ui/chart';

// Export types normally (zero overhead)
export type { ChartConfig } from '@/components/ui/chart';

// Re-export components directly (no need for dynamic loading - they're standard UI components)
export { ChartContainer, ChartTooltip, ChartLegend, ChartStyle };

// Loading skeleton for charts
export function ChartSkeleton() {
  return (
    <div className="h-80 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg animate-pulse">
      <div className="h-full flex items-center justify-center">
        <span className="text-slate-400 text-sm">Loading chart...</span>
      </div>
    </div>
  );
}

// Wrapper for chart suspense boundaries
export function ChartBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      {children}
    </Suspense>
  );
}
