
import { prisma } from '@/lib/db';

export async function getProducts() {
  try {
    const products = await prisma.products.findMany({
      orderBy: {
        name: 'asc',
      },
      // include shapes may differ in generated client; cast to any
      include: ({ brand: true } as any),
    });
    return products;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch products.');
  }
}

export async function getProductById(id: number) {
  try {
    const product = await prisma.products.findUnique({
      where: { id },
      include: ({
        brand: true,
        company: true,
        categories: {
          include: {
            category: true,
          },
        },
        images: true,
      } as any),
    }) as any;
    return product;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch product.');
  }
}
