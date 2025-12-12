# WAHA WhatsApp Integration - Quick Setup Guide

## ✅ Implementation Complete

All WAHA integration files have been created and integrated into your project.

---

## 📁 Files Created

```
src/
├── lib/whatsapp/
│   ├── client.ts          ✅ WAHA HTTP client
│   ├── types.ts           ✅ TypeScript types
│   └── templates.ts       ✅ Message templates
├── services/
│   └── whatsappService.ts ✅ Business logic
└── app/api/
    ├── webhooks/whatsapp/
    │   └── route.ts       ✅ Webhook handler
    └── health/whatsapp/
        └── route.ts       ✅ Health check

docker-compose.waha.yml    ✅ WAHA service config
```

---

## 🚀 Quick Start

### 1. Start WAHA Service

```bash
# Start WAHA in Docker
docker-compose -f docker-compose.waha.yml up -d

# Check logs
docker-compose -f docker-compose.waha.yml logs -f
```

### 2. Connect WhatsApp

```bash
# Get QR code
curl http://localhost:3000/api/sessions/default

# Or visit in browser
open http://localhost:3000
```

Scan the QR code with your WhatsApp mobile app:
1. Open WhatsApp on your phone
2. Go to Settings → Linked Devices
3. Tap "Link a Device"
4. Scan the QR code

### 3. Configure Environment Variables

Add to your `.env` file:

```bash
# WAHA Configuration
WAHA_URL=http://localhost:3000
WAHA_API_KEY=your-secure-api-key-here
WAHA_SESSION=bzion-session
WAHA_WEBHOOK_URL=http://localhost:9003/api/webhooks/whatsapp

# WhatsApp Business Number (without + or spaces)
WHATSAPP_BUSINESS_NUMBER=2348012345678
```

### 4. Test Integration

```bash
# Check WAHA health
curl http://localhost:9003/api/health/whatsapp

# Test sending message (after connecting WhatsApp)
curl -X POST http://localhost:3000/api/sendText \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: your-secure-api-key-here" \
  -d '{
    "session": "bzion-session",
    "chatId": "2348012345678@c.us",
    "text": "Test message from BZION"
  }'
```

---

## 🔄 How It Works

### RFQ Submission Flow

```
User submits RFQ
    ↓
Create Quote in DB
    ↓
Send Email Confirmation
    ↓
Send WhatsApp Notifications (async)
    ├─→ To Business: Quote details
    └─→ To Customer: Confirmation
```

### Code Integration

The RFQ endpoint (`/api/v1/rfq/submit`) now automatically:
1. ✅ Creates quote in database
2. ✅ Sends email confirmation
3. ✅ Sends WhatsApp to business number
4. ✅ Sends WhatsApp to customer

**Non-blocking:** WhatsApp failures won't break the RFQ submission.

---

## 📱 Message Templates

### Business Notification
```
🛍️ *New Quote Request*

*Customer:* John Doe
*Phone:* 2348012345678
*Reference:* Q-1234567890

*Items Requested:*
1. Rice 50kg (Qty: 10)
2. Cooking Oil 5L (Qty: 20)

*Total Items:* 30

Please respond within 24 hours.
```

### Customer Confirmation
```
Hello John Doe! 👋

Thank you for your quote request!

*Quote Reference:* Q-1234567890

Our team will review your request and get back to you 
with a detailed quotation shortly.

Best regards,
BZION Team
```

---

## 🔍 Monitoring

### Health Check
```bash
curl http://localhost:9003/api/health/whatsapp
```

**Response:**
```json
{
  "service": "whatsapp",
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Check WAHA Status
```bash
curl http://localhost:3000/api/sessions/bzion-session
```

### View Logs
```bash
# WAHA logs
docker-compose -f docker-compose.waha.yml logs -f

# Your app logs
npm run dev
```

---

## 🛠️ Troubleshooting

### WAHA Not Starting
```bash
# Check if port 3000 is available
lsof -i :3000

# Restart WAHA
docker-compose -f docker-compose.waha.yml restart
```

### WhatsApp Not Connected
```bash
# Check session status
curl http://localhost:3000/api/sessions/bzion-session

# If status is "FAILED", restart session
curl -X DELETE http://localhost:3000/api/sessions/bzion-session
curl -X POST http://localhost:3000/api/sessions/bzion-session
```

### Messages Not Sending
1. Check WAHA is running: `docker ps`
2. Check WhatsApp is connected: Visit `http://localhost:3000`
3. Check environment variables are set
4. Check logs for errors

### Webhook Not Receiving
1. Ensure `WAHA_WEBHOOK_URL` is accessible from WAHA container
2. For local dev, use `http://host.docker.internal:9003/api/webhooks/whatsapp`
3. Check webhook endpoint: `curl -X POST http://localhost:9003/api/webhooks/whatsapp -H "x-api-key: your-key"`

---

## 🚀 Production Deployment

### 1. Deploy WAHA Separately
```bash
# On production server
docker run -d \
  --name waha \
  --restart always \
  -p 3000:3000 \
  -e WHATSAPP_API_KEY=your-production-key \
  -e WHATSAPP_HOOK_URL=https://yourdomain.com/api/webhooks/whatsapp \
  -v waha_data:/app/.sessions \
  devlikeapro/waha
```

### 2. Update Environment Variables
```bash
WAHA_URL=https://waha.yourdomain.com
WAHA_API_KEY=your-production-key
WAHA_WEBHOOK_URL=https://yourdomain.com/api/webhooks/whatsapp
WHATSAPP_BUSINESS_NUMBER=234XXXXXXXXXX
```

### 3. Setup Monitoring
- Monitor WAHA uptime
- Alert on WhatsApp disconnection
- Log all message failures
- Track message delivery rates

---

## 📊 Usage Examples

### Send Custom Message
```typescript
import { wahaClient } from '@/lib/whatsapp/client';

await wahaClient.sendText('2348012345678', 'Hello from BZION!');
```

### Send Image
```typescript
await wahaClient.sendImage(
  '2348012345678',
  'https://example.com/image.jpg',
  'Product catalog'
);
```

### Check Connection
```typescript
import { whatsappService } from '@/services/whatsappService';

const isConnected = await whatsappService.checkConnection();
console.log('WhatsApp connected:', isConnected);
```

---

## 🎯 Next Steps

1. ✅ Start WAHA: `docker-compose -f docker-compose.waha.yml up -d`
2. ✅ Scan QR code to connect WhatsApp
3. ✅ Add environment variables to `.env`
4. ✅ Test RFQ submission
5. ✅ Monitor health endpoint
6. ✅ Deploy to production

---

## 📚 Resources

- WAHA Documentation: https://waha.devlike.pro
- WAHA GitHub: https://github.com/devlikeapro/waha
- WhatsApp Business API: https://business.whatsapp.com

---

## ✅ Integration Status

- [x] WAHA client created
- [x] Message templates created
- [x] WhatsApp service created
- [x] Webhook handler created
- [x] Health check endpoint created
- [x] RFQ integration complete
- [x] Docker Compose configured
- [x] Environment variables documented

**Your WhatsApp integration is ready to use!** 🎉
