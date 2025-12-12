
import { PageHero } from '@/components/layout/PageHero';
import { Section } from '@/components/ui/section';
import { getNewsItems, NewsItem } from '@/services/newsService';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const NewsCard = ({ item }: { item: NewsItem }) => (
  <Link href={`/news/${item.slug}`} className="group block">
    <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white border-slate-200 hover:border-primary">
      <CardHeader className="p-0">
        <div className="relative aspect-[16/9]">
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
      <CardContent className="p-6">
        <p className="text-sm font-semibold text-secondary mb-2">{item.category}</p>
        <h3 className="text-lg font-bold text-primary mb-3 leading-snug group-hover:text-primary-dark">
          {item.title}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          {item.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{item.date}</span>
          <span className="inline-flex items-center font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Read More <ArrowRight className="ml-1 h-3 w-3" />
          </span>
        </div>
      </CardContent>
    </Card>
  </Link>
);

export default function NewsPage() {
  const newsItems = getNewsItems();

  return (
    <>
      <PageHero
        title="News & Insights"
        description="Stay updated with the latest news, market trends, and insights from BZION and the wider FMCG industry in Nigeria."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'News', href: '/news' },
        ]}
      />
      <div className="border-b-2 border-slate-200"></div>
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
        {newsItems.length === 0 && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-primary mb-4">Coming Soon</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our news and insights section is currently under development. Check back soon for the latest articles and updates.
            </p>
          </div>
        )}
      </Section>
    </>
  );
}
