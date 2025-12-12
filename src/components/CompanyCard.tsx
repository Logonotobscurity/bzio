
'use client';

import { CompanyDirectoryData } from '@/services/productService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedDiv } from '@/components/animated-div';

interface CompanyCardProps {
  company: CompanyDirectoryData;
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <AnimatedDiv>
      <Card className="h-full flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/20">
        <CardContent className="p-6 flex flex-col flex-grow">
          <div className="relative h-24 mb-6 flex items-center justify-center">
            {company.logo && (
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                width={180}
                height={96}
                className="object-contain max-h-full max-w-full transition-transform duration-300 group-hover:scale-105"
              />
            )}
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">{company.name}</h3>
          <p className="text-sm text-slate-600 mb-6 text-center h-10">{company.positioningStatement}</p>

          <div className="mb-6 flex-grow">
            <p className="text-xs font-semibold text-slate-500 mb-2 tracking-wider uppercase">Specialties</p>
            <ul className="space-y-2">
              {company.specialties.slice(0, 2).map((spec) => (
                <li key={spec.categorySlug} className="flex justify-between items-center text-sm">
                  <span className="text-slate-700">{spec.categoryName}</span>
                  <Badge variant="secondary" className="text-xs">{spec.productCount} products</Badge>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-slate-200 pt-4 mb-6">
            <div className="flex justify-between items-center text-sm text-slate-600">
                <span>
                    <span className="font-bold">{company.brandCount}</span> Brands
                </span>
                <span>
                    <span className="font-bold">{company.productCount}</span> Products
                </span>
            </div>
            {company.strongestCategory && (
                <p className="text-xs text-slate-500 mt-2">Strongest in: <span className="font-semibold">{company.strongestCategory}</span></p>
            )}
          </div>

          {company.buyerSegments && company.buyerSegments.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 mb-2 tracking-wider uppercase">Serves</p>
              <div className="flex flex-wrap gap-2">
                  {company.buyerSegments.map((segment) => (
                      <Badge key={segment} variant='outline' className="text-xs">{segment}</Badge>
                  ))}
              </div>
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="default">
                    <Link href={`/companies/${company.slug}`}>View Profile</Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/contact?subject=Bulk Quote">Get Bulk Quote</Link>
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimatedDiv>
  );
}
