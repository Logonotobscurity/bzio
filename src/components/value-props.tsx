
"use client";
import { Button } from '@/components/ui/button';
import { Truck, Handshake, Scaling, ShoppingCart } from 'lucide-react';

import { Section, SectionTitle, SectionHeading, SectionDescription } from '@/components/ui/section';
import { Warehouse } from 'lucide-react';
import { AnimatedDiv } from '@/components/animated-div';
import { GsapScrollTrigger } from '@/components/ui/GsapScrollTrigger';

const advantages = [
    {
        icon: Truck,
        title: 'Logistics You Can Count On',
        description: 'From our warehouses to your business, our distribution network ensures timely, accurate, and complete deliveries — helping you avoid stockouts and keep operations running smoothly.',
    },
    {
        icon: Warehouse,
        title: 'Flexible Supply Options',
        description: 'Get products from our ready-to-ship inventory or source directly from trusted brands. This flexibility gives you cost efficiency, scalability, and reliable access to key items.',
    },
    {
        icon: Handshake,
        title: 'Dedicated Partner Support',
        description: 'We act as your business partner: anticipating your needs, providing market insights, offering flexible credit, and helping you make smarter procurement decisions.',
    },
    {
        icon: Scaling,
        title: 'Equitable Access & Profit Protection',
        description: 'We ensure every business — large or small — can access high-demand products at competitive pricing, protecting your margins and creating room for growth.',
    },
    {
        icon: ShoppingCart,
        title: 'Simplified Procurement',
        description: 'We make restocking simple, fast, and transparent. Our easy-to-use platform allows you to place orders and track deliveries, so you can focus on your business.',
    }
];

const AdvantageCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="group flex flex-col h-full text-left p-6 space-y-4 transition-all duration-300 bg-secondary/10 hover:bg-secondary/20 rounded-lg border border-secondary/50 w-full">
        <div className="h-16 w-16 mb-4 rounded-lg border-2 border-secondary/50 bg-secondary/20 flex items-center justify-center transition-all duration-300 group-hover:bg-secondary/30">
            <Icon className="h-8 w-8 text-secondary" />
        </div>
        <h3 className="font-bold text-xl text-white">{title}</h3>
        <p className="text-base text-slate-300 flex-grow font-light">{description}</p>
    </div>
);

const ValueProps = () => {
   return (
    <Section
        id="bzion-advantage"
        className="bg-primary"
        aria-labelledby="bzion-advantage-heading"
    >
       <div className="text-center">
         <GsapScrollTrigger>
           <SectionHeading className="!text-center">
          <AnimatedDiv>
            <p className="text-sm font-bold tracking-widest text-accent uppercase">Why BZION</p>
            <SectionTitle id="bzion-advantage-heading" className="!text-white mb-4 text-3xl sm:text-4xl">The BZION Advantage</SectionTitle>
            <SectionDescription className="!text-center !mx-auto max-w-4xl text-slate-300 text-lg sm:text-xl">
              At BZION, we move beyond the transactional. We provide the operational backbone that transforms scarcity into reliable abundance, empowering businesses across Nigeria to scale with confidence. Here’s how we deliver.
            </SectionDescription>
          </AnimatedDiv>
           </SectionHeading>
         </GsapScrollTrigger>
         <GsapScrollTrigger delay={0.15}>
           <div className="mt-8 text-center">
             <Button asChild variant="secondary" size="lg">
               <a href="/about">Discover the Difference</a>
             </Button>
           </div>
         </GsapScrollTrigger>
       </div>
         <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantages.map((advantage, index) => (
                <GsapScrollTrigger key={index} delay={0.1 * (index + 1)}>
                    <AdvantageCard
                        icon={advantage.icon}
                        title={advantage.title}
                        description={advantage.description}
                    />
                </GsapScrollTrigger>
            ))}
        </div>
    </Section>
  );
}

export default ValueProps;
