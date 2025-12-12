import { redirect } from 'next/navigation';

interface RouteParams {
  slug: string;
}

/**
 * This route handles redirects from /products/categories/[slug]
 * to /products/category/[slug] for unified routing
 */
export async function GET(
  _: Request,
  { params }: { params: Promise<RouteParams> }
) {
  const { slug } = await params;
  
  // Redirect /products/categories/[slug] to /products/category/[slug]
  redirect(`/products/category/${slug}`);
}

/**
 * Optional: Set revalidate for dynamic routing
 */
export const revalidate = 3600; // 1 hour
