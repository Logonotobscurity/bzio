
import Link from 'next/link';
import Image from 'next/image';
import { type Brand } from '@/lib/schema';
import { Badge } from '@/components/ui/badge';

export const BrandCard = ({ brand }: { brand: Brand }) => {
  return (
    <Link href={`/products/brand/${brand.slug}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative w-full h-56 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
          {brand.isFeatured && (
            <Badge className="absolute top-3 right-3 z-10 bg-primary text-white">Featured</Badge>
          )}
          <Image
            src={brand.imageUrl || '/images/placeholder.jpg'}
            alt={`${brand.name} logo`}
            fill
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            quality={85}
            priority={false}
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.target as HTMLImageElement;
              if (target.src !== '/images/placeholder.jpg') {
                target.src = '/images/placeholder.jpg';
              }
            }}
          />
        </div>

        {/* Content Container */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-base font-bold text-primary mb-2 line-clamp-1 group-hover:text-primary-dark transition-colors">
            {brand.name}
          </h3>
          {brand.brand_description && (
            <p className="text-slate-600 text-xs line-clamp-3 flex-1">
              {brand.brand_description}
            </p>
          )}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-1">
              View Products
              <span className="ml-1">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
