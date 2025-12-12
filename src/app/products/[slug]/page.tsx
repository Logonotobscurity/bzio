
import { getProductPageData } from '@/services/productService';
import { notFound } from 'next/navigation';
import ProductDetailClient from './client-page';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getProductPageData(slug);

  if (!data) {
    return notFound();
  }

  return <ProductDetailClient {...data} />;
}
