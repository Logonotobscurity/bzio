
import Image from 'next/image';
import { Section, SectionHeading, SectionTitle, SectionDescription } from '@/components/ui/section';

export function TraceabilitySection() {
  return (
    <Section className="py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-container-px">
        <div className="grid lg:grid-cols-2 gap-x-gap-lg gap-y-gap-md lg:gap-y-0 items-start lg:items-center">
          <div className="max-w-xl px-2 sm:px-0">
            <SectionHeading className="!text-left">
              <SectionTitle className="text-2xl sm:text-3xl md:text-4xl leading-tight">
                With traceability, we show our work.
              </SectionTitle>
              <SectionDescription className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                Many brands aim for "transparency." But when you need a product you can trust right now, vague promises aren't enough. We understand that you need to be confident in the products you bring into your home and you need them delivered with guaranteed quality. That’s why we use Traceability to show our work.
              </SectionDescription>
            </SectionHeading>
          </div>
          <div className="relative mt-8 lg:mt-0 px-2 sm:px-0">
             <h3 className="text-center text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 text-primary">Traceability Map</h3>
            <div className="aspect-[4/3] relative max-w-full">
                <Image
                  src="https://i.ibb.co/cKcvzJrL/traceability-map.png"
                  alt="Traceability Map showing the journey of products from farm to warehouse to business"
                  fill
                  className="object-contain rounded-lg shadow-lg"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 50vw"
                  priority={false}
                  unoptimized
                />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
