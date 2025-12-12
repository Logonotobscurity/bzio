import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import products from '../src/lib/data/all-products.json';
import brands from '../src/lib/data/brands.json';
import categories from '../src/lib/data/categories.json';
import companies from '../src/lib/data/companies.json';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface RawProduct {
  sku?: string;
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
  brandSlug?: string;
  brand?: string;
  companySlug?: string;
  company?: string;
  categorySlugs?: string[];
  categorySlug?: string;
  images?: string[];
}

function normalizeCategorySlugs(p: RawProduct): string[] {
  if (Array.isArray(p.categorySlugs)) return p.categorySlugs;
  if (p.categorySlug) return [p.categorySlug];
  return [];
}

async function main() {
  console.log('Start seeding...');

  // upsert companies
  for (const c of companies) {
    await prisma.company.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { slug: c.slug, name: c.name },
    });
  }

  // upsert brands
  for (const b of brands) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name },
      create: { slug: b.slug, name: b.name },
    });
  }

  // upsert categories
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { slug: c.slug, name: c.name },
    });
  }

  // upsert products
  // treat source products as untyped to avoid Prisma model type assumptions
  for (const pRaw of products as unknown[]) {
    const p = pRaw as RawProduct;

    // support multiple possible source field names; normalize before DB operations
    const brandSlug = p.brandSlug ?? p.brand ?? undefined;
    const companySlug = p.companySlug ?? p.company ?? undefined;
    const categorySlugs = normalizeCategorySlugs(p);

    const brand = brandSlug ? await prisma.brand.findUnique({ where: { slug: String(brandSlug) } }) : null;
    const company = companySlug ? await prisma.company.findUnique({ where: { slug: String(companySlug) } }) : null;

    const upserted = await prisma.product.upsert({
      where: { sku: p.sku || '' },
      update: {
        name: p.name || '',
        description: p.description || null,
        price: p.price || null,
        isActive: p.isActive ?? true,
        brandId: brand?.id ?? undefined,
        companyId: company?.id ?? undefined,
      },
      create: {
        sku: p.sku || '',
        name: p.name || '',
        slug: p.slug || p.sku || '',
        description: p.description || null,
        price: p.price || null,
        isActive: p.isActive ?? true,
        brand: brand ? { connect: { id: brand.id } } : undefined,
        company: company ? { connect: { id: company.id } } : undefined,
      }
    });

    // categories linking (tolerate single or multiple slugs)
    if (categorySlugs.length) {
      for (const cslug of categorySlugs) {
        const category = await prisma.category.findUnique({ where: { slug: cslug } });
        if (category) {
          await prisma.productCategory.upsert({
            where: { productId_categoryId: { productId: upserted.id, categoryId: category.id } },
            update: {},
            create: { productId: upserted.id, categoryId: category.id }
          });
        }
      }
    }

    // images
    // delete existing images then insert seed ones to keep deterministic order
    await prisma.productImage.deleteMany({ where: { productId: upserted.id } });
    if (p.images?.length) {
      for (let i = 0; i < p.images.length; i++) {
        const image = p.images[i];
        const url = typeof image === 'string' && image.startsWith('http') ? image : `/products/${image}`;
        await prisma.productImage.create({
          data: {
            productId: upserted.id,
            url,
            alt: p.name || '',
            order: i
          }
        });
      }
    }
  }

  console.log('Seed completed');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
