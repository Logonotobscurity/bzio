'use client';

import { use } from 'react';
import { getResourceItemBySlug, getResourceItems } from '@/services/resourcesService';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Section } from '@/components/ui/section';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, User, Share2, Calendar } from 'lucide-react';
import { useState } from 'react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ResourceDetailPage(props: PageProps) {
  const params = use(props.params);
  const resource = getResourceItemBySlug(params.slug);
  const [shareSuccess, setShareSuccess] = useState(false);

  if (!resource) {
    notFound();
  }

  const allResources = getResourceItems();
  const relatedResources = allResources
    .filter(item => item.category === resource.category && item.id !== resource.id)
    .slice(0, 3);

  const categoryColors: Record<string, { bg: string; text: string }> = {
    'News': { bg: 'bg-blue-50', text: 'text-blue-700' },
    'Insights': { bg: 'bg-purple-50', text: 'text-purple-700' },
    'Guides': { bg: 'bg-green-50', text: 'text-green-700' },
    'Case Study': { bg: 'bg-orange-50', text: 'text-orange-700' },
    'Webinar': { bg: 'bg-red-50', text: 'text-red-700' },
  };

  const colors = categoryColors[resource.category] || { bg: 'bg-slate-50', text: 'text-slate-700' };

  const handleShare = async () => {
    try {
      const shareData = {
        title: resource.title,
        text: resource.excerpt,
        url: typeof window !== 'undefined' ? window.location.href : '',
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <main className="flex-grow bg-slate-50">
      {/* Hero Section */}
      <div className="relative h-96 w-full overflow-hidden bg-primary">
        <Image
          src={resource.imageUrl}
          alt={resource.title}
          fill
          className="object-cover opacity-40"
          priority
          data-ai-hint={resource.imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 to-primary/80" />
        
        <Section className="relative h-full flex flex-col justify-end pb-8">
          <div className="max-w-4xl">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${colors.bg} ${colors.text}`}>
              {resource.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {resource.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{resource.date}</span>
              </div>
              {resource.readTime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{resource.readTime} min read</span>
                </div>
              )}
              {resource.author && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>By {resource.author}</span>
                </div>
              )}
            </div>
          </div>
        </Section>
      </div>

      {/* Content Section */}
      <Section className="py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <Link href="/resources" className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors mb-8">
                <ArrowLeft className="h-4 w-4" />
                Back to Resources
              </Link>
            </div>

            <div className="prose prose-slate max-w-none mb-12">
              <div 
                dangerouslySetInnerHTML={{ __html: resource.content }}
                className="text-slate-700 leading-relaxed space-y-4"
              />
            </div>

            {/* Share Section */}
            <div className="border-t border-slate-200 pt-8 mt-8">
              <h3 className="text-lg font-bold text-primary mb-4">Share This Resource</h3>
              <div className="flex gap-4">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  {shareSuccess ? 'Copied!' : 'Share'}
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Resource Info Card */}
            <Card className="mb-8 sticky top-8">
              <CardContent className="p-6 space-y-4">
                <div className="border-b pb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Category</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                    {resource.category}
                  </span>
                </div>
                
                <div className="border-b pb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Published</p>
                  <p className="text-sm text-slate-700">{resource.date}</p>
                </div>

                {resource.readTime && (
                  <div className="border-b pb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Read Time</p>
                    <p className="text-sm text-slate-700">{resource.readTime} minutes</p>
                  </div>
                )}

                {resource.author && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Author</p>
                    <p className="text-sm text-slate-700">{resource.author}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-primary mb-2">Ready to Grow?</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Let BZION help you succeed in your FMCG business journey.
                </p>
                <Button asChild size="sm" className="w-full">
                  <Link href="/contact">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Resources */}
        {relatedResources.length > 0 && (
          <div className="mt-20 pt-12 border-t border-slate-200">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-8">Related Resources</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedResources.map((item) => (
                <Link
                  key={item.id}
                  href={`/resources/${item.slug}`}
                  className="group block"
                >
                  <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <CardContent className="p-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 ${colors.bg} ${colors.text}`}>
                        {item.category}
                      </span>
                      <h3 className="font-bold text-primary group-hover:text-primary-dark transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2">{item.date}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Section>
    </main>
  );
}
