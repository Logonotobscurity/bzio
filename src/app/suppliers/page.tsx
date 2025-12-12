
import SupplierTools from "@/components/supplier-tools";
import { PageHero } from "@/components/layout/PageHero";

export default function SuppliersPage() {
  return (
    <>
      <PageHero
        title="Supplier Intelligence"
        description="Leverage our AI-powered tools to analyze, classify, and discover the best suppliers for your business needs. Make data-driven decisions to build a stronger, more reliable supply chain."
        primaryCta={{ text: 'Analyze a Supplier', href: '#supplier-tools' }}
        secondaryCta={{ text: 'Find Suppliers', href: '#supplier-tools' }}
      />
      <div className="border-b-2 border-slate-200"></div>
      <div id="supplier-tools" className="py-section-lg px-container-px">
        <div className="container-constrained">
          <div className="mt-xl max-w-4xl mx-auto">
            <SupplierTools />
          </div>
        </div>
      </div>
    </>
  );
}
