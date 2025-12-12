import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug } from '@/services/productService';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return new NextResponse('Product not found', { status: 404 });
  }

  return NextResponse.json(product);
}
