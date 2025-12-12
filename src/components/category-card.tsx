
import Link from 'next/link';
import { Category } from '@/lib/schema';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  const imageUrl = category.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <Link href={`/categories/${category.slug}`} passHref>
      <Card className="block h-full hover:shadow-lg transition-shadow duration-300">
        <div>
          <img src={imageUrl} alt={category.name} className="w-full h-48 object-cover" />
        </div>
        <CardContent className="p-6">
          <CardTitle className="text-xl font-semibold mb-2">{category.name}</CardTitle>
          <div className="text-sm text-slate-500">
            <p>Products: {category.productCount}</p>
            <p>Brands: {category.brandCount}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
