#!/bin/bash

echo "🚀 Starting WAHA WhatsApp Service..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start WAHA
echo "📦 Starting WAHA container..."
docker-compose -f docker-compose.waha.yml up -d

# Wait for WAHA to start
echo "⏳ Waiting for WAHA to start..."
sleep 5

# Check if WAHA is running
if docker-compose -f docker-compose.waha.yml ps | grep -q "Up"; then
    echo "✅ WAHA is running!"
    echo ""
    echo "📱 Next steps:"
    echo "1. Visit http://localhost:3000 to get QR code"
    echo "2. Scan QR code with WhatsApp mobile app"
    echo "3. Add environment variables to .env file"
    echo "4. Test with: curl http://localhost:9003/api/health/whatsapp"
    echo ""
    echo "📋 View logs: docker-compose -f docker-compose.waha.yml logs -f"
    echo "🛑 Stop WAHA: docker-compose -f docker-compose.waha.yml down"
else
    echo "❌ Failed to start WAHA"
    echo "Check logs: docker-compose -f docker-compose.waha.yml logs"
fi
