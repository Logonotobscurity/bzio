
'use client';

import { ShieldCheck, Target, Eye, Goal, Handshake } from "lucide-react";
import { Section, SectionDescription, SectionTitle, SectionHeading } from "@/components/ui/section";
import { findImage } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";
import CompanyStats from "./CompanyStats";
import { GsapScrollTrigger } from "@/components/ui/GsapScrollTrigger";
import { Button } from "@/components/ui/button";

const ValueCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex flex-col h-full bg-card p-6 rounded-lg border border-border shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-6 mx-auto flex-shrink-0">
            <Icon className="h-8 w-8 text-secondary" />
        </div>
        <h3 className="text-xl font-bold text-primary mb-2 text-center">{title}</h3>
        <p className="text-card-foreground font-light text-center flex-grow">{description}</p>
    </div>
);


const AboutContent = () => {
    const storyImage = findImage('bzion-story');
    const founderImage = findImage('bukola-atinsola');

  return (
    <article className="bg-transparent">
      
      {/* Our Story */}
      <Section id="journey">
        <GsapScrollTrigger>
         <SectionHeading className="text-center">
            <p className="text-sm font-bold tracking-widest text-secondary uppercase mb-space-sm">Our Journey</p>
            <SectionTitle>From A Mission To A Movement</SectionTitle>
        </SectionHeading>
        </GsapScrollTrigger>
        <GsapScrollTrigger>
        <div className="grid md:grid-cols-2 gap-space-lg items-center mt-12">
            <div className="flex justify-center">
                 <div className="relative w-full max-w-sm aspect-[3/4] overflow-hidden shadow-lg border border-secondary rounded-lg">
                    <Image 
                        src={storyImage?.imageUrl ?? ''} 
                        alt={storyImage?.description || 'Story image'}
                        fill
                        className="w-full h-full object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        data-ai-hint={storyImage?.imageHint}
                        unoptimized
                    />
                </div>
            </div>
            <div className="text-center md:text-left space-y-6">
                <SectionDescription className="!text-left !mx-0 !max-w-full">
                    Founded in 2002 by Bukola Atinsola, <span className="font-bold text-primary">BZION</span> began with a single, powerful mission: to ensure no Nigerian business ever faces a stock-out of essential goods.
                </SectionDescription>
                 <SectionDescription className="!text-left !mx-0 !max-w-full">
                    {`From this vision, we have grown into a leading B2B distribution partner with three strategic branches across Ogun State, serving a diverse network of retailers, institutions, and wholesalers throughout South-West Nigeria.`}
                </SectionDescription>
                 <SectionDescription className="!text-left !mx-0 !max-w-full">
                    {`We specialize in creating a direct, transparent bridge between Nigeria's most `}<Link href="/companies/" className="text-primary hover:underline font-semibold">reputable manufacturers</Link>{` and local businesses. Our 24-hour delivery promise is not just a service—it's our commitment to ensuring your business never has to tell a customer, "We don't have it."`}
                </SectionDescription>
                 <div className="pt-2">
                  <Button asChild size="lg">
                    <Link href="/companies">
                      Explore Our Partners
                    </Link>
                  </Button>
                </div>
            </div>
        </div>
        </GsapScrollTrigger>
      </Section>
      
      {/* Mission & Vision */}
      <Section id="mission-vision" className="bg-slate-50/80 backdrop-blur-sm section-bordered">
        <GsapScrollTrigger>
        <div className="grid md:grid-cols-2 gap-space-lg items-center">
          <div>
            <SectionHeading className="!text-left">
                <p className="text-sm font-bold tracking-widest text-secondary uppercase mb-space-sm">Our Compass</p>
                <SectionTitle className="!text-left">Our Mission & Vision</SectionTitle>
                <SectionDescription className="!text-left !mx-0">
                We are building the most resilient food supply chain for Nigeria, with the goal of becoming the nation's most trusted and reliable partner in food distribution.
                </SectionDescription>
            </SectionHeading>
          </div>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-secondary/10 border-2 border-secondary/20 flex items-center justify-center">
                  <Goal className="w-7 h-7 text-secondary" />
                </div>
              </div>
              <div>
                <h3 className="text-h4 font-bold text-primary mb-2">Our Mission</h3>
                <p className="text-slate-600">To build a tech-driven, transparent food supply chain that delivers authentic products from the manufacturer to every corner of Nigeria, ensuring unwavering availability and affordability for all our partners.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-secondary/10 border-2 border-secondary/20 flex items-center justify-center">
                  <Eye className="w-7 h-7 text-secondary" />
                </div>
              </div>
              <div>
                <h3 className="text-h4 font-bold text-primary mb-2">Our Vision</h3>
                <p className="text-slate-600">To be Nigeria's undisputed leader in food distribution, recognized for our operational integrity, our commitment to partnership, and our role in empowering national economic growth.</p>
              </div>
            </div>
          </div>
        </div>
        </GsapScrollTrigger>
      </Section>


      {/* Meet the Visionary */}
      <Section id="leadership" className="bg-card border-y border-border">
        <GsapScrollTrigger>
        <SectionHeading className="text-center mb-0">
          <p className="text-sm font-bold tracking-widest text-secondary uppercase mx-auto mb-space-sm">Leadership</p>
          <SectionTitle className="mx-auto">Meet the Visionary</SectionTitle>
        </SectionHeading>
        </GsapScrollTrigger>
        <GsapScrollTrigger>
        <div className="grid md:grid-cols-2 gap-space-lg items-center mt-12">
            <div className="flex justify-center">
                <div className="relative w-full max-w-sm aspect-[3/4] overflow-hidden shadow-lg border border-secondary rounded-lg">
                    <Image
                      src={founderImage?.imageUrl ?? ''}
                      alt={founderImage?.description || 'Founder image'}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      data-ai-hint={founderImage?.imageHint}
                      unoptimized
                    />
                </div>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-3xl lg:text-4xl font-bold text-primary">Bukola Atinsola</h3>
              <p className="text-secondary font-medium text-xl mt-1">Founder & CEO</p>
              <blockquote className="mt-6">
                  <p className="text-slate-600 text-lg lg:text-xl max-w-prose mx-auto md:mx-0">
                    {`"We didn't just build a business; we built a promise. A promise that no retailer will have to turn a customer away because of a broken supply chain. That's the `}<span className="font-bold text-primary">BZION</span>{` guarantee."`}
                  </p>
              </blockquote>
            </div>
        </div>
        </GsapScrollTrigger>
      </Section>
      
      {/* Our Values */}
      <Section id="values" className="bg-slate-50/80 backdrop-blur-sm section-bordered">
        <GsapScrollTrigger>
        <SectionHeading className="text-center">
            <p className="text-sm font-bold tracking-widest text-secondary uppercase mx-auto mb-space-sm">Our Values</p>
            <SectionTitle className="mx-auto">The Principles That Guide Us</SectionTitle>
        </SectionHeading>
        </GsapScrollTrigger>
        <div className="grid md:grid-cols-3 gap-space-md max-w-6xl mx-auto mt-12 grid-flow-row-dense">
            <GsapScrollTrigger>
                <div className="h-full">
                    <ValueCard 
                        icon={ShieldCheck}
                        title="Integrity First"
                        description="We build partnerships on trust. Every transaction is handled with complete honesty, featuring clear, upfront pricing and open communication."
                    />
                </div>
            </GsapScrollTrigger>
            <GsapScrollTrigger>
                 <div className="h-full">
                    <ValueCard 
                        icon={Handshake}
                        title="Partnership-Driven"
                        description="We are more than suppliers; we are partners. We take the time to understand your unique business needs and provide proactive support to help you scale."
                    />
                </div>
            </GsapScrollTrigger>
            <GsapScrollTrigger>
                 <div className="h-full">
                    <ValueCard 
                        icon={Target}
                        title="Operational Excellence"
                        description="With 24-hour convenience delivery and a damage-free guarantee, we eliminate downtime and protect your investment."
                    />
                </div>
            </GsapScrollTrigger>
        </div>
      </Section>

      <GsapScrollTrigger><CompanyStats /></GsapScrollTrigger>
    </article>
  );
};

export default AboutContent;
