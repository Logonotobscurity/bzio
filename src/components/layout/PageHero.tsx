
'use client';

import { Button } from '@/components/ui/button';
import { Breadcrumbs, type BreadcrumbItem } from '../ui/breadcrumb';
import { AnimatedDiv } from '../animated-div';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';

interface PageHeroProps {
  preamble?: string;
  title: string;
  description: string;
  breadcrumbs?: BreadcrumbItem[];
  primaryCta?: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  imageUrl?: string;
  stats?: {
    label: string;
    value: number | string;
    sublabel?: string;
  }[];
  actions?: ReactNode[];
}

export function PageHero({
  preamble,
  title,
  description,
  breadcrumbs,
  primaryCta,
  secondaryCta,
  imageUrl,
  stats,
  actions,
}: PageHeroProps) {
  const hasImage = !!imageUrl;
  const containerClasses = cn(
    'relative container-constrained',
    { 'grid lg:grid-cols-3 gap-12 items-center': hasImage }
  );
  const textContainerClasses = cn(
    'max-w-3xl mx-auto text-center',
    { 'lg:col-span-2 lg:text-left lg:mx-0': hasImage }
  );

  return (
    <header
      className="relative flex flex-col justify-center py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-primary via-primary to-primary/95 text-primary-foreground overflow-hidden"
      role="banner"
      aria-labelledby="hero-heading"
    >
      {/* Enhanced Animated background with multiple layers */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
      >
        {/* Main grid pattern */}
        <div className="absolute inset-0 bg-grid-slate-100/[0.08] [mask-image:linear-gradient(0deg,transparent,black)]" />
        
        {/* Large animated gradient orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-secondary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white/10 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse animation-delay-4000" />
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent" />
      </div>

      <div className={containerClasses}>
        {hasImage && (
          <AnimatedDiv className="relative hidden lg:flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-2xl sm:rounded-3xl blur-2xl opacity-40" />
            <div className="relative w-56 sm:w-64 md:w-72 h-56 sm:h-64 md:h-72 bg-gradient-to-br from-white to-slate-50 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 backdrop-blur-md transform hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-accent/5 rounded-2xl sm:rounded-3xl" />
              <Image
                src={imageUrl}
                alt={`${title} logo`}
                fill
                className="object-contain p-4 sm:p-6 md:p-8 relative z-10"
                sizes="288px"
                priority
              />
            </div>
          </AnimatedDiv>
        )}
        
        <div className={textContainerClasses}>
          <AnimatedDiv>
            <div className={cn('h-1.5 bg-gradient-to-r from-secondary via-white to-accent mb-6 rounded-full', 
              { 'mx-auto w-1/3': !hasImage, 'mx-0 w-24': hasImage }
            )}></div>
          </AnimatedDiv>
          
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} className={cn('mb-6', { 'justify-center': !hasImage, 'justify-start': hasImage })} lightText={true} />}
          
          <AnimatedDiv>
            {preamble && (
              <p className={cn("text-xs md:text-sm font-bold tracking-widest text-secondary/90 uppercase mb-4", 
                { 'text-center': !hasImage, 'text-left': hasImage }
              )}>
                {preamble}
              </p>
            )}
            <h1
              id="hero-heading"
              className={cn("text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight tracking-tight",
                { 'text-center': !hasImage, 'text-left': hasImage }
              )}
            >
              {title}
            </h1>
          </AnimatedDiv>
          
          <AnimatedDiv delay={0.1}>
            <p className={cn('text-sm sm:text-base md:text-lg text-slate-100 mb-6 sm:mb-8 leading-relaxed max-w-2xl text-justify', 
              { 'mx-auto px-2 sm:px-0': !hasImage, 'mx-0 px-0': hasImage }
            )}>
              {description}
            </p>
          </AnimatedDiv>

          {stats && stats.length > 0 && (
            <AnimatedDiv delay={0.2}>
              <div className={cn('grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-8 sm:mb-10 px-2 sm:px-0', {'lg:text-left': hasImage})}>
                {stats.map((stat, index) => (
                  <div 
                    key={index} 
                    className="group relative"
                  >
                    {/* Background card with gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-white/5 rounded-lg sm:rounded-2xl border border-white/30 group-hover:border-white/60 transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-white/25 group-hover:to-white/10 backdrop-blur-md shadow-lg group-hover:shadow-2xl transform group-hover:scale-110" />
                    
                    {/* Content */}
                    <div className="relative z-10 p-3 sm:p-5 md:p-7">
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                        <span className="text-xs md:text-sm font-bold text-secondary/70">+</span>
                      </div>
                      <p className="text-xs sm:text-sm md:text-base text-slate-100 mt-1 sm:mt-2 font-medium tracking-wide group-hover:text-white transition-colors">{stat.label}</p>
                      {stat.sublabel && (
                        <p className="text-xs text-slate-300 mt-1">{stat.sublabel}</p>
                      )}
                    </div>
                    
                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-secondary to-accent group-hover:w-full transition-all duration-500 rounded-br-lg sm:rounded-br-2xl rounded-bl-lg sm:rounded-bl-2xl" />
                  </div>
                ))}
              </div>
            </AnimatedDiv>
          )}
          
          <AnimatedDiv delay={0.3}>
            <div className={cn('flex flex-col sm:flex-row gap-3 sm:gap-4 px-2 sm:px-0 items-stretch sm:items-center', { 'justify-center': !hasImage, 'justify-start': hasImage })}>
              {primaryCta && (
                <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-primary font-bold text-sm sm:text-base">
                  <Link href={primaryCta.href}>{primaryCta.text}</Link>
                </Button>
              )}
              {secondaryCta && (
                <Button asChild size="lg" variant="secondary" className="font-bold text-sm sm:text-base">
                  <Link href={secondaryCta.href}>{secondaryCta.text}</Link>
                </Button>
              )}
              {actions && actions.map((action, index) => (
                <div key={index} className="[&_button]:w-full [&_button]:sm:w-auto [&_button]:text-xs [&_button]:sm:text-sm [&_button]:font-semibold [&_input]:text-sm">
                  {action}
                </div>
              ))}
            </div>
          </AnimatedDiv>
        </div>
      </div>
    </header>
  );
}
