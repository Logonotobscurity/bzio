import { getAllProducts } from '@/services/productService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '18');

    const products = await getAllProducts();
    const start = (page - 1) * limit;
    const end = page * limit;

    const paginatedProducts = products.slice(start, end);

    return NextResponse.json({
        products: paginatedProducts,
        totalPages: Math.ceil(products.length / limit),
    });
}
