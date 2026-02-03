
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, ExternalLink, Package, ArrowRight } from 'lucide-react';
import { formatPrice as formatPriceService } from '@/services/pricing';

export interface BrandCardData {
  id: string | number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  brand_description?: string | null;
  isFeatured?: boolean;
  productCount?: number;
  categories?: { name: string; slug: string }[];
  priceRange?: { min: number; max: number };
  companyName?: string | null;
  companySlug?: string | null;
}

interface BrandCardProps {
  brand: BrandCardData;
  variant?: 'simple' | 'detailed' | 'compact' | 'minimal';
  className?: string;
  showPricing?: boolean;
  showQuoteButton?: boolean;
}

export function BrandCard({
  brand,
  variant = 'simple',
  className = '',
  showPricing = true,
  showQuoteButton = true
}: BrandCardProps) {
  const brandNameForUrl = encodeURIComponent(brand.name);
  const formatPrice = (price: number) => formatPriceService(price, 'NGN');

  // Minimal variant (often used in grids where space is tight)
  if (variant === 'minimal') {
    return (
      <div className={`flex flex-col h-full gap-2 ${className}`}>
        <Link href={`/products/brand/${brand.slug}`} className="flex-1">
          <Card className="group block overflow-hidden rounded-lg border border-slate-200 transition-all duration-200 h-full flex flex-col hover:shadow-md hover:border-primary/30">
              <div className="relative h-24 sm:h-28 bg-white flex-grow flex items-center justify-center overflow-hidden">
                  <Image
                      src={brand.imageUrl || '/images/placeholder.jpg'}
                      alt={`${brand.name} logo`}
                      fill
                      className="object-contain p-2 sm:p-3 group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 20vw"
                  />
              </div>
              <div className="p-2 border-t bg-slate-50/70">
                  <h3 className="text-xs font-semibold text-slate-800 text-center truncate">{brand.name}</h3>
                  {brand.productCount !== undefined && (
                    <div className="text-[10px] text-slate-500 text-center mt-0.5">
                        {brand.productCount} products
                    </div>
                  )}
              </div>
          </Card>
        </Link>
        {showQuoteButton && (
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="w-full text-[10px] h-7 px-1"
          >
            <Link href={`/checkout?brand=${brandNameForUrl}`}>
              <MessageSquare className="w-3 h-3 mr-1" />
              <span>Quote</span>
            </Link>
          </Button>
        )}
      </div>
    );
  }

  // Detailed variant (used in search results or brand listings)
  if (variant === 'detailed') {
    return (
      <Card className={`flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20 ${className}`}>
        <CardHeader className="p-4 bg-white border-b relative">
          {brand.isFeatured && (
            <Badge className="absolute top-2 right-2 z-10 bg-primary text-white text-[10px]">Featured</Badge>
          )}
          <div className="relative w-full h-32 mx-auto">
            <Image
              src={brand.imageUrl || '/images/placeholder.jpg'}
              alt={`${brand.name} logo`}
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, 300px"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <h3 className="text-lg font-bold text-slate-800 mb-1">{brand.name}</h3>

          {brand.companyName && (
            <p className="text-xs text-slate-500 mb-2">
              By: <Link href={`/companies/${brand.companySlug}`} className="hover:underline text-primary font-medium">{brand.companyName}</Link>
            </p>
          )}

          {brand.categories && brand.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
                {brand.categories.slice(0, 2).map(cat => (
                    <Badge key={cat.slug} variant="secondary" className="text-[10px] px-1.5 py-0">{cat.name}</Badge>
                ))}
            </div>
          )}

          {brand.brand_description && (
            <p className="text-slate-600 text-xs line-clamp-2 mb-3 italic">
              {brand.brand_description}
            </p>
          )}

          <div className="space-y-1.5 mt-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Package className="w-3.5 h-3.5 text-primary/60" />
                <span>{brand.productCount || 0} Products</span>
              </div>

              {showPricing && brand.priceRange && brand.priceRange.min > 0 && (
                <div className="text-xs font-medium text-slate-800">
                  <span className="text-slate-500 font-normal">Starting from:</span> {formatPrice(brand.priceRange.min)}
                </div>
              )}
          </div>
        </CardContent>
        <CardFooter className="p-3 bg-slate-50/70 border-t">
          <div className="grid grid-cols-2 gap-2 w-full">
              <Button asChild size="sm" variant="default" className="h-8 text-xs">
                  <Link href={`/products/brand/${brand.slug}`}>Products</Link>
              </Button>
              {showQuoteButton && (
                <Button asChild variant="secondary" size="sm" className="h-8 text-xs">
                    <Link href={`/checkout?brand=${brandNameForUrl}`}>Quote</Link>
                </Button>
              )}
          </div>
        </CardFooter>
      </Card>
    );
  }

  // Simple / Default variant
  return (
    <Link href={`/products/brand/${brand.slug}`} className={`group block h-full ${className}`}>
      <Card className="bg-white rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 h-full flex flex-col border-slate-200 group-hover:border-primary/30">
        {/* Image Container */}
        <div className="relative w-full h-48 sm:h-56 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
          {brand.isFeatured && (
            <Badge className="absolute top-3 right-3 z-10 bg-primary text-white">Featured</Badge>
          )}
          <Image
            src={brand.imageUrl || '/images/placeholder.jpg'}
            alt={`${brand.name} logo`}
            fill
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        </div>

        {/* Content Container */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-base font-bold text-primary line-clamp-1 group-hover:text-primary-dark transition-colors">
              {brand.name}
            </h3>
            {brand.productCount !== undefined && (
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-medium">
                {brand.productCount} SKUs
              </span>
            )}
          </div>

          {brand.brand_description && (
            <p className="text-slate-600 text-xs line-clamp-3 flex-1 mb-3">
              {brand.brand_description}
            </p>
          )}

          <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-primary group-hover:text-primary-dark inline-flex items-center gap-1">
              View Collection
              <ArrowRight className="w-3 h-3 ml-0.5 group-hover:translate-x-1 transition-transform" />
            </span>
            {showQuoteButton && (
              <div className="text-[10px] text-slate-400">
                Quotes Available
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
