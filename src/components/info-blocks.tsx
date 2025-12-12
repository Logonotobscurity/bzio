
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SectionHeading, SectionTitle } from '@/components/ui/section';
import { getInfoSections } from '@/services/infoService';
import { Warehouse, Truck, RefreshCw, Star, PackageCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GsapScrollTrigger } from '@/components/ui/GsapScrollTrigger';

const iconMap = {
    Warehouse,
    Truck,
    RefreshCw,
    Star,
    PackageCheck
};

interface ImageInfo {
    imageUrl: string;
    description: string;
    imageHint: string;
}

interface FeatureInfo {
    icon: keyof typeof iconMap;
    title: string;
    description: string;
}

interface ClosingInfo {
    title: string;
    description: string;
    cta: {
        text: string;
        href: string;
    }
}

export interface InfoBlockProps {
    id?: string;
    preamble: string;
    title: string;
    description: string;
    features: {
        items: FeatureInfo[];
    };
    closing?: ClosingInfo;
    images: ImageInfo[];
    align: 'left' | 'right';
    isDark: boolean;
}

export const InfoBlock = ({ preamble, title, description, features, closing, images, align, isDark }: InfoBlockProps) => {
    const textContent = (
    <div className={cn(
        "col-span-12 md:col-span-5 flex flex-col justify-center",
        align === 'left' ? 'md:col-start-8' : 'md:col-start-1',
        "px-3 sm:px-4 md:px-0 mb-6 md:mb-0"
    )}>
      <GsapScrollTrigger>
        <SectionHeading className="!text-left">
            <p className={cn("text-xs sm:text-sm font-bold tracking-widest uppercase mb-3 sm:mb-4", isDark ? "text-accent" : "text-primary")}>{preamble}</p>
            <SectionTitle dangerouslySetInnerHTML={{ __html: title }} className={cn("text-2xl sm:text-3xl md:text-4xl leading-tight", isDark && "!text-white")} />
        </SectionHeading>
        <p className={cn("text-sm sm:text-base md:text-lg mb-6 md:mb-8 font-light leading-relaxed", isDark ? 'text-slate-300' : 'text-slate-600')}>
            {description}
        </p>
        <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
            {features.items.map((feature, index) => {
            const Icon = iconMap[feature.icon];
            return (
                <div key={index} className="flex items-start gap-3 md:gap-4">
                <div className="flex-shrink-0 mt-0.5 md:mt-1">
                    <Icon className={cn("h-5 w-5 md:h-6 md:w-6", isDark ? "text-accent" : "text-primary")} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className={cn("font-semibold text-sm sm:text-base md:text-lg leading-tight", isDark ? 'text-white' : 'text-foreground')}>{feature.title}</h4>
                    <p className={cn("font-light mt-1 text-xs sm:text-sm md:text-base leading-relaxed", isDark ? 'text-slate-300' : 'text-slate-600')}>{feature.description}</p>
                </div>
                </div>
            );
            })}
        </div>
        {closing && (
            <div className="space-y-3 md:space-y-4">
                <h4 className={cn("font-semibold text-base sm:text-lg md:text-xl", isDark ? 'text-white' : 'text-foreground')}>{closing.title}</h4>
                <p className={cn("text-sm sm:text-base md:text-lg font-light leading-relaxed", isDark ? 'text-slate-300' : 'text-slate-600')}>
                    {closing.description}
                </p>
                <Button asChild variant={isDark ? 'secondary' : 'default'} size="lg" className="w-full sm:w-auto">
                    <Link href={closing.cta.href}>
                        {closing.cta.text}
                    </Link>
                </Button>
            </div>
        )}
      </GsapScrollTrigger>
    </div>
  );
    const imageGrid = (
    <div className={cn(
        "col-span-12 md:col-span-6",
        align === 'left' ? 'md:col-start-1' : 'md:col-start-7',
        "px-2 sm:px-3 md:px-0"
    )}>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            {images.map((image, index) => (
                <GsapScrollTrigger key={index}>
                    <div className="relative w-full aspect-square min-h-[140px] sm:min-h-[180px] md:min-h-[200px]">
                        <Image
                            src={image.imageUrl}
                            alt={image.description}
                            fill
                            className="object-cover rounded-lg"
                            sizes="(max-width: 640px) 45vw, (max-width: 768px) 48vw, (max-width: 1024px) 35vw, 30vw"
                            priority={index === 0}
                            data-ai-hint={image.imageHint}
                        />
                    </div>
                </GsapScrollTrigger>
            ))}
        </div>
    </div>
  );
    return (
    <div className="grid grid-cols-12 gap-x-gap-md gap-y-gap-lg md:gap-y-0 items-start md:items-center">
        {align === 'left' ? (
            <>
                {imageGrid}
                <div className="hidden md:block md:col-start-7"></div>
                {textContent}
            </>
        ) : (
            <>
                {textContent}
                <div className="hidden md:block md:col-start-6"></div>
                {imageGrid}
            </>
        )}
    </div>
  );
};


const InfoBlocks = () => {
    const sections = getInfoSections();

    return (
        <div className="flex flex-col">
            {sections.map(section => {
                const isDark = section.bgColor.includes('bg-primary');
                return (
                    <section key={section.id} aria-labelledby={`info-section-title-${section.id}`} className={cn(section.bgColor, 'py-section-md')}>
                        <div className="container mx-auto px-container-px">
                           <InfoBlock {...section} isDark={isDark} />
                        </div>
                    </section>
                )
            })}
        </div>
    );
};

export default InfoBlocks;
