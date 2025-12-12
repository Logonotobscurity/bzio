
import Link from 'next/link';
import { EnrichedBrandData } from '@/services/productService';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface BrandCardProps {
  brand: EnrichedBrandData;
}

export function BrandCard({ brand }: BrandCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  const brandNameForUrl = encodeURIComponent(brand.name);

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="p-4 bg-white border-b">
        <div className="relative w-full h-32 mx-auto">
          {brand.imageUrl ? (
            <Image 
              src={brand.imageUrl} 
              alt={`${brand.name} logo`} 
              layout="fill" 
              objectFit="contain" 
              className="p-2"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
              <span className="text-sm text-slate-500">No Image</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <h3 className="text-lg font-bold text-slate-800">{brand.name}</h3>
        {brand.companyName && (
          <p className="text-sm text-slate-500 mb-2">
            Owned by: <Link href={`/companies/${brand.companySlug}`} className="hover:underline text-primary">{brand.companyName}</Link>
          </p>
        )}
        <div className="flex flex-wrap gap-1 mb-3">
            {brand.categories.slice(0, 3).map(cat => (
                <Badge key={cat.slug} variant="secondary">{cat.name}</Badge>
            ))}
        </div>
        <div className="text-xs text-slate-600">
            <p>📦 {brand.productCount} {brand.productCount > 1 ? 'Products' : 'Product'}</p>
            {brand.priceRange.min > 0 && (
              <p>Price: {formatPrice(brand.priceRange.min)} - {formatPrice(brand.priceRange.max)}</p>
            )}
        </div>
      </CardContent>
      <CardFooter className="p-2 bg-slate-50/70 border-t">
        <div className="grid grid-cols-2 gap-2 w-full">
            <Button asChild size="sm">
                <Link href={`/products/brands/${brand.slug}`}>View Products</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
                <Link href={`/checkout?brand=${brandNameForUrl}`}>Request Quote</Link>
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
