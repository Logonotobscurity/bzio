#!/bin/bash

echo "🚀 Installing required dependencies for BZION Hub fixes..."

# Install email service
echo "📧 Installing Resend for email service..."
npm install resend

# Install rate limiting (optional - uncomment if needed)
# echo "⏱️  Installing Upstash for rate limiting..."
# npm install @upstash/ratelimit @upstash/redis

# Install authentication (optional - uncomment if needed)
# echo "🔐 Installing NextAuth for authentication..."
# npm install next-auth @auth/prisma-adapter bcryptjs
# npm install -D @types/bcryptjs

# Install monitoring (optional - uncomment if needed)
# echo "📊 Installing Sentry for monitoring..."
# npm install @sentry/nextjs

echo "✅ Core dependencies installed!"
echo ""
echo "Next steps:"
echo "1. Set RESEND_API_KEY in your environment variables"
echo "2. Set DATABASE_URL in your environment variables"
echo "3. Run: npm run build"
echo "4. Run: npm run dev"
