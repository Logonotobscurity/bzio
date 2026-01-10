/**
 * Database Module - Public API
 * 
 * Centralized database access and utilities
 */

// Main Prisma client export
export { prisma, checkDatabaseConnection } from '../db';

// Database utilities
export * from '../db-setup';

// TODO: Consolidate database-related files here
// Future structure:
// - client.ts (Prisma client singleton)
// - connection.ts (Connection management)
// - health.ts (Health checks)
// - migrations.ts (Migration utilities)
// - seed.ts (Seeding utilities)
// - index.ts (Public API - this file)
