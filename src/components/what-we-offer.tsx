import { Section, SectionHeading, SectionPreamble, SectionTitle } from "@/components/ui/section";
import { FileText, Truck, ShieldCheck, Quote } from "lucide-react";

const offerings = [
    {
        icon: Quote,
        title: "Need a Custom Quote?",
        description: "Get personalized pricing for bulk orders—connect with our sales team for a tailored offer."
    },
    {
        icon: Truck,
        title: "Looking for Flexible Shipping?",
        description: "Take advantage of our efficient 24-hour delivery promise or arrange your own freight for added flexibility."
    },
    {
        icon: ShieldCheck,
        title: "Need Quality Assurance?",
        description: "Instantly access all essential NAFDAC compliance documents for our wholesale ingredients."
    },
    {
        icon: FileText,
        title: "Want Product Details?",
        description: "Review full product specifications upfront to ensure the right fit before you buy."
    }
]

export const WhatWeOffer = () => {
    return (
        <Section className="bg-slate-50">
            <SectionHeading className="text-center">
                <SectionPreamble className="mx-auto" />
                <SectionTitle>What We Offer</SectionTitle>
            </SectionHeading>
            <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
                {offerings.map(offer => (
                    <div key={offer.title} className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                             <offer.icon className="w-8 h-8 text-secondary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-primary mb-1">{offer.title}</h3>
                            <p className="text-sm text-slate-500">{offer.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    )
}
