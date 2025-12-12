
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface Brand {
  id: string | number;
  name: string;
  slug: string;
  imageUrl?: string;
}

interface BrandCardProps {
  brand: Brand;
  productCount: number;
  categoryCount?: number;
}

export function BrandCard({ brand, productCount }: BrandCardProps) {
  const brandNameForUrl = encodeURIComponent(brand.name);
  
  return (
    <div className="flex flex-col h-full gap-2">
      <Link href={`/products/brand/${brand.slug}`} className="flex-1">
        <Card className="group block overflow-hidden rounded-lg border border-slate-200 transition-colors duration-200 h-full flex flex-col hover:shadow-md">
            <div className="relative h-24 sm:h-28 md:h-32 bg-white flex-grow flex items-center justify-center">
                <Image 
                    src={brand.imageUrl || '/images/placeholder.jpg'} 
                    alt={`${brand.name} logo`} 
                    fill 
                    className="object-contain p-2 sm:p-3 md:p-4"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 20vw, 15vw"
                />
            </div>
            <div className="p-2 sm:p-2.5 md:p-3 border-t bg-slate-50/70">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-800 text-center truncate">{brand.name}</h3>
                <div className="text-xs text-slate-500 text-center mt-0.5 sm:mt-1 line-clamp-2">
                    {productCount} products
                </div>
            </div>
        </Card>
      </Link>
      
      {/* Request Quote Button */}
      <Button 
        asChild 
        variant="secondary" 
        size="sm" 
        className="w-full text-xs sm:text-sm h-8 sm:h-9"
      >
        <Link href={`/checkout?brand=${brandNameForUrl}`}>
          <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
          <span>Request Quote</span>
        </Link>
      </Button>
    </div>
  );
}
