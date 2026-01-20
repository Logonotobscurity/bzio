import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts } from '@/services/productService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    if (query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const lowerQuery = query.toLowerCase().trim();
    const uniqueSuggestions = new Set<string>();
    const products = await getAllProducts();

    // Add product names
    products.forEach((product) => {
      if (
        product.name.toLowerCase().includes(lowerQuery) &&
        uniqueSuggestions.size < limit
      ) {
        uniqueSuggestions.add(product.name);
      }
    });

    // Add brands
    if (uniqueSuggestions.size < limit) {
      products.forEach((product) => {
        if (
          product.brand.toLowerCase().includes(lowerQuery) &&
          !uniqueSuggestions.has(product.brand) &&
          uniqueSuggestions.size < limit
        ) {
          uniqueSuggestions.add(product.brand);
        }
      });
    }

    // Add categories
    if (uniqueSuggestions.size < limit) {
      products.forEach((product) => {
        if (
          product.category.toLowerCase().includes(lowerQuery) &&
          !uniqueSuggestions.has(product.category) &&
          uniqueSuggestions.size < limit
        ) {
          uniqueSuggestions.add(product.category);
        }
      });
    }

    return NextResponse.json({ suggestions: Array.from(uniqueSuggestions) });
  } catch (error) {
    console.error('Suggestions API error:', error);
    return NextResponse.json({ suggestions: [], error: 'Suggestions failed' }, { status: 500 });
  }
}
