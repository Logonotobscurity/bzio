
'use client';
import { useState, useEffect } from 'react';
import { Section, SectionHeading, SectionPreamble, SectionTitle } from '@/components/ui/section';
import { type Brand } from '@/lib/schema';
import Image from 'next/image';
import Link from 'next/link';
import { getAllBrands } from '@/services/brandService';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const BrandLogo = ({ brand }: { brand: Brand }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [brand.imageUrl]);

    if (hasError || !brand.imageUrl) {
        return (
            <div className="flex items-center justify-center h-full bg-slate-200 p-2 rounded-md">
                <span className="text-slate-500 font-medium text-xs text-center">
                    {brand.name}
                </span>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            <Image
                src={brand.imageUrl}
                alt={`${brand.name} logo`}
                fill
                sizes="(max-width: 768px) 33vw, 16vw"
                className="object-contain"
                onError={() => setHasError(true)}
            />
        </div>
    );
};

const BrandLogoCard = ({ brand }: { brand: Brand }) => (
    <Link href={`/products/brand/${brand.slug}`} className="block p-4 border border-slate-200 bg-white group transition-all duration-300 hover:bg-slate-50 shadow-sm hover:border-accent rounded-lg">
        <div className="w-full h-24 relative mb-4">
            <BrandLogo brand={brand} />
        </div>
        <div className="flex items-center justify-center gap-1">
            <h3 className="font-medium text-slate-800 text-sm group-hover:text-primary">{brand.name}</h3>
            <ArrowRight className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-1 group-hover:translate-x-0" />
        </div>
    </Link>
);

export function BrandGrid() {
    const [brands, setBrands] = useState<Brand[]>([]);

    useEffect(() => {
        getAllBrands().then((data) => {
            const normalizedBrands = data.map(b => ({
                ...b,
                id: typeof b.id === 'number' ? String(b.id) : b.id,
            })) as Brand[];
            setBrands(normalizedBrands);
        });
    }, []);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {brands.filter(b => b.isFeatured).slice(0, 8).map((brand) => (
                <BrandLogoCard key={brand.id} brand={brand} />
            ))}
        </div>
    );
}

export function ShopByBrandSection() {
    return (
        <Section className="bg-primary text-white">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-3">
                    <SectionHeading className="!text-left !max-w-full !mx-0">
                        <SectionPreamble className="text-accent">Our Partners</SectionPreamble>
                        <SectionTitle className="!text-white">Shop by Brand</SectionTitle>
                    </SectionHeading>
                    <p className="text-slate-300 mb-6">
                        We partner with Nigeria's most trusted brands to bring you authentic, high-quality products.
                    </p>
                    <Button asChild variant="secondary" size="lg">
                        <Link href="/products">View All Brands <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
                 <div className="md:col-span-9">
                    <BrandGrid />
                </div>
            </div>
        </Section>
    );
}
