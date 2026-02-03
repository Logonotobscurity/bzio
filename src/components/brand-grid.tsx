'use client';

import { type Brand } from '@/lib/schema';
import { BrandCard } from '@/components/ui/brand-card';
import { GsapScrollTrigger } from './ui/GsapScrollTrigger';

interface BrandGridProps {
  brands: Brand[];
  isLoading?: boolean;
  columns?: number;
  gap?: string;
}

export const BrandGrid = ({ 
  brands, 
  isLoading = false,
  columns = 4,
  gap = 'gap-8'
}: BrandGridProps) => {
  const gridColsClass = {
    2: 'grid-cols-2 md:grid-cols-2 lg:grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-4',
  }[columns] || 'grid-cols-2 md:grid-cols-4 lg:grid-cols-4';

  if (isLoading) {
    return (
      <div className={`grid ${gridColsClass} ${gap} mt-12`}>
        {Array(4).fill(null).map((_, i) => (
          <div key={i} className="bg-white shadow-md rounded-lg overflow-hidden animate-pulse">
            <div className="h-48 w-full bg-gray-200" />
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No brands available</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridColsClass} ${gap} mt-12`}>
      {brands.map((brand) => (
        <GsapScrollTrigger key={brand.id}>
          <BrandCard brand={brand} />
        </GsapScrollTrigger>
      ))}
    </div>
  );
};
