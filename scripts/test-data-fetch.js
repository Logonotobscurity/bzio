import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const DB_URL = process.env.DATABASE_URL;

async function testDataFetch() {
  console.log('Testing Data Fetch...\n');

  const pool = new Pool({ 
    connectionString: DB_URL,
    connectionTimeoutMillis: 15000,
    max: 5,
  });
  
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter, log: ['error'] });

  try {
    console.log('1. Testing Users...');
    const users = await prisma.user.findMany({ take: 5 });
    console.log(`✓ Found ${users.length} users`);

    console.log('\n2. Testing Quotes...');
    const quotes = await prisma.quote.findMany({ take: 5 });
    console.log(`✓ Found ${quotes.length} quotes`);

    console.log('\n3. Testing Newsletter...');
    const newsletter = await prisma.newsletterSubscriber.findMany({ take: 5 });
    console.log(`✓ Found ${newsletter.length} subscribers`);

    console.log('\n4. Testing Forms...');
    const forms = await prisma.formSubmission.findMany({ take: 5 });
    console.log(`✓ Found ${forms.length} forms`);

    console.log('\n5. Testing Events...');
    const events = await prisma.analyticsEvent.findMany({ take: 5 });
    console.log(`✓ Found ${events.length} events`);

    console.log('\n✅ All data fetch tests passed!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testDataFetch();