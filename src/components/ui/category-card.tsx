
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EnrichedCategoryData } from '@/services/productService';
import { Package } from 'lucide-react';

interface CategoryCardProps {
  category: EnrichedCategoryData;
}

const CategoryStat = ({ value, label }: { value: string | number; label: string }) => (
    <div className="text-center">
        <p className="font-bold text-sm sm:text-base text-slate-800">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
    </div>
);

export const CategoryCard = ({ category }: CategoryCardProps) => {
    const imageUrl = category.imageUrl || `/api/placeholder/400/400`;

    return (
        <Card className="flex flex-col h-full overflow-hidden bg-white border border-slate-200/80 rounded-xl shadow-sm">
            <CardHeader className="p-0">
                <div className="relative h-32 w-full bg-gradient-to-br from-slate-50 to-slate-100">
                    <Image
                        src={imageUrl}
                        alt={`Image for ${category.name}`}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                </div>
            </CardHeader>
            
            <CardContent className="p-3 flex-grow flex flex-col">
                <h3 className="font-bold text-sm text-primary mb-2 line-clamp-2">
                    {category.name}
                </h3>
                
                <div className="grid grid-cols-3 gap-1 mb-3">
                    <CategoryStat value={category.productCount} label="Products" />
                    <CategoryStat value={category.brandCount} label="Brands" />
                    <CategoryStat value={category.inStockCount} label="In Stock" />
                </div>

                {category.bulkProductCount > 0 && (
                    <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300 bg-emerald-50">
                        <Package className="h-3 w-3 mr-1" />
                        Bulk Available
                    </Badge>
                )}
            </CardContent>
            
            <div className="p-3 bg-slate-50 border-t border-slate-100">
                <Button asChild size="sm" className="w-full">
                    <Link href={`/products/category/${category.slug}`}>
                        View Products
                    </Link>
                </Button>
            </div>
        </Card>
    );
};
