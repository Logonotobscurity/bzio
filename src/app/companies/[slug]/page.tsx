
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCompanyBySlug, getProductsByCompanySlug, getBrandsByCompanyId, getCategoriesByCompanyId } from '@/services/productService';
import { Section, SectionHeading, SectionTitle, SectionDescription } from '@/components/ui/section';
import { ProductGrid } from '@/components/product-grid';
import { BrandGrid } from '@/components/brand-grid';
import { CategoryGrid } from '@/components/category-grid';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/layout/PageHero';

interface CompanyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { slug } = await params;

  const company = await getCompanyBySlug(slug);
  if (!company) {
    notFound();
  }

  // Fetch all data in parallel
  const [allCompanyBrands, allCompanyCategories, allCompanyProducts] = await Promise.all([
    getBrandsByCompanyId(company.id),
    getCategoriesByCompanyId(company.id),
    getProductsByCompanySlug(slug)
  ]);

  // Get counts
  const brandCount = allCompanyBrands.length;
  const categoryCount = allCompanyCategories.length;
  const productCount = allCompanyProducts.length;

  // Slice data for grids
  const companyBrandsForGrid = allCompanyBrands.slice(0, 4);
  const companyCategoriesForGrid = allCompanyCategories.slice(0, 4);
  const companyProductsForGrid = allCompanyProducts.slice(0, 4);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Partners', href: '/companies' },
    { label: company.name, href: `/companies/${company.slug}` },
  ];

  return (
    <main className="flex-grow">
      <PageHero
        preamble="Distribution Partner"
        title={company.name}
        description={company.description}
        imageUrl={company.logo}
        breadcrumbs={breadcrumbItems}
        stats={[
          { label: 'Brands Distributed', value: brandCount },
          { label: 'Total Products', value: productCount },
          { label: 'Product Categories', value: categoryCount },
        ]}
        primaryCta={{
          text: 'View All Products',
          href: '/products',
        }}
        secondaryCta={{
          text: 'Contact Partner',
          href: '/contact',
        }}
      />

      <Section id="company-brands" className="py-16 bg-slate-50/50">
          <SectionHeading className="text-center mb-12">
            <SectionTitle>Brands from {company.name}</SectionTitle>
            <SectionDescription>Explore the trusted brands we represent from {company.name}.</SectionDescription>
          </SectionHeading>
        <BrandGrid brands={companyBrandsForGrid} isLoading={false} columns={4} />
        <div className="text-center mt-12">
            <Link href="/brands" passHref>
                <Button size="lg" variant="outline">View All Brands</Button>
            </Link>
        </div>
      </Section>

      <Section id="company-categories" className="py-16">
          <SectionHeading className="text-center mb-12">
            <SectionTitle>Product Categories</SectionTitle>
            <SectionDescription>Discover the range of product categories we distribute for {company.name}.</SectionDescription>
          </SectionHeading>
        <CategoryGrid categories={companyCategoriesForGrid} isLoading={false} columns={4} />
        <div className="text-center mt-12">
            <Link href="/categories" passHref>
                <Button size="lg">View All Categories</Button>
            </Link>
        </div>
      </Section>

      <Section id="company-products" className="py-16 bg-slate-50/50">
          <SectionHeading className="text-center mb-12">
            <SectionTitle>Featured Products</SectionTitle>
            <SectionDescription>Discover the quality products we distribute from {company.name}.</SectionDescription>
          </SectionHeading>
        <ProductGrid products={companyProductsForGrid} columns={4} />
        <div className="text-center mt-12">
            <Link href="/products" passHref>
                <Button size="lg">View All Products</Button>
            </Link>
        </div>
      </Section>
    </main>
  );
}
