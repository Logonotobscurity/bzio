
import Link from 'next/link';
import { Category } from '@/lib/schema';
import { Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  category: Pick<Category, 'slug' | 'name'>;
  className?: string;
}

export const CategoryBadge = ({ category, className }: CategoryBadgeProps) => {
  return (
    <Link 
      href={`/products/category/${category.slug}`}
      className={cn(
        'inline-flex items-center bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full',
        'transition-colors hover:bg-blue-200 hover:text-blue-900',
        className
      )}
    >
      <Tag className="h-3.5 w-3.5 mr-1.5" />
      {category.name}
    </Link>
  );
};
