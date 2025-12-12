# FIX FRAMEWORK - BZION Hub Technical Debt Resolution

## FRAMEWORK PRINCIPLES

### 1. TRIAGE → FIX → VERIFY → DOCUMENT
Every issue follows this 4-step cycle.

### 2. SECURITY FIRST, ALWAYS
Security issues block everything else.

### 3. FIX ROOT CAUSE, NOT SYMPTOMS
Don't patch - eliminate the underlying problem.

### 4. ONE ISSUE, ONE PR
Atomic changes for easy review and rollback.

### 5. TEST BEFORE MERGE
No fix is complete without verification.

---

## PHASE 1: EMERGENCY TRIAGE (DAY 1)

### 🚨 IMMEDIATE ACTIONS (Next 2 Hours)

#### 1.1 Secure Database Credentials
```bash
# Step 1: Rotate credentials at db.prisma.io
# Step 2: Remove from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Step 3: Force push (coordinate with team)
git push origin --force --all

# Step 4: Update .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Step 5: Set in deployment platform
# Vercel/Netlify/Firebase: Add DATABASE_URL in dashboard
```

**Verification:**
```bash
git log --all --full-history -- .env  # Should show removal
```

#### 1.2 Add Security Headers
```typescript
// next.config.js - ADD THIS NOW
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
];

module.exports = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  // ... existing config
};
```

#### 1.3 Emergency Monitoring
```bash
# Install Sentry (5 min setup)
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## PHASE 2: CRITICAL FIXES (WEEK 1)

### Priority Order: Security → Data → Communication

### 2.1 Fix Email Service (4 hours)

**File: `src/lib/api/email.ts`**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (options: ISendEmailOptions): Promise<void> => {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    throw new Error('Email service not configured');
  }

  const { data, error } = await resend.emails.send({
    from: options.from || process.env.EMAIL_FROM || 'BZION <noreply@bzion.com>',
    to: options.to,
    subject: options.subject,
    react: options.react,
  });

  if (error) throw error;
};
```

**Install:**
```bash
npm install resend
```

**Env vars:**
```bash
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=BZION <noreply@yourdomain.com>
```

**Test:**
```typescript
// src/app/api/test-email/route.ts
import { sendEmail } from '@/lib/api/email';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      react: <div>Test</div>,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### 2.2 Connect Real Database (6 hours)

**Step 1: Update Repository Index**
```typescript
// src/repositories/index.ts
const USE_DB = process.env.DATABASE_URL && process.env.USE_DATABASE === 'true';

export const brandRepository = USE_DB ? brandDbRepo : brandStaticRepo;
export const categoryRepository = USE_DB ? categoryDbRepo : categoryStaticRepo;
export const companyRepository = USE_DB ? companyDbRepo : companyStaticRepo;
export const productRepository = USE_DB ? productDbRepo : productStaticRepo;
```

**Step 2: Fix Type Mismatches**
```typescript
// src/lib/schema.ts - DELETE THIS FILE
// Use Prisma types instead:

// src/types/index.ts
export type { Product, Brand, Category, Company } from '@prisma/client';

// For enriched types:
export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { brand: true; images: true; categories: { include: { category: true } } };
}>;
```

**Step 3: Update Services**
```typescript
// src/services/productService.ts
import { brandRepository, categoryRepository, companyRepository, productRepository } from '@/repositories';

export const getAllProducts = async () => {
  return productRepository.all();
};
// ... use repository pattern consistently
```

**Step 4: Migrate Data**
```bash
# Run migrations
npx prisma migrate deploy

# Seed database
npm run seed
```

**Step 5: Test Switch**
```bash
# Test with static data
USE_DATABASE=false npm run dev

# Test with database
USE_DATABASE=true npm run dev
```

### 2.3 Complete RFQ Implementation (8 hours)

**File: `src/app/api/v1/rfq/submit/route.ts`**
```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createQuote } from '@/services/quoteService';
import { sendEmail } from '@/lib/api/email';
import RfqSubmissionEmail from '@/components/emails/rfq-submission-email';

const rfqSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  company: z.string().optional(),
  address: z.string().min(10),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    quantity: z.number().min(1),
  })).min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = rfqSchema.parse(body);

    const quote = await createQuote({
      buyerContactEmail: validated.email,
      buyerContactPhone: validated.phone,
      buyerCompanyId: validated.company,
      lines: validated.items.map(item => ({
        productId: item.id,
        productName: item.name,
        qty: item.quantity,
      })),
    });

    await sendEmail({
      to: validated.email,
      subject: `BZION RFQ Confirmation: ${quote.reference}`,
      react: RfqSubmissionEmail({
        fullName: validated.fullName,
        quoteReference: quote.reference,
        items: validated.items,
      }),
    });

    return NextResponse.json({
      success: true,
      quoteReference: quote.reference,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('RFQ submission error:', error);
    return NextResponse.json({ error: 'Failed to submit RFQ' }, { status: 500 });
  }
}
```

### 2.4 Fix Async/Await Issues (2 hours)

**File: `src/app/api/products/route.ts`**
```typescript
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "18");

  const products = await getAllProducts(); // ADD AWAIT
  const start = (page - 1) * limit;
  const end = page * limit;

  return NextResponse.json({
    products: products.slice(start, end),
    totalPages: Math.ceil(products.length / limit),
  });
}
```

**Find all instances:**
```bash
# Find missing awaits
grep -r "= getAllProducts()" src/
grep -r "= getProduct" src/ | grep -v "await"
```

---

## PHASE 3: HIGH PRIORITY (WEEK 2-3)

### 3.1 Implement Authentication (16 hours)

**Install NextAuth:**
```bash
npm install next-auth @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

**File: `src/app/api/auth/[...nextauth]/route.ts`**
```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        
        if (!user?.passwordHash) return null;
        
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        
        return { id: user.id.toString(), email: user.email, name: user.firstName };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
});

export { handler as GET, handler as POST };
```

**Middleware:**
```typescript
// src/middleware.ts
export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*', '/checkout/:path*'],
};
```

### 3.2 Add Error Logging Endpoint (2 hours)

**File: `src/app/api/errors/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    await prisma.errorLog.create({
      data: {
        message: body.message,
        stack: body.stack,
        context: body.context || {},
        severity: body.severity || 'error',
        url: body.url,
        userAgent: request.headers.get('user-agent'),
        sessionId: body.sessionId,
        userId: body.userId,
        breadcrumbs: body.breadcrumbs || [],
        environment: process.env.NODE_ENV || 'development',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log error:', error);
    return NextResponse.json({ error: 'Failed to log error' }, { status: 500 });
  }
}
```

### 3.3 Add Rate Limiting (3 hours)

**Install:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

**File: `src/lib/rate-limit.ts`**
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});
```

**Apply to API routes:**
```typescript
// src/app/api/v1/rfq/submit/route.ts
import { ratelimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  
  // ... rest of handler
}
```

### 3.4 Implement Newsletter Service (4 hours)

**Option A: Database Storage**
```typescript
// Add to prisma/schema.prisma
model Newsletter {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  status    String   @default("active")
  createdAt DateTime @default(now())
}
```

**File: `src/app/api/newsletter-subscribe/route.ts`**
```typescript
import { prisma } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = schema.parse(body);

    await prisma.newsletter.upsert({
      where: { email },
      update: { status: 'active' },
      create: { email, status: 'active' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
```

---

## PHASE 4: TESTING & QUALITY (WEEK 4)

### 4.1 Write Critical Path Tests (20 hours)

**Test Structure:**
```
src/
├── __tests__/
│   ├── api/
│   │   ├── rfq.test.ts
│   │   ├── products.test.ts
│   │   └── newsletter.test.ts
│   ├── services/
│   │   ├── productService.test.ts
│   │   └── quoteService.test.ts
│   └── components/
│       ├── ProductCard.test.tsx
│       └── QuoteForm.test.tsx
```

**Example Test:**
```typescript
// src/__tests__/api/rfq.test.ts
import { POST } from '@/app/api/v1/rfq/submit/route';

describe('RFQ API', () => {
  it('creates quote with valid data', async () => {
    const request = new Request('http://localhost/api/v1/rfq/submit', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        address: '123 Test St',
        items: [{ id: '1', name: 'Product', quantity: 10 }],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.quoteReference).toBeDefined();
  });

  it('rejects invalid email', async () => {
    const request = new Request('http://localhost/api/v1/rfq/submit', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid',
        // ... other fields
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

**Run tests:**
```bash
npm test -- --coverage
```

### 4.2 Add Input Sanitization (4 hours)

**Install:**
```bash
npm install dompurify isomorphic-dompurify
```

**File: `src/lib/sanitize.ts`**
```typescript
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
```

**Apply everywhere:**
```typescript
// Before saving to DB
const sanitized = sanitizeInput(userInput);
```

---

## PHASE 5: OPTIMIZATION (WEEK 5+)

### 5.1 Implement Caching (6 hours)

**File: `src/lib/cache.ts`**
```typescript
import { unstable_cache } from 'next/cache';

export const getCachedProducts = unstable_cache(
  async () => getAllProducts(),
  ['products'],
  { revalidate: 3600, tags: ['products'] }
);

export const getCachedCategories = unstable_cache(
  async () => getCategories(),
  ['categories'],
  { revalidate: 3600, tags: ['categories'] }
);
```

**Usage:**
```typescript
// In page.tsx
const products = await getCachedProducts();
```

### 5.2 Consolidate State Management (8 hours)

**Delete:** `src/contexts/QuoteContext.tsx`

**Update:** `src/stores/quoteStore.ts`
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface QuoteItem {
  id: string;
  name: string;
  quantity: number;
}

interface QuoteStore {
  items: QuoteItem[];
  addItem: (item: QuoteItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearQuote: () => void;
}

export const useQuoteStore = create<QuoteStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({
        items: state.items.some(i => i.id === item.id)
          ? state.items
          : [...state.items, item],
      })),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id),
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(i => i.id === id ? { ...i, quantity } : i),
      })),
      clearQuote: () => set({ items: [] }),
    }),
    { name: 'quote-storage' }
  )
);
```

### 5.3 Clean Up Unused Code (4 hours)

**Remove:**
```bash
# Remove unused deployment configs (keep one)
rm netlify.toml  # If using Firebase
rm -rf k8s/      # If not using Kubernetes

