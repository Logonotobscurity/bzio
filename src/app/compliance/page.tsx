
import { PageHero } from '@/components/layout/PageHero';
import { Section } from '@/components/ui/section';
import { ShieldCheck } from 'lucide-react';

export default function CompliancePage() {
  return (
    <>
      <PageHero
        title="Compliance & Quality Assurance"
        description="Our commitment to quality and safety is unwavering. We adhere to the highest standards to ensure every product we deliver is authentic and NAFDAC-certified."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Compliance', href: '/compliance' },
        ]}
      />
      <div className="border-b-2 border-slate-200"></div>
      <Section>
        <div className="text-center">
            <ShieldCheck className="mx-auto h-16 w-16 text-primary mb-4" />
            <h2 className="text-3xl font-bold text-primary mb-4">Our Commitment to Excellence</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
                Information about our compliance certifications and quality assurance processes will be available here soon. We are dedicated to transparency and providing our partners with complete peace of mind.
            </p>
        </div>
      </Section>
    </>
  );
}
