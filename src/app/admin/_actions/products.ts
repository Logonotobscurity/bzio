'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  stockQuantity: z.coerce.number().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

// Normalize slug generation
function makeSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

// Helper to apply the product payload and return a normalized data object
function normalizePayload(payload: any) {
  return {
    sku: String(payload.sku),
    name: String(payload.name),
    description: payload.description || null,
    price: Number(payload.price || 0),
    stockQuantity: Number(payload.stockQuantity ?? payload.inStock ?? 0),
    isActive: payload.isActive === 'on' || payload.isActive === true || payload.isActive === 'true',
    slug: payload.slug || makeSlug(String(payload.name)),
  } as any;
}

// Support both the existing server-action FormData signature and the client-callable payload signature.
export async function createProduct(arg1: unknown, arg2?: unknown) {
  try {
    let payload: any;
    // Called from client with a payload object: createProduct(payload)
    if (arg2 === undefined) {
      payload = arg1 as any;
    } else {
      // Called as server form action: createProduct(prevState, formData)
      const formData = arg2 as FormData;
      payload = Object.fromEntries((formData as any).entries());
    }

    const data = normalizePayload(payload);

    const validation = productSchema.safeParse({
      sku: data.sku,
      name: data.name,
      description: data.description,
      price: data.price,
      stockQuantity: data.stockQuantity,
      isActive: data.isActive,
    });

    if (!validation.success) {
      return { success: false, error: 'Validation failed', details: validation.error.formErrors.fieldErrors };
    }

    await prisma.products.create({
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description,
        price: data.price,
        stockQuantity: data.stockQuantity,
        isActive: data.isActive,
        slug: data.slug,
        brandId: Number(payload.brandId) || 1,
        categoryId: Number(payload.categoryId) || 1,
      }
    });

    // For client calls we return a result object instead of redirecting.
    if (arg2 === undefined) {
      revalidatePath('/admin/products');
      return { success: true };
    }

    revalidatePath('/admin/products');
    redirect('/admin/products');
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function updateProduct(id: number, ...rest: any[]) {
  try {
    let payload: any;
    // Called from client: updateProduct(id, payload)
    if (rest.length === 1) {
      payload = rest[0];
    } else {
      // server form action signature: updateProduct(id, prevState, formData)
      const formData = rest[1] as FormData;
      payload = Object.fromEntries((formData as any).entries());
    }

    const data = normalizePayload(payload);

    const validation = productSchema.safeParse({
      sku: data.sku,
      name: data.name,
      description: data.description,
      price: data.price,
      stockQuantity: data.stockQuantity,
      isActive: data.isActive,
    });

    if (!validation.success) {
      return { success: false, error: 'Validation failed', details: validation.error.formErrors.fieldErrors };
    }

    await prisma.products.update({
      where: { id },
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description,
        price: data.price,
        stockQuantity: data.stockQuantity,
        isActive: data.isActive,
        slug: data.slug,
      }
    });

    if (rest.length === 1) {
      revalidatePath('/admin/products');
      return { success: true };
    }

    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${id}/edit`);
    redirect('/admin/products');
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function toggleProductStatus(id: number) {
  try {
    const product = await prisma.products.findUnique({ where: { id } });
    if (!product) return { success: false, error: 'Not found' };

    await prisma.products.update({
      where: { id },
      data: { isActive: !product.isActive }
    });

    revalidatePath('/admin/products');
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function updateStock(id: number, newStock: number, reason?: string) {
  try {
    await prisma.products.update({
      where: { id },
      data: { stockQuantity: newStock }
    });

    revalidatePath('/admin/products');
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function deleteProduct(id: number, soft = true) {
  try {
    if (soft) {
      await prisma.products.update({ where: { id }, data: { isActive: false } });
    } else {
      await prisma.products.delete({ where: { id } });
    }
    revalidatePath('/admin/products');
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
