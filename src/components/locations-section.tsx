
"use client";

import { Button } from "@/components/ui/button";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { MapPin } from "lucide-react";
import { useRef } from "react";
import Link from 'next/link';
import { Section } from "./ui/section";

export function LocationsSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
      },
    }),
    hidden: {
      y: 20,
      opacity: 0,
    },
  };
  const textVariants = {
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
      },
    }),
    hidden: {
      opacity: 0,
    },
  };
  return (
    <Section
       ref={heroRef}
       className="relative text-white"
       aria-labelledby="about-heading"
      style={{
        backgroundImage: "url('https://i.ibb.co/xtK02Nvm/e.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-primary/80"></div>
      <div className="relative">
        <div className="flex flex-col items-start gap-8 max-w-4xl">
          <div className="flex-1 space-y-8">
            <div>
              <TimelineContent
                animationNum={0}
                timelineRef={heroRef}
                customVariants={revealVariants}
              >
                <div className="w-12 md:w-[60px] h-1 bg-accent mb-4"></div>
                <h3 className="text-sm uppercase tracking-[1px] text-accent font-semibold mb-8">Our Reach</h3>
              </TimelineContent>

              <TimelineContent
                id="about-heading"
                animationNum={0.5}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-3xl sm:text-4xl font-bold text-white"
              >
                Whether you operate in major cities or local markets, BZION ensures your business has reliable access to products and seamless delivery every step of the way.
              </TimelineContent>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-between items-center w-full">
              <TimelineContent
                animationNum={4}
                timelineRef={heroRef}
                customVariants={textVariants}
                className="text-base"
              >
                <div className="font-medium text-slate-100 mb-1 capitalize">
                  Searching for a Trusted Food Distributor?
                </div>
                <div className="text-slate-300 font-semibold uppercase tracking-wider">
                  We've got you covered
                </div>
              </TimelineContent>

                <TimelineContent
                  animationNum={5}
                  timelineRef={heroRef}
                  customVariants={textVariants}
                >
                   <Button asChild size="lg" variant="secondary" className="gap-2">
                    <Link href="/contact">
                      Find Our Distribution Hubs <MapPin className="h-5 w-5" />
                    </Link>
                  </Button>
                </TimelineContent>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
