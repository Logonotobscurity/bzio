'use client';
import { useState } from 'react';
import { PageHero } from '@/components/layout/PageHero';
import { Section } from '@/components/ui/section';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CTASection } from '@/components/cta-section';

const faqData = [
    {
        category: 'General Questions',
        questions: [
            {
                q: "What types of products do you supply?",
                a: "We provide a wide range of authentic food products and ingredients from trusted manufacturers, including staples, FMCG brands, and essential items for businesses of all sizes."
            },
            {
                q: "What is BZION's mission?",
                a: "Our mission is to build a tech-driven, transparent food supply chain that delivers authentic products from the manufacturer to every corner of Nigeria, ensuring unwavering availability and affordability for all our partners."
            },
            {
                q: "How long has BZION been in business?",
                a: "BZION was founded in 2002 and has over 20 years of experience in the food distribution industry in Nigeria."
            }
        ]
    },
    {
        category: 'Ordering & Delivery',
        questions: [
            {
                q: "How can my business place an order?",
                a: "You can build a quote list directly on our website by adding products. Once your list is ready, you can submit it through our RFQ page, and our team will contact you to finalize the order and payment."
            },
            {
                q: "Do you offer delivery services?",
                a: "Yes. We provide reliable deliveries across Ogun, Lagos, and surrounding areas. Our logistics network ensures consistency and transparency at every stage, with a 24-hour delivery promise for most orders."
            },
            {
                q: "What are your minimum order quantities (MOQs)?",
                a: "Our MOQs are structured to fit your business needs. We work with you to define order quantities that are practical for your operational reality and help maximize your profit."
            },
            {
                q: "Can I combine warehouse stock and direct-from-manufacturer orders?",
                a: "Yes. You can mix both options in a single order, simplifying your procurement and optimizing your inventory management."
            }
        ]
    },
    {
        category: 'Products & Quality',
        questions: [
            {
                q: "Are your products NAFDAC-certified?",
                a: "Yes. All products we supply meet NAFDAC standards and other regulatory requirements, ensuring authenticity, safety, and quality."
            },
            {
                q: "Can I source products directly from manufacturers?",
                a: "Absolutely. BZION connects businesses with leading manufacturers to reduce costs, guarantee authenticity, and offer flexible supply options."
            }
        ]
    },
    {
        category: 'Account & Partnership',
        questions: [
            {
                q: "How do I become a BZION partner?",
                a: "To start a partnership, you can contact us through our website or give us a call. We'll guide you through the onboarding process and discuss how we can best meet your business needs."
            },
            {
                q: "What payment and credit terms are available?",
                a: "We offer competitive and flexible payment solutions designed to support your cash flow. Discuss your specific needs with our team during onboarding."
            },
            {
                q: "Do you provide real-time stock visibility?",
                a: "Yes. Our partners get clear, real-time communication on stock levels and delivery schedules, eliminating the uncertainty common in the supply chain."
            }
        ]
    }
];

const allFaqs = faqData.flatMap(category => category.questions);

const faqPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": allFaqs.map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
        }
    }))
};

const FaqPage = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFaqData = faqData.map(category => ({
        ...category,
        questions: category.questions.filter(q =>
            q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.a.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(category => category.questions.length > 0);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }} />
            <PageHero
                title="Frequently Asked Questions"
                description="Find answers to common questions about orders, shipping, account management, and more. If you can't find what you're looking for, feel free to contact us."
                primaryCta={{
                    text: "Contact Support",
                    href: "/contact"
                }}
                secondaryCta={{
                    text: "Browse Products",
                    href: "/products"
                }}
            />
            <div className="border-b-2 border-slate-200"></div>
            
            <Section className="bg-gradient-to-b from-secondary/10 to-background">
                <div className="max-w-2xl mx-auto">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            type="search"
                            placeholder="Find an answer (e.g., delivery, payment, credit)"
                            className="w-full pl-12 h-12 rounded-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="max-w-5xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                    {filteredFaqData.map(category => (
                        <div key={category.category}>
                            <h2 className="text-2xl font-bold text-primary mb-6">{category.category}</h2>
                            <Accordion type="single" collapsible className="w-full">
                                {category.questions.map((item, index) => (
                                    <AccordionItem value={`item-${index}`} key={index}>
                                        <AccordionTrigger className="text-left text-lg font-medium text-primary hover:no-underline">
                                           {item.q}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-base font-normal text-slate-600">
                                           <p className="max-w-prose">{item.a}</p>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    ))}
                </div>
                 {filteredFaqData.length === 0 && (
                    <div className="text-center py-16 text-slate-500">
                        <p>No results found for "{searchTerm}".</p>
                        <p>Please try a different search term or contact us for help.</p>
                    </div>
                )}
            </Section>

            <Section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5 border-t border-primary/10">
                <CTASection
                    title="Still have questions?"
                    description="Wherever you are in Nigeria, you can be certain we're nearby. Get in touch for reliable supply, fair wholesale prices, and a partnership dedicated to your growth."
                    ctaText="Contact Us"
                    ctaHref="/contact"
                />
            </Section>
        </>
    )
}

export default FaqPage;
