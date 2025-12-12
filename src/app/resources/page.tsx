'use client';

import { useState, useMemo } from 'react';
import { PageHero } from '@/components/layout/PageHero';
import { Section } from '@/components/ui/section';
import { getResourceItems, getCategories, ResourceItem } from '@/services/resourcesService';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ResourceCard = ({ item }: { item: ResourceItem }) => {
  const categoryColors: Record<ResourceItem['category'], { bg: string; text: string; border: string }> = {
    'News': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'Insights': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'Guides': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'Case Study': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    'Webinar': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };

  const colors = categoryColors[item.category];

  return (
    <Link href={`/resources/${item.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white border-slate-200 hover:border-primary flex flex-col">
        <CardHeader className="p-0">
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={item.imageHint}
            />
          </div>
        </CardHeader>
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
              {item.category}
            </span>
          </div>
          <h3 className="text-lg font-bold text-primary mb-3 leading-snug group-hover:text-primary-dark flex-1">
            {item.title}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            {item.excerpt}
          </p>
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>{item.date}</span>
              {item.readTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{item.readTime} min read</span>
                </div>
              )}
            </div>
            {item.author && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <User className="h-3 w-3" />
                <span>{item.author}</span>
              </div>
            )}
            <span className="inline-flex items-center font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity pt-2">
              Read More <ArrowRight className="ml-1 h-3 w-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const resources = getResourceItems();
  const categories = getCategories();

  const filteredResources = useMemo(() => {
    if (!selectedCategory) return resources;
    return resources.filter(item => item.category === selectedCategory);
  }, [selectedCategory, resources]);

  return (
    <>
      <PageHero
        title="Resources"
        description="Access guides, insights, case studies, and industry updates to help you grow your FMCG business with BZION."
      />
      <div className="border-b-2 border-slate-200"></div>
      
      <Section>
        {/* Category Filter */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-primary mb-6">Filter by Category</h2>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setSelectedCategory(null)}
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="lg"
            >
              All Resources
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="lg"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div>
          {filteredResources.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold text-primary mb-8">
                {selectedCategory ? `${selectedCategory} Resources` : 'All Resources'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredResources.map((item) => (
                  <ResourceCard key={item.id} item={item} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-primary mb-4">No Resources Found</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Try selecting a different category or check back soon for more resources.
              </p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-8 text-center border border-primary/20">
          <h3 className="text-2xl font-bold text-primary mb-3">Still Need Help?</h3>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Our team is ready to assist you. Reach out with any questions about our products, services, or how we can help grow your business.
          </p>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
