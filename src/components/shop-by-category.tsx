'use client';
import { useState, useEffect } from 'react';
import { Section, SectionHeading, SectionPreamble, SectionTitle, SectionDescription } from '@/components/ui/section';
import { getCategoryPageData, type EnrichedCategoryData } from '@/services/enrichmentService';
import { CategoryCard } from '@/components/ui/category-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function ShopByCategorySection() {
    const [categories, setCategories] = useState<EnrichedCategoryData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const fetchedCategories = await getCategoryPageData();
            setCategories(fetchedCategories || []);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <Section className="bg-primary">
                <div className="text-center text-slate-400">Loading categories...</div>
            </Section>
        )
    }

    return (
        <Section className="bg-primary text-white">
            <SectionHeading>
                <SectionPreamble className="text-accent" />
                <SectionTitle className="!text-white text-3xl sm:text-4xl">View In-Store Products</SectionTitle>
                <SectionDescription className="text-slate-300 text-lg sm:text-xl">
                    Ensure your business has reliable access to trusted, high-quality products. Explore our essential foodstuff and ingredients for all types of operations.
                </SectionDescription>
            </SectionHeading>
            <div className="mt-12">
                <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4 overflow-hidden">
                    {categories.slice(0, 6).map((category: EnrichedCategoryData) => (
                        <CategoryCard 
                            key={category.id} 
                            category={category}
                        />
                    ))}
                </div>
            </div>
             <div className="mt-12 text-center">
                <Button asChild variant="secondary" size="lg">
                    <Link href="/products">
                        View All Products <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </Section>
    );
}