# Remove empty worker
rm worker/whatsappWorker.ts

# Archive old docs
mkdir -p docs/archive
mv archive/* docs/archive/
rm -rf archive/

# Remove unused AI if not needed
npm uninstall genkit genkit-cli @genkit-ai/google-genai
rm -rf src/ai/
```

---

## VERIFICATION CHECKLIST

After each fix, verify:

### ✅ Security
- [ ] No credentials in code
- [ ] Environment variables documented
- [ ] Security headers added
- [ ] Input sanitization working
- [ ] Rate limiting active

### ✅ Functionality
- [ ] Database connected and working
- [ ] Emails sending successfully
- [ ] RFQ flow complete end-to-end
- [ ] Authentication working
- [ ] Error logging persisting

### ✅ Quality
- [ ] Tests passing (>60% coverage)
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Performance acceptable (<3s page load)

### ✅ Documentation
- [ ] .env.example updated
- [ ] README updated
- [ ] API documented
- [ ] Deployment guide updated

---

## ROLLBACK STRATEGY

Every fix must be reversible:

1. **Feature Flags:** Use for major changes
```typescript
// src/lib/config/featureFlags.ts
export const features = {
  USE_DATABASE: process.env.USE_DATABASE === 'true',
  USE_AUTH: process.env.USE_AUTH === 'true',
  USE_RATE_LIMIT: process.env.USE_RATE_LIMIT === 'true',
};
```

2. **Git Tags:** Tag before major changes
```bash
git tag -a v1.0-pre-auth -m "Before auth implementation"
```

3. **Database Migrations:** Always reversible
```bash
npx prisma migrate dev --create-only
# Edit migration to add DOWN migration
npx prisma migrate deploy
```

---

## MONITORING POST-FIX

Track these metrics:

1. **Error Rate:** Should decrease by 80%
2. **Response Time:** Should improve by 50%
3. **Email Delivery:** Should be 95%+
4. **Database Queries:** Should be <100ms
5. **Test Coverage:** Should reach 60%+

**Dashboard:**
```bash
# Install monitoring
npm install @vercel/analytics @vercel/speed-insights

# Add to layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
```

---

## COMPLETION CRITERIA

Project is "fixed" when:

1. ✅ All Critical issues resolved
2. ✅ All High priority issues resolved
3. ✅ Test coverage >60%
4. ✅ No security vulnerabilities
5. ✅ Production deployment successful
6. ✅ Monitoring active
7. ✅ Documentation complete
8. ✅ Team trained on new systems

**Final Sign-off:** Product Owner + Tech Lead approval required.
