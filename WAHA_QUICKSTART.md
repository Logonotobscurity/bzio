# WAHA WhatsApp - Quick Start Guide

## Prerequisites

✅ Docker installed on your system

---

## Step 1: Pull WAHA Image

```bash
docker pull devlikeapro/waha
```

---

## Step 2: Start WAHA

### Option A: Using Docker Compose (Recommended)

```bash
docker-compose -f docker-compose.waha.yml up -d
```

### Option B: Using Docker Run

```bash
docker run -it -p 3000:3000/tcp --name waha devlikeapro/waha
```

**Expected output:**
```
WhatsApp HTTP API is running on: http://[::1]:3000
```

---

## Step 3: Open Swagger UI

Open in your browser: **http://localhost:3000/**

You'll see the API documentation (Swagger interface).

---

## Step 4: Start a Session

1. Find **POST /api/sessions** in Swagger
2. Click **"Try it out"**
3. Use this payload:

```json
{
  "name": "default"
}
```

4. Click **"Execute"**

---

## Step 5: Get QR Code

1. Find **GET /api/screenshot** in Swagger
2. Click **"Try it out"**
3. Enter session name: `default`
4. Click **"Execute"**

You'll see a QR code image.

---

## Step 6: Scan QR Code

1. Open WhatsApp on your phone
2. Go to **Settings → Linked Devices**
3. Tap **"Link a Device"**
4. Scan the QR code from the screenshot

---

## Step 7: Verify Connection

Wait 5-10 seconds, then:

1. Execute **GET /api/screenshot** again
2. You should see your WhatsApp chat list

✅ **You're connected!**

---

## Step 8: Send Your First Message

### Via Swagger UI

1. Find **POST /api/sendText**
2. Click **"Try it out"**
3. Use this payload (replace with your phone number):

```json
{
  "chatId": "2348012345678@c.us",
  "text": "Hello from BZION!",
  "session": "default"
}
```

**Note:** Phone format is `COUNTRYCODE + NUMBER + @c.us` (no + symbol)

### Via cURL

```bash
export PHONE=2348012345678
curl -d "{\"chatId\": \"${PHONE}@c.us\", \"text\": \"Hello from BZION!\", \"session\": \"default\"}" \
  -H "Content-Type: application/json" \
  -X POST http://localhost:3000/api/sendText
```

---

## Step 9: Configure Your App

Add to `.env`:

```bash
# WAHA Configuration
WAHA_URL=http://localhost:3000
WAHA_SESSION=default
WAHA_WEBHOOK_URL=http://host.docker.internal:9003/api/webhooks/whatsapp

# Your WhatsApp Business Number (without +)
WHATSAPP_BUSINESS_NUMBER=2348012345678
```

---

## Step 10: Test Integration

### Test Health Check

```bash
curl http://localhost:9003/api/health/whatsapp
```

### Submit Test RFQ

Go to your app and submit a quote request. You should receive:
- ✅ Email confirmation
- ✅ WhatsApp message to business number
- ✅ WhatsApp confirmation to customer

---

## Useful Commands

### Check WAHA Status

```bash
# Via API
curl http://localhost:3000/api/sessions/default

# Via Docker
docker ps | grep waha
```

### View Logs

```bash
# Docker Compose
docker-compose -f docker-compose.waha.yml logs -f

# Docker Run
docker logs -f waha
```

### Stop WAHA

```bash
# Docker Compose
docker-compose -f docker-compose.waha.yml down

# Docker Run
docker stop waha
docker rm waha
```

### Restart Session

If WhatsApp disconnects:

```bash
# Delete session
curl -X DELETE http://localhost:3000/api/sessions/default

# Start new session
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"name": "default"}'

# Get new QR code
curl http://localhost:3000/api/screenshot?session=default
```

---

## Phone Number Format

| Country | Phone Number | chatId Format |
|---------|-------------|---------------|
| Nigeria | +234 801 234 5678 | `2348012345678@c.us` |
| USA | +1 213 213 2130 | `12132132130@c.us` |
| UK | +44 20 1234 5678 | `442012345678@c.us` |

**Rule:** Remove `+`, spaces, and dashes, then add `@c.us`

---

## Troubleshooting

### QR Code Not Showing

```bash
# Check if WAHA is running
docker ps

# Check logs
docker logs waha

# Restart WAHA
docker restart waha
```

### Message Not Sending

1. Check session status: `curl http://localhost:3000/api/sessions/default`
2. Status should be `WORKING`
3. If not, restart session (see above)

### Webhook Not Receiving

For local development, use `host.docker.internal` instead of `localhost`:

```bash
WAHA_WEBHOOK_URL=http://host.docker.internal:9003/api/webhooks/whatsapp
```

---

## Next Steps

✅ WAHA is running
✅ WhatsApp is connected
✅ First message sent
✅ App configured

**Now test your RFQ flow:**
1. Go to your app
2. Add products to quote
3. Submit quote request
4. Check WhatsApp for notifications

---

## Production Deployment

For production, deploy WAHA on a separate server:

```bash
docker run -d \
  --name waha \
  --restart always \
  -p 3000:3000/tcp \
  -e WHATSAPP_HOOK_URL=https://yourdomain.com/api/webhooks/whatsapp \
  -v waha_data:/app/.sessions \
  devlikeapro/waha
```

Then update your `.env`:

```bash
WAHA_URL=https://waha.yourdomain.com
WHATSAPP_BUSINESS_NUMBER=234XXXXXXXXXX
```

---

## Resources

- 📚 WAHA Docs: https://waha.devlike.pro
- 🐙 GitHub: https://github.com/devlikeapro/waha
- 💬 Support: https://github.com/devlikeapro/waha/discussions

---

**You're all set! 🎉**
