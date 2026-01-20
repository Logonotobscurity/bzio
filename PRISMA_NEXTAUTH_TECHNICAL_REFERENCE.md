# Prisma & NextAuth Removal - Technical Reference Guide

**Document Version:** 1.0  
**Date:** January 11, 2026  
**Target Audience:** Development Team

---

## Table of Contents
1. [Full Database Schema (SQL)](#full-database-schema-sql)
2. [All Prisma Operations by File](#all-prisma-operations-by-file)
3. [NextAuth Integration Points](#nextauth-integration-points)
4. [Client-Side Hooks Migration](#client-side-hooks-migration)
5. [Error Handling Strategy](#error-handling-strategy)
6. [Security Considerations](#security-considerations)
7. [Performance Optimization](#performance-optimization)

---

## Full Database Schema (SQL)

### User & Authentication Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Table (Primary)
CREATE TABLE "user" (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'CUSTOMER')),
  
  -- Profile Information
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(20),
  company_name VARCHAR(255),
  
  -- Status
  is_new_user BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  last_login TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Indexes for User table
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_user_role ON "user"(role);
CREATE INDEX idx_user_created_at ON "user"(created_at DESC);
CREATE INDEX idx_user_last_login ON "user"(last_login);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_updated_at
  BEFORE UPDATE ON "user"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Quote Management Tables

```sql
CREATE TABLE "quote" (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  
  -- Content
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'QUOTED', 'NEGOTIATING', 'CLOSED', 'LOST')),
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quote_user_id ON "quote"(user_id);
CREATE INDEX idx_quote_status ON "quote"(status);
CREATE INDEX idx_quote_created_at ON "quote"(created_at DESC);

CREATE TRIGGER update_quote_updated_at
  BEFORE UPDATE ON "quote"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Quote Messages Table
CREATE TABLE "quote_message" (
  id VARCHAR(255) PRIMARY KEY,
  quote_id VARCHAR(255) NOT NULL REFERENCES "quote"(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE SET NULL,
  
  message TEXT NOT NULL,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quote_message_quote_id ON "quote_message"(quote_id);
CREATE INDEX idx_quote_message_user_id ON "quote_message"(user_id);
CREATE INDEX idx_quote_message_created_at ON "quote_message"(created_at DESC);
```

### Product Catalog Tables

```sql
CREATE TABLE "company" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  logo VARCHAR(255),
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_company_slug ON "company"(slug);
CREATE INDEX idx_company_active ON "company"(is_active);

CREATE TABLE "brand" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  brand_description TEXT,
  company_id INTEGER REFERENCES "company"(id) ON DELETE SET NULL,
  image_url VARCHAR(255),
  is_featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brand_slug ON "brand"(slug);
CREATE INDEX idx_brand_company_id ON "brand"(company_id);

CREATE TABLE "category" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_category_slug ON "category"(slug);

CREATE TABLE "product" (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  detailed_description TEXT,
  price DECIMAL(10, 2),
  
  brand_id INTEGER REFERENCES "brand"(id) ON DELETE SET NULL,
  company_id INTEGER REFERENCES "company"(id) ON DELETE SET NULL,
  
  is_active BOOLEAN DEFAULT true,
  in_stock BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  moq INTEGER,  -- Minimum Order Quantity
  quantity INTEGER,
  rating DECIMAL(3, 2),
  review_count INTEGER DEFAULT 0,
  
  specifications JSONB,
  tags TEXT[],  -- Array of strings
  unit VARCHAR(50),
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_sku ON "product"(sku);
CREATE INDEX idx_product_slug ON "product"(slug);
CREATE INDEX idx_product_brand_id ON "product"(brand_id);
CREATE INDEX idx_product_company_id ON "product"(company_id);
CREATE INDEX idx_product_active ON "product"(is_active);
CREATE INDEX idx_product_featured ON "product"(is_featured);
CREATE INDEX idx_product_tags ON "product" USING GIN(tags);
```

### Activity & Analytics Tables

```sql
CREATE TABLE "user_activity" (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  
  activity_type VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_activity_user_id ON "user_activity"(user_id);
CREATE INDEX idx_user_activity_type ON "user_activity"(activity_type);
CREATE INDEX idx_user_activity_created_at ON "user_activity"(created_at DESC);

CREATE TABLE "analytics_event" (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES "user"(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  
  event_name VARCHAR(100) NOT NULL,
  event_value DECIMAL(10, 2),
  
  properties JSONB,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_event_user_id ON "analytics_event"(user_id);
CREATE INDEX idx_analytics_event_name ON "analytics_event"(event_name);
CREATE INDEX idx_analytics_event_created_at ON "analytics_event"(created_at DESC);
```

### Logging & Error Tables

```sql
CREATE TABLE "error_log" (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES "user"(id) ON DELETE SET NULL,
  
  error_message TEXT NOT NULL,
  error_code VARCHAR(50),
  severity VARCHAR(20) CHECK (severity IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),
  
  stack_trace TEXT,
  context JSONB,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_error_log_severity ON "error_log"(severity);
CREATE INDEX idx_error_log_created_at ON "error_log"(created_at DESC);
CREATE INDEX idx_error_log_user_id ON "error_log"(user_id);

-- Full text search on error messages
CREATE INDEX idx_error_log_message_gin ON "error_log" USING GIN(to_tsvector('english', error_message));
```

### CRM & Lead Tables

```sql
CREATE TABLE "lead" (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  
  name VARCHAR(255),
  company_name VARCHAR(255),
  phone VARCHAR(20),
  
  status VARCHAR(50) DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST')),
  source VARCHAR(50),  -- website, email, referral, etc.
  
  notes TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lead_email ON "lead"(email);
CREATE INDEX idx_lead_status ON "lead"(status);
CREATE INDEX idx_lead_created_at ON "lead"(created_at DESC);

CREATE TABLE "form_submission" (
  id VARCHAR(255) PRIMARY KEY,
  lead_id VARCHAR(255) REFERENCES "lead"(id) ON DELETE SET NULL,
  user_id VARCHAR(255) REFERENCES "user"(id) ON DELETE SET NULL,
  
  form_type VARCHAR(50) NOT NULL,  -- contact, quote-request, newsletter, etc.
  
  data JSONB NOT NULL,  -- Form field values
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_form_submission_lead_id ON "form_submission"(lead_id);
CREATE INDEX idx_form_submission_user_id ON "form_submission"(user_id);
CREATE INDEX idx_form_submission_type ON "form_submission"(form_type);

CREATE TABLE "newsletter_subscriber" (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  
  is_subscribed BOOLEAN DEFAULT true,
  subscription_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  unsubscribe_date TIMESTAMP,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_newsletter_email ON "newsletter_subscriber"(email);
CREATE INDEX idx_newsletter_subscribed ON "newsletter_subscriber"(is_subscribed);
```

---

## All Prisma Operations by File

### User Service Operations

```typescript
// src/services/userService.ts
- prisma.user.findUnique({ where: { id } })
- prisma.user.findUnique({ where: { email } })
- prisma.user.findMany({ skip, take })
- prisma.user.create({ data })
- prisma.user.update({ where: { id }, data })
- prisma.user.delete({ where: { id } })
```

### Quote Service Operations

```typescript
// src/services/quote.service.ts
- prisma.quote.findMany({ where })
- prisma.quote.findUnique({ where: { id } })
- prisma.quote.create({ data })
- prisma.quote.update({ where, data })
- prisma.quote.delete({ where: { id } })
- prisma.quote.count({ where })
- prisma.quoteMessage.findMany({ where })
- prisma.quoteMessage.create({ data })
```

### Auth/Config Operations

```typescript
// src/lib/auth/config.ts - CredentialsProvider
- prisma.user.findUnique({ where: { email } })  // Login check
- prisma.user.update({ where: { id }, data: { lastLogin } })  // Update login time
```

### Admin API Routes (20+ endpoints)

```typescript
// src/app/api/admin/login/route.ts
- prisma.user.findUnique({ where: { email } })
- prisma.user.update({ where: { id }, data: { lastLogin } })

// src/app/api/admin/users/route.ts
- prisma.user.create({ data })
- prisma.user.findMany({ skip, take, where })

// src/app/api/admin/setup/route.ts
- prisma.user.findUnique({ where: { email } })
- prisma.user.delete({ where: { id } })
- prisma.user.create({ data })

// src/app/api/admin/customers/route.ts
- prisma.user.findMany({ where })
- prisma.user.count({ where })

// + 15 more admin routes...
```

### User API Routes

```typescript
// src/app/api/user/profile/route.ts
- prisma.user.findUnique({ where: { id } })
- prisma.user.update({ where: { id }, data })

// src/app/api/user/activities/route.ts
- prisma.userActivity.findMany({ where })
- prisma.userActivity.count({ where })
- prisma.userActivity.create({ data })
```

### Auth API Routes

```typescript
// src/app/api/auth/register/route.ts
- prisma.user.findUnique({ where: { email } })
- prisma.user.create({ data })

// src/app/api/auth/forgot-password/route.ts
- prisma.user.findUnique({ where: { email } })

// src/app/api/auth/reset-password/route.ts
- prisma.user.update({ where: { id }, data })

// src/app/api/auth/verify-admin/route.ts
- prisma.user.findUnique({ where: { email } })
```

---

## NextAuth Integration Points

### 1. Session Strategy Configuration

```typescript
// CURRENT (NextAuth v4 JWT strategy):
session: {
  strategy: "jwt",           // NOT database-backed
  maxAge: 30 * 60,          // 30 minutes
}

// JWT Token Payload:
{
  id: "user-123",
  email: "user@example.com",
  role: "ADMIN",
  firstName: "John",
  lastName: "Doe",
  iat: 1673433600,
  exp: 1673435400
}
```

### 2. Provider Configuration

```typescript
// Email Provider (Magic Links)
EmailProvider({
  server: {
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  },
  from: process.env.EMAIL_FROM,
  maxAge: 10 * 60,  // 10 minute expiry for magic link
})

// Credentials Provider (Email + Password)
CredentialsProvider({
  credentials: {
    email: { label: "Email", type: "text" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    // PRISMA OPERATION #1:
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });
    
    if (!user || !user.passwordHash) return null;
    
    const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isValid) return null;
    
    // PRISMA OPERATION #2:
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
    
    return user;
  },
})
```

### 3. JWT Callback (Role Enrichment)

```typescript
// Current implementation:
async jwt({ token, user, account, profile, isNewUser }) {
  // On login, enrich with user data
  if (user) {
    token.id = user.id;
    token.role = user.role;
    token.firstName = user.firstName;
    token.lastName = user.lastName;
    token.phone = user.phone;
    token.companyName = user.companyName;
    token.isNewUser = user.isNewUser;
    token.lastLogin = user.lastLogin;
  }
  
  return token;  // Returned token is encoded to JWT
}
```

### 4. Session Callback (Token → Session)

```typescript
// Current implementation:
async session({ session, token }) {
  // Map JWT payload to session object
  if (session.user) {
    session.user.id = token.id;
    session.user.role = token.role;
    session.user.firstName = token.firstName;
    session.user.lastName = token.lastName;
    session.user.phone = token.phone;
    session.user.companyName = token.companyName;
    session.user.isNewUser = token.isNewUser;
    session.user.lastLogin = token.lastLogin;
  }
  
  return session;
}
```

### 5. Session Endpoint (Custom)

```typescript
// Current: src/app/api/auth/session/route.ts
// Gets JWT from cookie and returns session object
GET /api/auth/session → Returns session if valid JWT cookie exists
POST /api/auth/session → Refreshes and returns updated session
```

---

## Client-Side Hooks Migration

### Old vs New Hook Comparison

```typescript
// ============ OLD (NextAuth) ============
'use client';
import { useSession } from 'next-auth/react';

export function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return <div>Not logged in</div>;
  
  return <div>Hello {session.user.email}</div>;
}

// ============ NEW (Custom) ============
'use client';
import { useAuth } from '@/hooks/use-auth';

export function MyComponent() {
  const { session, status } = useAuth();  // Same interface!
  
  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return <div>Not logged in</div>;
  
  return <div>Hello {session.user.email}</div>;
}
```

### useAuth Hook Implementation

```typescript
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  companyName?: string | null;
}

export interface AuthSession {
  user: AuthUser;
  expires: string;
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const router = useRouter();
  
  const fetchSession = useCallback(async () => {
    try {
      setStatus('loading');
      const response = await fetch('/api/auth/session');
      
      if (response.ok) {
        const data = await response.json();
        if (data?.user) {
          setSession(data);
          setStatus('authenticated');
        } else {
          setSession(null);
          setStatus('unauthenticated');
        }
      } else {
        setSession(null);
        setStatus('unauthenticated');
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
      setSession(null);
      setStatus('unauthenticated');
    }
  }, []);
  
  useEffect(() => {
    fetchSession();
    
    // Refresh session every 5 minutes
    const interval = setInterval(fetchSession, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSession]);
  
  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession(null);
    setStatus('unauthenticated');
    router.push('/login');
  }, [router]);
  
  const refreshSession = useCallback(async () => {
    await fetchSession();
  }, [fetchSession]);
  
  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    await fetchSession();
  }, [fetchSession]);
  
  return {
    session,
    status,
    user: session?.user || null,
    logout,
    refreshSession,
    login,
  };
}
```

---

## Error Handling Strategy

### Create Error Response Factory

```typescript
// src/lib/api/error-response.ts
import { NextResponse } from 'next/server';

export interface ApiError {
  error: string;
  code: string;
  statusCode: number;
  details?: Record<string, any>;
}

export class ApiErrorHandler {
  static unauthorized(message = 'Unauthorized'): NextResponse {
    return NextResponse.json(
      { error: message, code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }
  
  static forbidden(message = 'Forbidden'): NextResponse {
    return NextResponse.json(
      { error: message, code: 'FORBIDDEN' },
      { status: 403 }
    );
  }
  
  static notFound(message = 'Not Found'): NextResponse {
    return NextResponse.json(
      { error: message, code: 'NOT_FOUND' },
      { status: 404 }
    );
  }
  
  static badRequest(message = 'Bad Request', details?: Record<string, any>): NextResponse {
    return NextResponse.json(
      { error: message, code: 'BAD_REQUEST', details },
      { status: 400 }
    );
  }
  
  static conflict(message = 'Conflict'): NextResponse {
    return NextResponse.json(
      { error: message, code: 'CONFLICT' },
      { status: 409 }
    );
  }
  
  static internalError(message = 'Internal Server Error', error?: any): NextResponse {
    console.error('[API_ERROR]', error);
    return NextResponse.json(
      { error: message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
  
  static fromDatabase(error: any): NextResponse {
    if (error.code === '23505') {  // unique_violation
      return this.conflict('Record already exists');
    }
    if (error.code === '23503') {  // foreign_key_violation
      return this.badRequest('Invalid reference');
    }
    return this.internalError('Database error', error);
  }
}

// Usage in API routes:
try {
  // ...
} catch (error) {
  return ApiErrorHandler.fromDatabase(error);
}
```

---

## Security Considerations

### 1. JWT Secret Management

```bash
# ❌ INSECURE:
JWT_SECRET="simple-password"

# ✅ SECURE:
JWT_SECRET="$(openssl rand -base64 32)"
# Minimum 32 characters, random
# Store in secure environment (not in git)
```

### 2. Password Hashing

```typescript
import * as bcrypt from 'bcryptjs';

// Hashing (in registration/setup)
const salt = await bcrypt.genSalt(10);  // Cost factor 10 = ~100ms
const hash = await bcrypt.hash(password, salt);

// Comparison (in login)
const isValid = await bcrypt.compare(password, hash);
```

### 3. CORS & CSRF Protection

```typescript
// src/middleware.ts
import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // CSRF token validation for state-changing requests
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken) {
      return NextResponse.json(
        { error: 'CSRF token required' },
        { status: 403 }
      );
    }
  }
  
  return NextResponse.next();
}
```

### 4. Rate Limiting on Auth Endpoints

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),  // 5 requests per minute
});

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  return success;
}

// Usage in login/register:
const success = await checkRateLimit(email);
if (!success) {
  return NextResponse.json(
    { error: 'Too many attempts' },
    { status: 429 }
  );
}
```

### 5. SQL Injection Prevention

```typescript
// ✅ CORRECT (parameterized queries):
const user = await db.queryOne(
  'SELECT * FROM "user" WHERE email = $1',
  [email]  // Parameter passed separately
);

// ❌ WRONG (string interpolation):
const user = await db.queryOne(
  `SELECT * FROM "user" WHERE email = '${email}'`  // NEVER!
);
```

### 6. Secure Cookies

```typescript
response.cookies.set('auth-token', token, {
  httpOnly: true,           // Not accessible from JavaScript
  secure: true,             // Only over HTTPS
  sameSite: 'lax',          // CSRF protection
  maxAge: 30 * 60,          // 30 minutes
  path: '/',                // All paths
});
```

---

## Performance Optimization

### 1. Database Query Optimization

```typescript
// ✅ GOOD: Only select needed fields
const user = await db.queryOne(
  'SELECT id, email, role FROM "user" WHERE id = $1',
  [userId]
);

// ⚠️ UNNECESSARY: Selecting all fields
const user = await db.queryOne(
  'SELECT * FROM "user" WHERE id = $1',
  [userId]
);
```

### 2. Connection Pooling Configuration

```typescript
// src/lib/db/connection.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Maximum connections
  min: 5,                     // Minimum idle connections
  idleTimeoutMillis: 30000,   // 30 seconds
  connectionTimeoutMillis: 2000,
});
```

### 3. Caching Strategy

```typescript
// src/lib/cache.ts
import { redis } from '@/lib/redis';

export async function getCachedUser(userId: string) {
  const cached = await redis.get(`user:${userId}`);
  if (cached) return JSON.parse(cached);
  
  const user = await db.queryOne(
    'SELECT * FROM "user" WHERE id = $1',
    [userId]
  );
  
  if (user) {
    await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));
  }
  
  return user;
}
```

### 4. Batch Operations

```typescript
// ❌ SLOW: N+1 queries
for (const userId of userIds) {
  const user = await db.queryOne(
    'SELECT * FROM "user" WHERE id = $1',
    [userId]
  );
  // Process user
}

// ✅ FAST: Single batch query
const users = await db.query(
  'SELECT * FROM "user" WHERE id = ANY($1)',
  [userIds]
);
users.forEach(user => {
  // Process user
});
```

### 5. Index Usage

```typescript
-- Common query patterns:
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_quote_user_id ON "quote"(user_id);
CREATE INDEX idx_user_activity_created_at ON "user_activity"(created_at DESC);

-- Full-text search:
CREATE INDEX idx_product_name_fulltext ON "product" 
  USING GIN(to_tsvector('english', name));

-- Composite indexes:
CREATE INDEX idx_quote_user_status ON "quote"(user_id, status);
```

---

**End of Technical Reference Guide**
