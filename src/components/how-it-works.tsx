
import { Section, SectionHeading, SectionTitle, SectionDescription } from "@/components/ui/section";
import { ShoppingCart, FileText, Truck, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GsapScrollTrigger } from "@/components/ui/GsapScrollTrigger";

const steps = [
    {
        step: 1,
        icon: ShoppingCart,
        title: "Browse Products",
        description: "Explore our extensive catalog of 500+ quality food ingredients from trusted Nigerian brands.",
        bgColor: 'bg-orange-100',
        iconColor: 'text-orange-600',
    },
    {
        step: 2,
        icon: FileText,
        title: "Request Quote",
        description: "Submit your bulk order requirements and receive competitive pricing within 24 hours.",
        bgColor: 'bg-fuchsia-100',
        iconColor: 'text-fuchsia-700',
    },
    {
        step: 3,
        icon: Truck,
        title: "Fast Delivery",
        description: "Confirm your order and get your products delivered to your location across Nigeria.",
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600',
    }
];

export const HowItWorks = () => {
    return (
        <Section id="how-it-works" className="bg-white">
            <GsapScrollTrigger>
                <SectionHeading className="text-center">
                    <SectionTitle>How It Works</SectionTitle>
                    <SectionDescription>Get started with BZION in three simple steps</SectionDescription>
                </SectionHeading>
            </GsapScrollTrigger>

            <div className="mt-12 grid md:grid-cols-3 gap-8 md:gap-12 text-center max-w-5xl mx-auto">
                {steps.map((step, index) => (
                    <GsapScrollTrigger key={step.step} delay={index * 0.1}>
                        <div className="flex flex-col items-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-secondary/10`}>
                                <step.icon className={`w-8 h-8 text-secondary`} />
                            </div>
                            <h3 className="text-2xl font-bold text-primary mb-3">{step.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{step.description}</p>
                        </div>
                    </GsapScrollTrigger>
                ))}
            </div>

            <GsapScrollTrigger delay={0.3}>
                <div className="text-center mt-12">
                    <Button asChild size="lg">
                        <Link href="/products#products-grid">
                            Browse All Catalogues <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </GsapScrollTrigger>
        </Section>
    );
}
