
import { PageHero } from '@/components/layout/PageHero';
import { Section } from '@/components/ui/section';
import { getCompanies, getCategories } from '@/services/productService';
import { CompanyCard } from '@/components/CompanyCard';
import { CTASection } from '@/components/cta-section';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function CompaniesPage() {
  const [companies, categories] = await Promise.all([getCompanies(), getCategories()]);
  
  const totalCompanies = companies.length;
  const totalBrands = companies.reduce((sum, c) => sum + c.brandCount, 0);
  const totalProducts = companies.reduce((sum, c) => sum + c.productCount, 0);

  return (
    <>
      <PageHero
        preamble="Partner Network"
        title="Our Trusted Manufacturing Partners"
        description="We partner with Nigeria's leading food manufacturers to deliver authentic, high-quality products across all major categories."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Partners', href: '/companies' },
        ]}
        stats={[
          { label: 'Partners', value: totalCompanies },
          { label: 'Brands', value: totalBrands },
          { label: 'Products', value: totalProducts },
        ]}
      />

      <Section className="bg-slate-50/50 py-16">
        <div className="container mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Find Your Perfect Partner</h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">Quickly find partners by the product categories you are interested in.</p>
            <div className="flex flex-wrap justify-center gap-3">
                {categories.slice(0, 5).map(category => (
                    <Button key={category.id} variant="outline" asChild>
                        <Link href={`/categories/${category.slug}`}>{category.name}</Link>
                    </Button>
                ))}
                 <Button variant="secondary" asChild>
                    <Link href={`/categories`}>View All Categories</Link>
                </Button>
            </div>
        </div>
      </Section>

      <Section className="py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {companies.map(company => (
                <CompanyCard key={company.id} company={company} />
            ))}
        </div>
      </Section>

      <Section className="py-16 bg-slate-50/50">
        <div className="container mx-auto text-center bg-white p-12 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Looking for Something Specific?</h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">Our platform provides multiple ways to find exactly what you need.</p>
            <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg"><Link href="/products">Search Product Database</Link></Button>
                <Button asChild size="lg" variant="outline"><Link href="/categories">View by Category</Link></Button>
                <Button asChild size="lg" variant="secondary"><Link href="/contact">Contact Our Supply Team</Link></Button>
            </div>
        </div>
      </Section>

      <Section className="py-16">
        <CTASection
          title="Become Part of the BZION Network"
          description="Are you a manufacturer looking to expand distribution? Join 15+ trusted partners and reach retailers, wholesalers, institutions, and export buyers across Nigeria."
          ctaText="Apply to Partner with BZION"
          ctaHref="/contact"
        />
      </Section>
    </>
  );
}
