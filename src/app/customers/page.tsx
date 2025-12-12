
import { CustomerSegments } from '@/components/customer-segments';
import { PageHero } from '@/components/layout/PageHero';
import { Section } from '@/components/ui/section';
import { CTASection } from '@/components/cta-section';

export default function CustomersPage() {
  return (
    <>
      <PageHero
        title="Solutions for Every Business"
        description="From local retailers to large institutions, BZION provides tailored procurement solutions to meet the unique needs of your business. Discover how we can support your growth."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Customers', href: '/customers' },
        ]}
        primaryCta={{ text: 'Partner With Us', href: '/contact' }}
      />
      <div className="border-b-2 border-slate-200"></div>
      <CustomerSegments />
      <Section className="py-16">
        <CTASection
          title="Ready to Grow Your Business?"
          description="Join hundreds of retailers, wholesalers, and businesses across Nigeria who trust BZION. Our team is ready to create a custom solution for your unique needs."
          ctaText="Partner With Us"
          ctaHref="/contact"
        />
      </Section>
    </>
  );
}
