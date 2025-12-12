'use client';

import { type Product } from '@/lib/schema';
import { ProductCard } from './product-card';
import { GsapScrollTrigger } from './ui/GsapScrollTrigger';

interface ProductGridProps {
  products: Product[];
  columns?: number;
  gap?: string;
}

export const ProductGrid = ({ 
  products, 
  columns = 4,
  gap = 'gap-fluid-sm'
}: ProductGridProps) => {
  const gridColsClass = {
    2: 'grid-cols-2 md:grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }[columns] || 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No products available</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridColsClass} ${gap} mt-12 w-full`}>
      {products.map((product, index) => (
        <GsapScrollTrigger key={product.id}>
          <ProductCard product={product} priority={index < 8} />
        </GsapScrollTrigger>
      ))}
    </div>
  );
};
