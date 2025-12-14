import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
  // Prevent multiple instances of Prisma Client in development
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __pool: Pool | undefined;
}

let prisma: PrismaClient;
let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  // Production: create new pool and client for each app instance
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({
    adapter,
    ...(process.env.DEBUG ? { log: ['query', 'info'] } : {}),
  });
} else {
  // Development: reuse global pool and client to prevent connection exhaustion during HMR
  if (!global.__pool) {
    global.__pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  pool = global.__pool;
  
  if (!global.__prisma) {
    const adapter = new PrismaPg(pool);
    global.__prisma = new PrismaClient({
      adapter,
      ...(process.env.DEBUG ? { log: ['query', 'info'] } : {}),
    });
  }
  prisma = global.__prisma;
}

export default prisma;
