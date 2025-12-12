
'use client';

import Image from 'next/image';
import { type Category } from '@/lib/schema';
import Link from 'next/link';
import { getPlaceholderImage } from '@/lib/placeholder-images';

interface SimplifiedCategoryCardProps {
    category: Category;
}

export const SimplifiedCategoryCard = ({ category }: SimplifiedCategoryCardProps) => {
    const href = category.slug ? `/categories/${category.slug}` : '#';
    const fallbackImage = getPlaceholderImage(category.id);
    
    const getCategoryImage = () => {
        if (category.imageUrl) {
            return category.imageUrl;
        }
        const categoryImage = getPlaceholderImage(category.id);
        return categoryImage ? categoryImage : fallbackImage;
    };
    
    const imageUrl = getCategoryImage();

    return (
        <Link 
            href={href}
            className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl transition-all"
            aria-label={`View products in the ${category.name} category`}
        >
            <div className="relative flex flex-col h-full overflow-hidden bg-white border rounded-xl shadow-sm border-slate-200/60 will-change-transform">
                <div className="relative flex items-center justify-center w-full h-[280px] p-5 overflow-hidden border-b bg-white border-slate-200/60">
                    <Image 
                        src={imageUrl}
                        alt={`Image for ${category.name}`}
                        width={240}
                        height={240}
                        className="object-contain w-full h-full max-w-[240px] max-h-[240px] transition-transform duration-300"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = fallbackImage;
                        }}
                    />
                </div>
                <div className="flex-grow flex items-center justify-center p-4">
                    <h3 className="font-bold text-center text-primary text-base leading-snug break-words">
                        {category.name}
                    </h3>
                </div>
            </div>
        </Link>
    );
}
