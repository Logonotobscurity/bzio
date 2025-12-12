
'use client';

import Image from 'next/image';
import { type Product } from '@/lib/schema';
import Link from 'next/link';
import { Card } from './ui/card';
import { getPlaceholderImage } from '@/lib/placeholder-images';


// The product prop is an enriched product with a category object
interface BestSellerProductCardProps {
    product: Product & { category: { name: string; slug: string; } };
    priority?: boolean;
}

const styles = {
    container: "group relative flex h-full flex-col overflow-hidden bg-white border border-slate-200",
    imageWrapper: "relative w-full h-[200px] sm:h-[220px] bg-white overflow-hidden",
    image: "object-contain",
    content: "flex-grow flex flex-col p-4 text-left",
    title: "text-base font-bold text-slate-800 line-clamp-2 leading-snug",
    brand: "mt-1 text-sm text-slate-500 line-clamp-1",
    category: "text-xs font-semibold text-sky-600 uppercase mt-2"
};

export const BestSellerProductCard = ({ 
    product, 
    priority = false,
}: BestSellerProductCardProps) => {
    const href = '/products';
    const fallbackImage = getPlaceholderImage('fallback');
    
    const getProductImage = () => {
        if (product.imageUrl && product.imageUrl !== '/images/placeholder.jpg') {
            return product.imageUrl;
        }
        if (Array.isArray(product.images) && product.images.length > 0) {
            return product.images[0];
        }
        return fallbackImage;
    };
    
    const imageUrl = getProductImage();

    return (
        <Link href={href} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            <Card className={styles.container}>
                <div className={styles.imageWrapper}>
                    <Image 
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className={styles.image}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={priority}
                        quality={80}
                        onError={(e) => { e.currentTarget.src = fallbackImage; }}
                    />
                </div>
                
                <div className={styles.content}>
                    {/* <h3 className={styles.title}>{product.name}</h3> */}
                    {/* <p className={styles.brand}>{product.brand}</p> */}
                    <p className={styles.category}>{product.category.name}</p>
                </div>
            </Card>
        </Link>
    );
}
