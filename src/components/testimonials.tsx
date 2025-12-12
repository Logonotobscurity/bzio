
'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Section, SectionHeading, SectionTitle, SectionDescription } from '@/components/ui/section';
import { Card, CardContent } from '@/components/ui/card';
import { TESTIMONIALS } from '@/lib/config/constants';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Quote } from 'lucide-react';
import { GsapScrollTrigger } from '@/components/ui/GsapScrollTrigger';

const Testimonials = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });

    const scrollPrev = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    return (
        <Section className="bg-slate-50/80 py-12 sm:py-16 md:py-20">
            <GsapScrollTrigger>
                <SectionHeading>
                    <SectionTitle className="text-2xl sm:text-3xl md:text-4xl leading-tight">What Our Partners Are Saying</SectionTitle>
                    <SectionDescription className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                        Real stories from businesses that trust BZION to power their growth.
                    </SectionDescription>
                </SectionHeading>
            </GsapScrollTrigger>

            <GsapScrollTrigger delay={0.1}>
                <div className="mt-8 sm:mt-10 md:mt-12">
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex -ml-2 sm:-ml-3 md:-ml-4">
                            {TESTIMONIALS.map((testimonial, index) => (
                                <div key={index} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] pl-2 sm:pl-3 md:pl-4">
                                    <Card className="h-full flex flex-col justify-between p-4 sm:p-5 md:p-6 bg-white shadow-lg border-secondary/20 min-h-[280px]">
                                        <CardContent className="p-0">
                                            <Quote className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-secondary mb-3 sm:mb-4" />
                                            <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-4 md:mb-6 italic leading-relaxed">"{testimonial.quote}"</p>
                                        </CardContent>
                                        <div className="text-right">
                                            <p className="font-bold text-primary text-sm sm:text-base">{testimonial.author}</p>
                                            <p className="text-xs sm:text-sm text-slate-500">{testimonial.company}</p>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </GsapScrollTrigger>

             <GsapScrollTrigger delay={0.2}>
                <div className="flex justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                    <Button variant="outline" size="icon" onClick={scrollPrev} className="h-10 w-10 md:h-11 md:w-11">
                        <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={scrollNext} className="h-10 w-10 md:h-11 md:w-11">
                        <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                </div>
            </GsapScrollTrigger>
        </Section>
    );
};

export default Testimonials;
