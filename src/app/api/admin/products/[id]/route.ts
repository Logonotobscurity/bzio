import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { USER_ROLES } from '@/lib/auth-constants';
import { getProductById, updateProduct, deleteProduct, ProductUpdateInput } from '@/app/admin/_services/product.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const productId = parseInt(id);
    
    if (isNaN(productId)) {
      return NextResponse.json({ success: false, error: 'Invalid product ID' }, { status: 400 });
    }

    const result = await getProductById(productId);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: result.product });
  } catch (error) {
    console.error('[ADMIN_PRODUCT_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const productId = parseInt(id);
    
    if (isNaN(productId)) {
      return NextResponse.json({ success: false, error: 'Invalid product ID' }, { status: 400 });
    }

    const body = await request.json();
    
    // Parse and validate input
    const input: ProductUpdateInput = {
      id: productId,
      ...(body.sku !== undefined && { sku: body.sku }),
      ...(body.name !== undefined && { name: body.name }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.detailedDescription !== undefined && { detailedDescription: body.detailedDescription }),
      ...(body.price !== undefined && { price: typeof body.price === 'string' ? parseFloat(body.price) : body.price }),
      ...(body.stockQuantity !== undefined && { stockQuantity: typeof body.stockQuantity === 'string' ? parseInt(body.stockQuantity) : body.stockQuantity }),
      ...(body.unit !== undefined && { unit: body.unit }),
      ...(body.brandId !== undefined && { brandId: typeof body.brandId === 'string' ? parseInt(body.brandId) : body.brandId }),
      ...(body.categoryId !== undefined && { categoryId: typeof body.categoryId === 'string' ? parseInt(body.categoryId) : body.categoryId }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      ...(body.images !== undefined && { images: body.images }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.specifications !== undefined && { specifications: body.specifications }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
    };

    const result = await updateProduct(input);

    if (!result.success) {
      const statusCode = result.error?.includes('not found') ? 404 : 
                         result.error?.includes('already exists') ? 400 : 500;
      return NextResponse.json({ success: false, error: result.error }, { status: statusCode });
    }

    return NextResponse.json({ success: true, product: result.product });
  } catch (error) {
    console.error('[ADMIN_PRODUCT_UPDATE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const productId = parseInt(id);
    
    if (isNaN(productId)) {
      return NextResponse.json({ success: false, error: 'Invalid product ID' }, { status: 400 });
    }

    // Check for hard delete query parameter
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    const result = await deleteProduct(productId, hardDelete);

    if (!result.success) {
      const statusCode = result.error?.includes('not found') ? 404 : 
                         result.error?.includes('Cannot delete') ? 400 : 500;
      return NextResponse.json({ success: false, error: result.error }, { status: statusCode });
    }

    return NextResponse.json({ success: true, message: hardDelete ? 'Product permanently deleted' : 'Product deactivated' });
  } catch (error) {
    console.error('[ADMIN_PRODUCT_DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
