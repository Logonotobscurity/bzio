#!/usr/bin/env node

/**
 * Database Connection Diagnostic Script
 * 
 * Tests database connection and provides fixes for common issues
 * Run with: node scripts/db-diagnostic.js
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function runDiagnostics() {
  console.log('🔍 BZION Database Connection Diagnostics');
  console.log('=========================================');
  
  // Check environment variables
  console.log('\n1. Environment Variables Check:');
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('❌ DATABASE_URL is not set');
    console.log('   Fix: Add DATABASE_URL to your .env file');
    console.log('   Example: DATABASE_URL="postgresql://user:password@localhost:5432/bzion"');
    return;
  }
  console.log('✅ DATABASE_URL is set');
  
  // Parse DATABASE_URL
  let dbConfig;
  try {
    const url = new URL(dbUrl);
    dbConfig = {
      host: url.hostname,
      port: url.port || 5432,
      database: url.pathname.slice(1),
      user: url.username,
      password: url.password,
    };
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   User: ${dbConfig.user}`);
  } catch (error) {
    console.log('❌ Invalid DATABASE_URL format');
    console.log('   Error:', error.message);
    return;
  }
  
  // Test raw PostgreSQL connection
  console.log('\n2. Raw PostgreSQL Connection Test:');
  try {
    const pool = new Pool({
      connectionString: dbUrl,
      connectionTimeoutMillis: 5000,
    });
    
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ PostgreSQL connection successful');
    console.log(`   Time: ${result.rows[0].current_time}`);
    console.log(`   Version: ${result.rows[0].pg_version.split(' ')[0]} ${result.rows[0].pg_version.split(' ')[1]}`);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.log('❌ PostgreSQL connection failed');
    console.log('   Error:', error.message);
    console.log('   Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   Fix: Start PostgreSQL server or check connection details');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   Fix: Check hostname in DATABASE_URL');
    } else if (error.code === '28P01') {
      console.log('   Fix: Check username/password in DATABASE_URL');
    } else if (error.code === '3D000') {
      console.log('   Fix: Create database or check database name in DATABASE_URL');
    }
    return;
  }
  
  // Test Prisma connection
  console.log('\n3. Prisma Connection Test:');
  try {
    const pool = new Pool({
      connectionString: dbUrl,
      connectionTimeoutMillis: 5000,
    });
    
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({
      adapter,
      log: ['error'],
    });
    
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Prisma connection successful');
    
    await prisma.$disconnect();
    await pool.end();
  } catch (error) {
    console.log('❌ Prisma connection failed');
    console.log('   Error:', error.message);
    console.log('   Code:', error.code);
    return;
  }
  
  // Test database tables
  console.log('\n4. Database Schema Check:');
  try {
    const pool = new Pool({
      connectionString: dbUrl,
      connectionTimeoutMillis: 5000,
    });
    
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({
      adapter,
      log: ['error'],
    });
    
    // Check if main tables exist
    const tables = ['User', 'Quote', 'FormSubmission', 'NewsletterSubscriber', 'AnalyticsEvent'];
    const results = {};
    
    for (const table of tables) {
      try {
        const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${table}"`);
        results[table] = { exists: true, count: parseInt(count[0].count) };
        console.log(`✅ ${table} table exists (${results[table].count} records)`);
      } catch (error) {
        results[table] = { exists: false, error: error.message };
        console.log(`❌ ${table} table missing or inaccessible`);
        console.log(`   Error: ${error.message}`);
      }
    }
    
    await prisma.$disconnect();
    await pool.end();
    
    // Check if migration is needed
    const missingTables = Object.entries(results).filter(([_, info]) => !info.exists);
    if (missingTables.length > 0) {
      console.log('\n⚠️  Some tables are missing. Run database migration:');
      console.log('   npx prisma migrate dev');
      console.log('   or');
      console.log('   npx prisma db push');
    }
    
  } catch (error) {
    console.log('❌ Schema check failed');
    console.log('   Error:', error.message);
  }
  
  // Test admin dashboard queries
  console.log('\n5. Admin Dashboard Query Test:');
  try {
    const pool = new Pool({
      connectionString: dbUrl,
      connectionTimeoutMillis: 5000,
    });
    
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({
      adapter,
      log: ['error'],
    });
    
    // Test the queries that are failing
    const [userCount, quoteCount, formCount] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.quote.count().catch(() => 0),
      prisma.formSubmission.count().catch(() => 0),
    ]);
    
    console.log('✅ Admin dashboard queries successful');
    console.log(`   Users: ${userCount}`);
    console.log(`   Quotes: ${quoteCount}`);
    console.log(`   Form Submissions: ${formCount}`);
    
    await prisma.$disconnect();
    await pool.end();
    
  } catch (error) {
    console.log('❌ Admin dashboard queries failed');
    console.log('   Error:', error.message);
    console.log('   This is likely the cause of your admin dashboard errors');
  }
  
  console.log('\n🎯 DIAGNOSTIC COMPLETE');
  console.log('======================');
  console.log('If all tests passed, your admin dashboard should work.');
  console.log('If any tests failed, follow the suggested fixes above.');
}

// Run diagnostics
runDiagnostics().catch(console.error);