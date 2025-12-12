import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(({ className, children, ...props }, ref) => (
  <section ref={ref} className={cn('py-section-md', className)} {...props}>
    <div className="container mx-auto px-container-px">
        {children}
    </div>
  </section>
));
Section.displayName = 'Section';


const SectionHeading = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-center max-w-3xl mx-auto', className)} {...props} />
));
SectionHeading.displayName = 'SectionHeading';


const SectionPreamble = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-base font-semibold leading-7 text-primary', className)} {...props} />
));
SectionPreamble.displayName = 'SectionPreamble';


const SectionTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn('mt-2 font-bold tracking-tight text-foreground text-3xl sm:text-4xl md:text-5xl', className)} {...props} />
));
SectionTitle.displayName = 'SectionTitle';

const SectionDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('mt-3 sm:mt-4 md:mt-6 text-sm sm:text-base md:text-lg leading-relaxed text-muted-foreground', className)} {...props} />
));
SectionDescription.displayName = 'SectionDescription';


export { Section, SectionHeading, SectionPreamble, SectionTitle, SectionDescription };
