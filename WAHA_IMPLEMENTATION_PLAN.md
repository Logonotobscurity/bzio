# WAHA WhatsApp Integration - Implementation Plan

## Overview
WAHA (WhatsApp HTTP API) provides a self-hosted WhatsApp API solution. Best practice is to run WAHA as a separate service and integrate via HTTP API.

---

## Architecture Decision

### ✅ RECOMMENDED: Microservice Architecture
```
┌─────────────────┐      HTTP API      ┌──────────────┐
│   BZION App     │ ◄─────────────────► │ WAHA Service │
│  (Next.js)      │                     │  (Docker)    │
└─────────────────┘                     └──────────────┘
                                              │
                                              ▼
                                        WhatsApp Web
```

**Why?**
- WAHA requires persistent WebSocket connection
- Separate service = better reliability
- Easy to scale independently
- No impact on Next.js app performance

---

## Implementation Steps

### 1. Setup WAHA Service (Docker)

**File: `docker-compose.waha.yml`**
```yaml
version: '3'
services:
  waha:
    image: devlikeapro/waha
    restart: always
    ports:
      - "3000:3000"
    environment:
      - WHATSAPP_API_KEY=${WAHA_API_KEY}
      - WHATSAPP_HOOK_URL=${WAHA_WEBHOOK_URL}
    volumes:
      - waha_data:/app/.sessions

volumes:
  waha_data:
```

**Start:**
```bash
docker-compose -f docker-compose.waha.yml up -d
```

---

### 2. Project Structure

```
src/
├── lib/
│   └── whatsapp/
│       ├── client.ts          # WAHA HTTP client
│       ├── types.ts           # TypeScript types
│       └── templates.ts       # Message templates
├── services/
│   └── whatsappService.ts     # Business logic
└── app/
    └── api/
        └── webhooks/
            └── whatsapp/
                └── route.ts   # Webhook handler
```

---

### 3. Core Implementation

#### **File: `src/lib/whatsapp/client.ts`**
```typescript
import axios, { AxiosInstance } from 'axios';

export class WAHAClient {
  private client: AxiosInstance;
  private sessionName: string;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.WAHA_URL || 'http://localhost:3000',
      headers: {
        'X-Api-Key': process.env.WAHA_API_KEY,
      },
    });
    this.sessionName = process.env.WAHA_SESSION || 'default';
  }

  async sendText(to: string, text: string) {
    return this.client.post(`/api/sendText`, {
      session: this.sessionName,
      chatId: this.formatPhone(to),
      text,
    });
  }

  async sendImage(to: string, imageUrl: string, caption?: string) {
    return this.client.post(`/api/sendImage`, {
      session: this.sessionName,
      chatId: this.formatPhone(to),
      file: { url: imageUrl },
      caption,
    });
  }

  async getSessionStatus() {
    return this.client.get(`/api/sessions/${this.sessionName}`);
  }

  private formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    return `${cleaned}@c.us`;
  }
}

export const wahaClient = new WAHAClient();
```

#### **File: `src/lib/whatsapp/types.ts`**
```typescript
export interface WhatsAppMessage {
  from: string;
  body: string;
  timestamp: number;
  hasMedia: boolean;
}

export interface SendMessageOptions {
  to: string;
  message: string;
  imageUrl?: string;
}

export interface QuoteNotification {
  customerName: string;
  customerPhone: string;
  quoteReference: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  totalItems: number;
}
```

#### **File: `src/lib/whatsapp/templates.ts`**
```typescript
import { QuoteNotification } from './types';

export const formatQuoteMessage = (data: QuoteNotification): string => {
  const itemsList = data.items
    .map((item, i) => `${i + 1}. ${item.name} (Qty: ${item.quantity})`)
    .join('\n');

  return `
🛍️ *New Quote Request*

*Customer:* ${data.customerName}
*Phone:* ${data.customerPhone}
*Reference:* ${data.quoteReference}

*Items Requested:*
${itemsList}

*Total Items:* ${data.totalItems}

Please respond within 24 hours.
  `.trim();
};

export const formatCustomerConfirmation = (
  customerName: string,
  quoteReference: string
): string => {
  return `
Hello ${customerName}! 👋

Thank you for your quote request!

*Quote Reference:* ${quoteReference}

Our team will review your request and get back to you with a detailed quotation shortly.

Best regards,
BZION Team
  `.trim();
};
```

#### **File: `src/services/whatsappService.ts`**
```typescript
import { wahaClient } from '@/lib/whatsapp/client';
import { formatQuoteMessage, formatCustomerConfirmation } from '@/lib/whatsapp/templates';
import type { QuoteNotification } from '@/lib/whatsapp/types';

export class WhatsAppService {
  async sendQuoteNotification(data: QuoteNotification): Promise<void> {
    const businessPhone = process.env.WHATSAPP_BUSINESS_NUMBER!;
    const message = formatQuoteMessage(data);
    
    await wahaClient.sendText(businessPhone, message);
  }

  async sendCustomerConfirmation(
    customerPhone: string,
    customerName: string,
    quoteReference: string
  ): Promise<void> {
    const message = formatCustomerConfirmation(customerName, quoteReference);
    
    await wahaClient.sendText(customerPhone, message);
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await wahaClient.getSessionStatus();
      return response.data.status === 'WORKING';
    } catch {
      return false;
    }
  }
}

export const whatsappService = new WhatsAppService();
```

