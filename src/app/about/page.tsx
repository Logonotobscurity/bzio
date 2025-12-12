
import { PageHero } from '@/components/layout/PageHero';
import AboutContent from '@/components/sections/about/AboutContent';
import { Section } from '@/components/ui/section';
import { CTASection } from '@/components/cta-section';
import { Metadata } from 'next';
import { WebPage, BreadcrumbList } from 'schema-dts';

export const metadata: Metadata = {
  title: 'About BZION | Nigeria\'s Most Trusted FMCG Supply Partner',
  description: 'Learn how BZION has become Nigeria\'s leading B2B foodstuff and FMCG distributor. Discover our mission, values, and the team dedicated to empowering your business with authentic products and reliable service.',
};

export default function AboutPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
  ];

  const jsonLd: WebPage = {
    '@type': 'WebPage',
    name: metadata.title as string,
    description: metadata.description as string,
    url: 'https://bzion.vercel.app/about',
  };

  const breadcrumbJsonLd: BreadcrumbList = {
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `https://bzion.vercel.app${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main id="main-content" role="main" className="flex-grow">
        <PageHero
          title="The BZION Story"
          description="BZION is a leading Nigerian distribution partner, connecting businesses to authentic food products from trusted manufacturers and warehouse inventory. We serve bakeries, supermarkets, wholesalers, and other food businesses, providing reliable logistics, flexible sourcing options, and dedicated support to help businesses operate efficiently and grow sustainably."
          breadcrumbs={breadcrumbItems}
        />
        <div className="border-b-2 border-slate-200"></div>
        <AboutContent />
        <Section className="py-16">
          <CTASection
            title="Join the BZION Community"
            description="Whether you're a retail business, wholesaler, or institution, BZION is ready to support your success. Connect with us today and discover the difference reliable partnership makes."
            ctaText="Start Your Journey"
            ctaHref="/contact"
          />
        </Section>
      </main>
    </>
  );
}
