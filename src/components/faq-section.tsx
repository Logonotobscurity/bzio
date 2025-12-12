"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading, SectionTitle } from "@/components/ui/section";
import Link from "next/link";
import { AnimatedDiv } from "./animated-div";

interface FAQItem {
  q: string;
  a: string;
}

const faqs: FAQItem[] = [
    {
        q: "What types of products do you supply?",
        a: "We provide a wide range of authentic food products and ingredients from trusted manufacturers, including staples, FMCG brands, and essential items for businesses of all sizes."
    },
    {
        q: "Are your products NAFDAC-certified?",
        a: "Yes. All products meet NAFDAC standards and other regulatory requirements, ensuring authenticity, safety, and quality."
    },
    {
        q: "How can my business place an order?",
        a: "Orders can be placed online, by phone, or via email. You can choose from warehouse stock or direct-from-manufacturer dropshipping options."
    },
    {
        q: "Do you offer delivery services?",
        a: "Yes. We provide reliable deliveries across Ogun, Lagos, and surrounding areas. Our logistics network ensures consistency and transparency at every stage."
    },
    {
        q: "Can I source products directly from manufacturers?",
        a: "Absolutely. BZION connects businesses with leading manufacturers to reduce costs, guarantee authenticity, and offer flexible supply options."
    },
    {
        q: "Can I combine warehouse stock and direct-from-manufacturer orders?",
        a: "Yes. You can mix both options in a single order, simplifying your procurement and optimizing your inventory management."
    }
]

const renderQuestion = (question: string) => {
    const parts = question.split(/(BZION)/gi);
    return (
        <span>
            {parts.map((part, index) =>
                part.toLowerCase() === 'bzion' ? <span key={index} className="font-bold">BZION</span> : part
            )}
        </span>
    );
};

export const FaqSection = () => {
  return (
    <Section id="faq" aria-labelledby="faq-heading" className="bg-primary text-white" >
      <AnimatedDiv>
        <SectionHeading className='text-center'>
            <p className="text-sm font-bold tracking-widest text-accent uppercase mb-4">FAQ'S</p>
            <SectionTitle id="faq-heading" className="!text-white mb-6 text-3xl sm:text-4xl">
            Frequently Asked Questions
            </SectionTitle>
            <p className="text-slate-300 mb-8 max-w-md mx-auto text-lg sm:text-xl">
            Can't find the answer you're looking for? Reach out to our dedicated partnership team for assistance.
            </p>
            <Button asChild variant="secondary" size="lg">
                <Link href="/contact">Contact Us</Link>
            </Button>
        </SectionHeading>
      </AnimatedDiv>
      <AnimatedDiv className="max-w-3xl mx-auto mt-12" delay={0.2}>
          <div className="bg-primary-foreground/5 backdrop-blur-sm rounded-2xl border border-slate-700 shadow-sm overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
                {faqs.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index} className="border-b border-slate-700 last:border-b-0">
                        <AccordionTrigger className="text-left text-lg sm:text-xl font-medium text-white hover:no-underline p-6">
                           {renderQuestion(item.q)}
                        </AccordionTrigger>
                        <AccordionContent className="text-base sm:text-lg font-normal text-slate-300 px-6 pb-6">
                           <p className="max-w-prose" dangerouslySetInnerHTML={{ __html: item.a.replace(/BZION/g, '<span class="font-bold">BZION</span>') }}></p>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
          </div>
      </AnimatedDiv>
    </Section>
  );
};

export default FaqSection;
