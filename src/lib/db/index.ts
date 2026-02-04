import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

declare global {
  // allow global `var` declarations
   
  var prisma: PrismaClient | undefined
}

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL is not set. Database operations will fail.');
}

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL!,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
  max: 20,
  min: 2,
  ssl: { rejectUnauthorized: false },
})

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

const adapter = new PrismaPg(pool)
export const prisma = 
  global.prisma ||
  // Cast adapter to `any` to work around a TypeScript typing mismatch
  // between `@prisma/adapter-pg` and the generated Prisma `DriverAdapter`.
  // This is a temporary, reversible unblocker.
  new PrismaClient({
    adapter: adapter as any,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}