#### **File: `src/app/api/webhooks/whatsapp/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    
    if (apiKey !== process.env.WAHA_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const webhook = await request.json();
    
    // Log webhook for debugging
    console.log('WhatsApp webhook received:', webhook.event);

    // Handle different webhook events
    switch (webhook.event) {
      case 'message':
        await handleIncomingMessage(webhook);
        break;
      case 'message.ack':
        await handleMessageAck(webhook);
        break;
      default:
        console.log('Unhandled webhook event:', webhook.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function handleIncomingMessage(webhook: any) {
  // Store message in database
  await prisma.negotiationMessage.create({
    data: {
      quoteId: webhook.payload.quoteId || 'unknown',
      direction: 'inbound',
      channel: 'whatsapp',
      fromNumber: webhook.payload.from,
      body: webhook.payload.body,
      vendorMessageId: webhook.payload.id,
      metadata: webhook.payload,
      status: 'received',
    },
  });
}

async function handleMessageAck(webhook: any) {
  // Update message status
  console.log('Message acknowledged:', webhook.payload.id);
}
```

---

### 4. Integration in RFQ Flow

**Update: `src/app/api/v1/rfq/submit/route.ts`**
```typescript
import { whatsappService } from '@/services/whatsappService';

export async function POST(request: Request) {
  try {
    const validated = rfqSchema.parse(await request.json());

    // Create quote
    const quote = await createQuote({...});

    // Send email
    await sendEmail({...});

    // Send WhatsApp notifications (non-blocking)
    Promise.all([
      whatsappService.sendQuoteNotification({
        customerName: validated.fullName,
        customerPhone: validated.phone,
        quoteReference: quote.reference,
        items: validated.items,
        totalItems: validated.items.reduce((sum, i) => sum + i.quantity, 0),
      }),
      whatsappService.sendCustomerConfirmation(
        validated.phone,
        validated.fullName,
        quote.reference
      ),
    ]).catch(err => console.error('WhatsApp notification failed:', err));

    return NextResponse.json({ success: true, quoteReference: quote.reference });
  } catch (error) {
    // Handle error
  }
}
```

---

### 5. Environment Variables

**Add to `.env`:**
```bash
# WAHA Configuration
WAHA_URL=http://localhost:3000
WAHA_API_KEY=your-secure-api-key-here
WAHA_SESSION=bzion-session
WAHA_WEBHOOK_URL=https://yourdomain.com/api/webhooks/whatsapp

# WhatsApp Business
WHATSAPP_BUSINESS_NUMBER=2348012345678
```

**Add to `.env.example`:**
```bash
# WAHA WhatsApp API
WAHA_URL=http://localhost:3000
WAHA_API_KEY=generate_secure_key
WAHA_SESSION=bzion-session
WAHA_WEBHOOK_URL=https://yourdomain.com/api/webhooks/whatsapp
WHATSAPP_BUSINESS_NUMBER=234XXXXXXXXXX
```

---

### 6. Install Dependencies

```bash
npm install axios
```

---

## Deployment Checklist

### Development
- [ ] Start WAHA: `docker-compose -f docker-compose.waha.yml up -d`
- [ ] Scan QR code to connect WhatsApp
- [ ] Test connection: `curl http://localhost:3000/api/sessions/default`
- [ ] Test sending message

### Production
- [ ] Deploy WAHA on separate server/container
- [ ] Use persistent volume for sessions
- [ ] Set up monitoring for WAHA service
- [ ] Configure webhook URL with HTTPS
- [ ] Set strong API key
- [ ] Test failover scenarios

---

## Testing

**File: `src/__tests__/whatsapp.test.ts`**
```typescript
import { whatsappService } from '@/services/whatsappService';

describe('WhatsApp Service', () => {
  it('should format quote message correctly', async () => {
    const result = await whatsappService.sendQuoteNotification({
      customerName: 'Test User',
      customerPhone: '2348012345678',
      quoteReference: 'Q-123456',
      items: [{ name: 'Rice 50kg', quantity: 10 }],
      totalItems: 10,
    });
    
    expect(result).toBeDefined();
  });
});
```

---

## Monitoring & Maintenance

### Health Check Endpoint
**File: `src/app/api/health/whatsapp/route.ts`**
```typescript
import { whatsappService } from '@/services/whatsappService';
import { NextResponse } from 'next/server';

export async function GET() {
  const isConnected = await whatsappService.checkConnection();
  
  return NextResponse.json({
    service: 'whatsapp',
    status: isConnected ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
  });
}
```

### Logging
```typescript
// Add to whatsappService.ts
private async logMessage(direction: 'sent' | 'received', data: any) {
  await prisma.negotiationMessage.create({
    data: {
      direction,
      channel: 'whatsapp',
      ...data,
    },
  });
}
```

---

## Alternative: Direct Integration (NOT RECOMMENDED)

If you must integrate directly without Docker:

```bash
npm install @waha/waha
```

But this approach:
- ❌ Blocks Next.js event loop
- ❌ Requires persistent connection
- ❌ Harder to scale
- ❌ Session management issues

**Stick with microservice approach!**

---

## Summary

✅ **Best Practice: Microservice Architecture**
- WAHA runs as separate Docker service
- Next.js communicates via HTTP API
- Webhooks for incoming messages
- Non-blocking async notifications
- Easy to monitor and scale

**Total Implementation Time:** 4-6 hours
**Complexity:** Medium
**Reliability:** High
