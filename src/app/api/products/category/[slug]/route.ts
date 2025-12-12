import { NextResponse } from 'next/server';
import { products } from '@/lib/data';
import { getCategories } from '@/services/productService';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return new NextResponse('Category not found', { status: 404 });
  }

  const categoryProducts = products.filter((p) => p.category === category.name);

  return NextResponse.json(categoryProducts);
}