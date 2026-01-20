import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { USER_ROLES } from '@/lib/auth-constants';
import { getProducts, getProductStats, exportProductsToCSV, createProduct, ProductCreateInput } from '@/app/admin/_services/product.service';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      const stats = await getProductStats();
      return NextResponse.json(stats);
    }

    if (action === 'export') {
      const csv = await exportProductsToCSV({
        search: searchParams.get('search') || undefined,
        status: (searchParams.get('status') as 'active' | 'inactive' | 'all') || undefined,
        stock: (searchParams.get('stock') as 'in-stock' | 'low-stock' | 'out-of-stock' | 'all') || undefined,
      });
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="products-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const filters = {
      search: searchParams.get('search') || undefined,
      status: (searchParams.get('status') as 'active' | 'inactive' | 'all') || undefined,
      stock: (searchParams.get('stock') as 'in-stock' | 'low-stock' | 'out-of-stock' | 'all') || undefined,
      category: searchParams.get('category') || undefined,
    };

    const result = await getProducts(filters, page, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[ADMIN_PRODUCTS_API]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    // Parse and validate input
    const input: ProductCreateInput = {
      sku: body.sku,
      name: body.name,
      slug: body.slug,
      description: body.description,
      detailedDescription: body.detailedDescription,
      price: typeof body.price === 'string' ? parseFloat(body.price) : body.price,
      stockQuantity: typeof body.stockQuantity === 'string' ? parseInt(body.stockQuantity) : (body.stockQuantity ?? 0),
      unit: body.unit,
      brandId: typeof body.brandId === 'string' ? parseInt(body.brandId) : body.brandId,
      categoryId: typeof body.categoryId === 'string' ? parseInt(body.categoryId) : body.categoryId,
      imageUrl: body.imageUrl,
      images: body.images,
      tags: body.tags,
      specifications: body.specifications,
      isActive: body.isActive,
      isFeatured: body.isFeatured,
    };

    const result = await createProduct(input);

    if (!result.success) {
      // Determine appropriate status code
      const statusCode = result.error?.includes('already exists') ? 400 : 
                         result.error?.includes('not found') ? 400 : 
                         result.error?.includes('required') ? 400 : 500;
      return NextResponse.json({ success: false, error: result.error }, { status: statusCode });
    }

    return NextResponse.json({ success: true, product: result.product }, { status: 201 });
  } catch (error) {
    console.error('[ADMIN_PRODUCTS_CREATE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
