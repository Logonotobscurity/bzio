
import { PageHero } from '@/components/layout/PageHero';
import { Section } from '@/components/ui/section';

export default function CareersPage() {
  return (
    <>
      <PageHero
        title="Join Our Team"
        description="We are always looking for passionate and talented individuals to join our mission of revolutionizing Nigeria's food supply chain. Explore our open positions and find your place at BZION."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Careers', href: '/careers' },
        ]}
      />
      <div className="border-b-2 border-slate-200"></div>
      <Section>
        <div className="text-center">
            <h2 className="text-3xl font-bold text-primary mb-4">Current Openings</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
                Thank you for your interest in a career at BZION. We do not have any open positions at the moment, but please check back soon.
            </p>
        </div>
      </Section>
    </>
  );
}
