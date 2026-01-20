import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts } from '@/services/productService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const minChars = 3;

    if (query.length < minChars) {
      return NextResponse.json({ results: [] });
    }

    const lowerQuery = query.toLowerCase().trim();
    const products = await getAllProducts();

    const results = products
      .filter((product) => {
        const searchableText = `
          ${product.name}
          ${product.brand}
          ${product.category}
          ${product.description || ''}
        `.toLowerCase();

        return searchableText.includes(lowerQuery);
      })
      .map((product) => ({
        id: String(product.id),
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        category: product.category,
        price: product.price ?? 0,
        imageUrl: product.imageUrl,
        excerpt: (product.description ?? '').substring(0, 100),
      }))
      .slice(0, 10);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 500 });
  }
}
