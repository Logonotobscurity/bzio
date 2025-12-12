
import { PageHero } from '@/components/layout/PageHero';
import { Section } from '@/components/ui/section';
import { BrandCard } from '@/components/BrandCard';
import { CTASection } from '@/components/cta-section';
import { getBrandsPageData } from '@/services/productService';
import { notFound } from 'next/navigation';

export default async function AllBrandsPage() {
  const categorizedBrands = await getBrandsPageData();

  if (!categorizedBrands || categorizedBrands.length === 0) {
    notFound();
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Our Brands', href: '/products/brands' },
  ];

  const totalBrands = categorizedBrands.reduce((sum, group) => sum + group.brands.length, 0);
  const totalProducts = categorizedBrands.reduce((sum, group) => 
    sum + group.brands.reduce((brandSum, brand) => brandSum + brand.productCount, 0), 
  0);
  const totalCategories = categorizedBrands.length;

  return (
    <main className="flex-grow">
        <PageHero 
            preamble="Trusted Quality Brands Across Nigeria"
            title="Our Brands"
            description="Discover premium brands across major food categories. From cooking oils and grains to dairy and seasonings—all sourced from Nigeria's leading manufacturers."
            breadcrumbs={breadcrumbItems}
            stats={[
              { label: 'Brands', value: totalBrands, sublabel: 'Top 5 Featured' },
              { label: 'Products', value: totalProducts, sublabel: 'Ready to Order' },
              { label: 'Categories', value: totalCategories, sublabel: 'Oils, Pasta, Dairy' },
            ]}
        />
        
        {categorizedBrands.map((group, index) => (
          <Section key={group.categoryName} className={`py-16 ${index > 0 ? 'border-t border-slate-200' : ''}`}>
            <div className="container mx-auto">
              {/* Visually Improved Category Header (without icons) */}
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">{group.categoryName}</h2>
                <p className="mt-2 text-lg text-slate-500">{group.brands.length} {group.brands.length > 1 ? 'Brands' : 'Brand'} available in this category</p>
                <div className="mx-auto mt-4 h-1 w-24 bg-primary rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {group.brands.map(brand => (
                    <BrandCard key={brand.id} brand={brand} />
                ))}
              </div>
            </div>
          </Section>
        ))}

        <Section className="py-16">
          <CTASection 
            title="Ready to Source Your Products?"
            description="We supply a wide range of food and beverage products from Nigeria's best brands. Contact us today for a custom quote and discover the quality we offer."
            ctaText="Request a Quote"
            ctaHref="/contact"
          />
        </Section>
    </main>
  );
}
