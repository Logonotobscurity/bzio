/**
 * Seed script to populate products from all-products.json
 * Run with: npx ts-node prisma/seed-products.ts
 * Or: npx tsx prisma/seed-products.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ProductJson {
  id: number;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  brandId: number;
  company?: string;
  companyId?: number;
  category: string;
  categorySlug: string;
  description: string;
  detailedDescription?: string;
  price: number;
  moq?: number;
  unit?: string;
  inStock?: boolean;
  quantity?: number;
  images?: string[];
  specifications?: Record<string, unknown>;
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
}

async function main() {
  console.log('🌱 Starting product seed...');

  // Read products JSON
  const jsonPath = path.join(__dirname, '../src/lib/data/all-products.json');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const products: ProductJson[] = JSON.parse(rawData);

  console.log(`📦 Found ${products.length} products to seed`);

  // Extract unique brands and categories
  const brandsMap = new Map<string, { name: string; slug: string }>();
  const categoriesMap = new Map<string, { name: string; slug: string }>();

  for (const p of products) {
    if (p.brand && !brandsMap.has(p.brand)) {
      brandsMap.set(p.brand, {
        name: p.brand,
        slug: p.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      });
    }
    if (p.category && !categoriesMap.has(p.category)) {
      categoriesMap.set(p.category, {
        name: p.category,
        slug: p.categorySlug || p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      });
    }
  }

  // Upsert brands
  console.log(`🏷️  Seeding ${brandsMap.size} brands...`);
  const brandIdMap = new Map<string, number>();
  for (const [name, data] of brandsMap) {
    const brand = await prisma.brands.upsert({
      where: { slug: data.slug },
      update: { name: data.name },
      create: { name: data.name, slug: data.slug, isActive: true, updatedAt: new Date() },
    });
    brandIdMap.set(name, brand.id);
  }

  // Upsert categories
  console.log(`📁 Seeding ${categoriesMap.size} categories...`);
  const categoryIdMap = new Map<string, number>();
  for (const [name, data] of categoriesMap) {
    const category = await prisma.categories.upsert({
      where: { slug: data.slug },
      update: { name: data.name },
      create: { name: data.name, slug: data.slug, isActive: true, updatedAt: new Date() },
    });
    categoryIdMap.set(name, category.id);
  }

  // Upsert products
  console.log(`📦 Seeding ${products.length} products...`);
  let created = 0;
  let updated = 0;

  for (const p of products) {
    const brandId = brandIdMap.get(p.brand);
    const categoryId = categoryIdMap.get(p.category);

    if (!brandId || !categoryId) {
      console.warn(`⚠️  Skipping ${p.name}: missing brand or category`);
      continue;
    }

    try {
      const existing = await prisma.products.findUnique({ where: { sku: p.sku } });
      
      if (existing) {
        await prisma.products.update({
          where: { sku: p.sku },
          data: {
            name: p.name,
            slug: p.slug,
            description: p.description,
            detailedDescription: p.detailedDescription,
            price: p.price,
            unit: p.unit || 'Unit',
            imageUrl: p.images?.[0] || null,
            images: p.images || [],
            isActive: p.isActive ?? true,
            isFeatured: p.isFeatured ?? false,
            stockQuantity: p.quantity ?? 0,
            minOrderQty: p.moq ?? 1,
            tags: p.tags || [],
            specifications: p.specifications ? JSON.parse(JSON.stringify(p.specifications)) : null,
            brands: { connect: { id: brandId } },
            categories: { connect: { id: categoryId } },
            updatedAt: new Date(),
          },
        });
        updated++;
      } else {
        await prisma.products.create({
          data: {
            name: p.name,
            slug: p.slug,
            description: p.description,
            detailedDescription: p.detailedDescription,
            sku: p.sku,
            price: p.price,
            unit: p.unit || 'Unit',
            imageUrl: p.images?.[0] || null,
            images: p.images || [],
            isActive: p.isActive ?? true,
            isFeatured: p.isFeatured ?? false,
            stockQuantity: p.quantity ?? 0,
            minOrderQty: p.moq ?? 1,
            tags: p.tags || [],
            specifications: p.specifications ? JSON.parse(JSON.stringify(p.specifications)) : null,
            brands: { connect: { id: brandId } },
            categories: { connect: { id: categoryId } },
            updatedAt: new Date(),
          },
        });
        created++;
      }
    } catch (error) {
      console.error(`❌ Error seeding ${p.name}:`, error);
    }
  }

  console.log(`✅ Seed complete: ${created} created, ${updated} updated`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
