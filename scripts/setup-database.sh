#!/bin/bash

# Database Setup Script
# Ensures Prisma is ready and database is properly initialized

set -e

echo "🔄 Database Setup Script"
echo "========================"

# Step 1: Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Step 2: Run migrations
echo "🔄 Applying database migrations..."
if [ "$NODE_ENV" = "production" ]; then
  echo "Running in PRODUCTION mode - using prisma migrate deploy"
  npx prisma migrate deploy
else
  echo "Running in DEVELOPMENT mode - using prisma migrate dev"
  npx prisma migrate dev --skip-generate
fi

# Step 3: Verify connection
echo "✅ Verifying database connection..."
node -e "
const prisma = require('./lib/prisma').default;
prisma.\$queryRaw\`SELECT 1\`
  .then(() => console.log('✅ Database is ready'))
  .catch(err => {
    console.error('❌ Database error:', err.message);
    process.exit(1);
  })
"

echo "✅ Database setup complete!"
