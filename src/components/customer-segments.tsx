'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { findImage } from '@/lib/placeholder-images';
import { CUSTOMER_SEGMENTS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Section, SectionHeading, SectionTitle } from '@/components/ui/section';
import { AnimatedDiv } from '@/components/animated-div';
import { type LucideIcon } from 'lucide-react';

const FeatureIcon = ({ icon: Icon, label }: { icon: LucideIcon; label: string }) => (
    <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/5 border-2 border-primary/10 mb-4">
            <Icon className="w-8 h-8 text-primary" />
        </div>
        <p className="font-semibold text-primary text-sm">{label}</p>
    </div>
)

export const CustomerSegments = () => {
    return (
        <Section className="bg-slate-50/80">
           <div className="space-y-20">
             {CUSTOMER_SEGMENTS.map((segment, index) => {
                const image = findImage(segment.imageId);
                return (
                    <AnimatedDiv key={segment.title} delay={index * 0.1}>
                        <div id={segment.imageId} className={cn(
                            "grid md:grid-cols-2 gap-12 md:gap-16 items-center",
                            index % 2 !== 0 && "md:grid-flow-col-dense"
                        )}>
                            <div className={cn(index % 2 !== 0 && "md:col-start-2")}>
                                <SectionHeading className="!text-left">
                                    <p className="text-sm font-bold tracking-widest text-secondary uppercase">{segment.preamble}</p>
                                    <SectionTitle className="!text-left">{segment.title}</SectionTitle>
                                </SectionHeading>
                                <p className="mt-4 text-lg text-slate-600">
                                    {segment.description}
                                </p>
                                <div className="grid grid-cols-3 gap-6 my-8">
                                    {segment.features.map(feature => (
                                        <FeatureIcon key={feature.label} icon={feature.icon} label={feature.label} />
                                    ))}
                                </div>
                                <Button asChild size="lg">
                                    <Link href="/contact">Partner With Us</Link>
                                </Button>
                            </div>
                            <div className={cn("relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg p-2 bg-slate-50 border border-slate-200", index % 2 !== 0 && "md:col-start-1")}>
                                <Image
                                    src={image.imageUrl}
                                    alt={image.description || segment.title}
                                    fill
                                    className="object-cover rounded-xl"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    data-ai-hint={image.imageHint}
                                    unoptimized
                                />
                            </div>
                        </div>
                    </AnimatedDiv>
                )
            })}
           </div>
        </Section>
    )
}
