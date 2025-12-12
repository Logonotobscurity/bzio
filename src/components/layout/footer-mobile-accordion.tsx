'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FOOTER_LINKS } from "@/lib/config/constants";
import Link from 'next/link';

export function FooterMobileAccordion() {
  const linkCategories = {
      Platform: FOOTER_LINKS.platform,
      Company: FOOTER_LINKS.company,
      Customers: FOOTER_LINKS.customers,
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {Object.entries(linkCategories).map(([category, links]) => (
        <AccordionItem value={category} key={category} className="border-b border-blue-800">
          <AccordionTrigger className="text-base font-medium text-white uppercase tracking-widest hover:no-underline">
            {category}
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-3 pt-2">
              {links.map((link) => (
                <li key={link.title}>
                  <Link href={link.href} className="text-sm text-slate-300 hover:text-white font-light">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
