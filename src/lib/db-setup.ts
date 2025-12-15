/**
 * Database Setup & Migration Helper
 * Ensures database is properly initialized before running the app
 * 
 * Usage:
 * - Call this during application startup
 * - Or run: node -r esbuild-register scripts/setup-db.ts
 */

import { prisma } from '@/lib/db';

export async function setupDatabase() {
  try {
    console.log('🔄 Checking database connection...');

    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected');

    // List tables to verify schema is applied
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    console.log(`✅ Found ${tables.length} tables in database`);

    // Verify critical tables exist
    const criticalTables = ['User', 'passwordResetToken', 'emailVerificationToken'];
    const tableNames = tables.map(t => t.table_name);

    for (const table of criticalTables) {
      if (!tableNames.includes(table) && !tableNames.includes(table.toLowerCase())) {
        console.warn(`⚠️  Table ${table} not found - migrations may not be applied`);
      }
    }

    console.log('✅ Database setup complete');
    return { success: true };
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('Database ready');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Setup failed:', err);
      process.exit(1);
    });
}

export default setupDatabase;
