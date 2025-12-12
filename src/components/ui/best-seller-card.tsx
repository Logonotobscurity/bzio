
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Product, Category } from '@/lib/schema';
import { Star, Package, ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatters';

interface BestSellerCardProps {
  product: Product & { category?: Pick<Category, 'name' | 'slug'> };
}

export const BestSellerCard = ({ product }: BestSellerCardProps) => {
  const imageUrl = product.imageUrl || '/api/placeholder/400/500';

  return (
    <Card className="flex flex-col h-full overflow-hidden bg-white border border-slate-200">
      <CardHeader className="p-0">
            <div className="relative aspect-video w-full">
                <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute top-4 left-4">
                    {product.category && (
                        <Badge variant="default" className="bg-primary text-primary-foreground">
                            {product.category.name}
                        </Badge>
                    )}
                </div>
                <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="font-bold text-lg md:text-xl text-white line-clamp-2">
                        {product.name}
                    </h3>
                </div>
            </div>
        </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
            <div className="flex justify-between items-start mb-3">
                <p className="text-lg font-bold text-slate-800">{formatPrice(product.price ?? 0)}</p>
                <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm text-slate-600 font-medium">{(product.rating ?? 0).toFixed(1)}</span>
                </div>
            </div>
            <p className="text-sm text-slate-500 line-clamp-2 flex-grow">{product.description}</p>
            {(product.moq ?? 0) > 1 && (
                <div className="pt-3 mt-auto">
                    <Badge variant="outline" className="w-full justify-center text-emerald-600 border-emerald-300 bg-emerald-50">
                        <Package className="h-4 w-4 mr-2" />
                        Bulk orders available (MOQ: {product.moq ?? 1})
                    </Badge>
                </div>
            )}
        </CardContent>
      <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
            <Button asChild size="sm">
                <Link href={`/products/${product.slug}`}>
                    View Product
                </Link>
            </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/checkout?productId=${product.id}`}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Quote
            </Link>
          </Button>
      </div>
    </Card>
  );
};
