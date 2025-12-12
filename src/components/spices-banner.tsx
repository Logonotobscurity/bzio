import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { SectionTitle } from "@/components/ui/section";

export const SpicesBanner = () => {
  return (
    <section className="bg-zinc-100 py-8 sm:py-12 md:py-16">
      <div className="container-constrained grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0 items-center">
        <div className="relative h-[250px] sm:h-[350px] md:h-[500px] order-2 md:order-1">
          <Image
            src="https://i.ibb.co/hxRNVf7X/banner-2.png"
            alt="A variety of colorful spices"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
            priority={false}
            data-ai-hint="colorful spices"
          />
        </div>
        <div className="flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 order-1 md:order-2">
          <div className="max-w-md text-left w-full px-2 sm:px-0">
            <SectionTitle className="leading-tight text-2xl sm:text-3xl md:text-4xl">
              The Art of Flavor: Seasonings & Enhancers
            </SectionTitle>
            <p className="mt-3 sm:mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
              Unlock culinary creativity with our comprehensive portfolio of
              seasonings, spices, and flavor enhancers, designed to deliver
              authentic, consistent, and memorable taste profiles for any
              application.
            </p>
            <div className="mt-6 sm:mt-8">
              <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                <Link href="/products/category/seasonings-flavor">
                  Discover Seasonings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
