import { Section, SectionHeading, SectionPreamble, SectionTitle, SectionDescription } from '@/components/ui/section';
import { BestSellerProductCard } from '@/components/best-seller-product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { type Product, type Category } from '@/lib/schema';

// Define a type for the enriched product
type EnrichedProduct = Product & { category: Pick<Category, 'name' | 'slug'> };

interface BestSellersSectionProps {
  products: Product[];
  categories: Category[];
}

export function BestSellersSection({ products, categories }: BestSellersSectionProps) {

    const enrichedProducts = products
        .map(product => {
            const category = categories.find(c => c.slug === product.categorySlug);
            if (!category) {
                return null;
            }
            return {
                ...product,
                category: { name: category.name, slug: category.slug },
            };
        })
        .filter((product): product is EnrichedProduct => product !== null);

    if (enrichedProducts.length === 0) {
        return null; // Don't render the section if there are no products to show
    }

    return (
        <Section className="bg-primary text-white">
            <SectionHeading>
                <SectionPreamble className="text-white" />
                <SectionTitle className="!text-white text-3xl sm:text-4xl">View In-Store Products</SectionTitle>
                <SectionDescription className="text-white/90 text-lg sm:text-xl">
                    Ensure your business has reliable access to trusted, high-quality products. Explore our essential foodstuff and ingredients for all types of operations.
                </SectionDescription>
            </SectionHeading>
            <div className="mt-12">
                <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-fluid-sm">
                    {enrichedProducts.map(product => (
                        <BestSellerProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
             <div className="mt-12 text-center">
                <Button asChild variant="secondary" size="lg">
                    <Link href="/products">
                        Explore All Products <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </Section>
    );
}
