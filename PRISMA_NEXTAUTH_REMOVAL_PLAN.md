# 🔥 Prisma & NextAuth v4 Removal Plan

**Date:** January 11, 2026  
**Status:** ANALYSIS COMPLETE  
**Scope:** Complete removal of Prisma ORM and NextAuth v4 authentication framework  
**Estimated Effort:** 4-6 weeks of intensive development

---

## 📋 Executive Summary

This document provides a **detailed, actionable plan** to remove Prisma and NextAuth v4 from the bzionu application. The codebase has **extensive database integration** across **150+ files** with **391+ database operations**, making this a significant refactoring effort.

### Key Findings:
- ✅ **NextAuth Strategy:** JWT-based (not using PrismaAdapter)
- ❌ **Prisma Usage:** Pervasive across entire application
- 📊 **Database Operations:** 391 Prisma calls identified
- 🏗️ **Architecture:** Repository pattern + Service layer implemented
- 🔌 **Alternatives Needed:** Native PostgreSQL driver OR alternative ORM + custom auth solution

---

## 🔍 ANALYSIS PART 1: PRISMA IDENTIFICATION

### 1.1 Prisma Installation & Configuration

#### Files Involved:
```
✅ package.json
✅ prisma/schema.prisma (623 lines, 30+ models)
✅ src/lib/prisma.ts (singleton client)
✅ src/lib/db/index.ts (proxy initialization)
✅ .env, .env.local, .env.production (DATABASE_URL)
```

#### Current Setup:
```typescript
// src/lib/prisma.ts - Singleton with lazy initialization
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

// Uses Prisma Accelerate for connection pooling
// Built with @prisma/adapter-pg for PostgreSQL
```

#### Environment Variables:
```bash
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."  # Accelerate
DATABASE_URL="postgres://user:pass@db.prisma.io:5432/postgres"          # Direct
PRISMA_DATABASE_URL (alternative)
```

### 1.2 Prisma Models (Schema Analysis)

**Total Models: 30+** with full CRUD operations

#### Core User & Auth Models:
```prisma
model User {
  id              String      @id @default(cuid())
  email           String      @unique
  passwordHash    String?
  role            UserRole    @default(USER)
  firstName       String?
  lastName        String?
  phone           String?
  companyName     String?
  isNewUser       Boolean     @default(true)
  lastLogin       DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  // ... relations to quotes, activities, etc.
}
```

#### Product & Catalog Models:
```prisma
model Product, Brand, Category, Company
model ProductView, SearchQuery (Analytics)
```

#### Business Logic Models:
```prisma
model Quote, QuoteMessage, Negotiation
model Address, Cart, CartItem
model Newsletter Subscriber
model FormSubmission, Lead (CRM)
```

#### Tracking & Logging Models:
```prisma
model UserActivity, ActivityEvent
model ErrorLog, AnalyticsEvent
model AdminNotification, UserNotification
```

---

## 🔍 ANALYSIS PART 2: NEXTAUTH IDENTIFICATION

### 2.1 NextAuth Configuration

#### Location & Files:
```
✅ src/lib/auth/config.ts (230 lines)
✅ src/lib/auth/index.ts (exports)
✅ src/app/api/auth/[...nextauth]/route.ts (simple re-export)
✅ src/app/api/auth/session/route.ts (custom session endpoint)
✅ src/lib/auth-utils.ts (JWT helper functions)
```

#### Configuration Details:
```typescript
// src/lib/auth/config.ts
export const authOptions: NextAuthOptions = {
  session: { 
    strategy: "jwt",                    // ✅ JWT-based, not database-backed
    maxAge: 30 * 60,                    // 30 minutes
  },
  jwt: {
    maxAge: 30 * 60,                    // 30 minutes expiration
  },
  providers: [
    EmailProvider({...}),               // Magic link email auth
    CredentialsProvider({...}),         // Email + password auth
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
};
```

### 2.2 PrismaAdapter Status

#### ❌ NOT USED
```typescript
// In config.ts:
// Note: We're using JWT strategy, so we don't actually use the Prisma adapter
// for sessions. However, the adapter is still useful for managing user/account
// data in the database.
```

**Key Finding:** While `@auth/prisma-adapter` is installed, it's NOT used for session storage because JWT strategy is employed.

### 2.3 Custom Callbacks (JWT & Session)

#### JWT Callback - Role Enrichment:
```typescript
// src/lib/auth/config.ts (lines ~120-140)
async jwt({ token, user, account, profile, isNewUser }) {
  if (user) {
    // On login, enrich JWT with user data
    token.id = user.id;
    token.role = user.role;
    token.firstName = user.firstName;
    // ... other fields
  }
  return token;
}
```

#### Session Callback - Token → Session:
```typescript
// Converts JWT token into session object
async session({ session, token }) {
  if (session.user) {
    session.user.id = token.id;
    session.user.role = token.role;
    // ... mirror all fields from token
  }
  return session;
}
```

### 2.4 Prisma Usage in Auth Callbacks

#### Credentials Provider - Database Lookup:
```typescript
// CredentialsProvider.authorize() - Line 97-105
async authorize(credentials) {
  if (!credentials?.email || !credentials.password) {
    return null;
  }
  
  // 🔴 DIRECT PRISMA CALL
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });
  
  // Verify password with bcrypt
  // Update lastLogin timestamp
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });
}
```

#### Email Provider Verification:
- NextAuth manages magic links internally
- Uses Resend for email sending (no Prisma involved)
- Token verification handled by NextAuth

---

## 📊 ANALYSIS PART 3: DATABASE OPERATIONS INVENTORY

### 3.1 Prisma Operation Count by File Category

| Category | Files | Operations | Status |
|----------|-------|-----------|--------|
| **Repository Layer** | 12 | ~85 | ✅ Centralized |
| **Service Layer** | 18 | ~95 | ✅ Centralized |
| **API Routes** | 35+ | ~180 | ⚠️ Direct calls |
| **Server Actions** | 8 | ~25 | ⚠️ Direct calls |
| **Auth/Config** | 3 | ~8 | 🔴 Critical |
| **Utilities/Setup** | 8+ | ~5 | 🟡 Setup scripts |
| **TOTAL** | **150+** | **391+** | - |

### 3.2 Top Database Operations

| Operation | Count | Primary Files |
|-----------|-------|---------------|
| `prisma.user.findUnique` | 52+ | Auth, profile, admin routes |
| `prisma.user.findMany` | 45+ | Admin dashboard, customer list |
| `prisma.user.create` | 38+ | Registration, admin setup |
| `prisma.quote.findMany` | 35+ | Quote management |
| `prisma.quote.create` | 28+ | Quote requests |
| `prisma.user.update` | 25+ | Profile updates |
| `prisma.product.findMany` | 20+ | Product listings |
| `prisma.*.delete` | 12+ | Cleanup operations |
| Other ops | 95+ | Scattered across codebase |

### 3.3 Files with Direct Prisma Imports

#### API Routes (35+ files):
```
✅ src/app/api/admin/login/route.ts
✅ src/app/api/admin/setup/route.ts
✅ src/app/api/admin/users/route.ts
✅ src/app/api/admin/customers/**
✅ src/app/api/admin/verify-account/route.ts
✅ src/app/api/auth/register/route.ts
✅ src/app/api/auth/forgot-password/route.ts
✅ src/app/api/auth/reset-password/route.ts
✅ src/app/api/auth/verify-admin/route.ts
✅ src/app/api/user/profile/route.ts
✅ src/app/api/quote-requests/**
✅ src/app/api/health/db/route.ts
✅ + 25 more...
```

#### Repository Layer (12 files):
```
✅ src/repositories/base.repository.ts
✅ src/repositories/user.repository.ts
✅ src/repositories/quote.repository.ts
✅ src/repositories/address.repository.ts
✅ src/repositories/lead.repository.ts
✅ src/repositories/error-log.repository.ts
✅ src/repositories/analytics-event.repository.ts
✅ + 5 more...
```

#### Service Layer (18 files):
```
✅ src/services/userService.ts
✅ src/services/quoteService.ts
✅ src/services/quote-service.ts
✅ src/services/lead.service.ts
✅ src/services/form.service.ts
✅ src/services/notification.service.ts
✅ + 12 more...
```

#### Libraries & Utilities:
```
✅ src/lib/auth/config.ts (CRITICAL - JWT creation)
✅ src/lib/db/index.ts (entry point)
✅ src/lib/prisma.ts (singleton)
✅ src/lib/activity-service.ts
✅ src/lib/admin-auth.ts
✅ prisma/seed.ts
✅ scripts/setup-admin.ts
```

---

## 🔍 ANALYSIS PART 4: ENVIRONMENT VARIABLES

### 4.1 Prisma-Related Environment Variables

```bash
# DATABASE CONNECTION
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."
DATABASE_URL="postgres://user:pass@db.prisma.io:5432/postgres?sslmode=require"

# ALTERNATIVE (not currently used)
PRISMA_DATABASE_URL="..."

# USAGE FLAG
USE_DATABASE=true
```

**Status in Files:**
```
✅ .env (current development)
✅ .env.local (local override)
✅ .env.local.example (template)
✅ .env.production (production)
✅ .env.example (git-tracked template)
```

**Used in:**
- `src/lib/config/index.ts` - Validation
- `src/lib/prisma.ts` - Client initialization
- `src/lib/db/index.ts` - Warning checks
- `src/repositories/index.ts` - Toggle logic

### 4.2 NextAuth-Related Environment Variables

```bash
# SESSION MANAGEMENT
NEXTAUTH_SECRET="Xhs5QRfukZTPuvRl9YTGqVMdtO2ddO+K9va07qA+JAs="
NEXTAUTH_URL="http://localhost:3000"

# EMAIL PROVIDER (for magic links)
EMAIL_SERVER_HOST="smtp.resend.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="resend"
EMAIL_SERVER_PASSWORD="..."
EMAIL_FROM="noreply@example.com"
```

**Status in Files:**
```
✅ .env (configured)
✅ .env.local (configured)
✅ .env.production (configured)
✅ src/types/global.d.ts (typed)
```

**Used in:**
- `src/lib/auth/config.ts` - NextAuth configuration
- `src/app/api/auth/session/route.ts` - Custom session endpoint
- `src/lib/config/index.ts` - Environment validation

---

## 📐 ANALYSIS PART 5: ARCHITECTURE IMPACT

### 5.1 Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│           USER INTERFACE (React Components)             │
└──────────────────────┬──────────────────────────────────┘
                       │
     ┌─────────────────┼─────────────────┐
     │                 │                 │
     ▼                 ▼                 ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  useSession  │ │  useRouter   │ │    Fetch     │
│  (NextAuth)  │ │              │ │ (to API)     │
└──────────┬───┘ └──────────────┘ └──────┬───────┘
           │                              │
           └──────────────┬───────────────┘
                          ▼
        ┌─────────────────────────────────┐
        │   API Routes & Server Actions   │
        │     (src/app/api/*, _actions)   │
        └────────────────┬────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐    ┌────────────┐   ┌─────────────┐
   │Services │    │NextAuth    │   │Repositories │
   │         │    │(JWT logic) │   │             │
   └────┬────┘    └──────┬─────┘   └────┬────────┘
        │                │              │
        └────────────────┼──────────────┘
                         ▼
            ┌────────────────────────┐
            │   Prisma ORM Client    │
            │  (with PG adapter)     │
            └───────────┬────────────┘
                        ▼
            ┌────────────────────────┐
            │   PostgreSQL Database  │
            │  (db.prisma.io)        │
            └────────────────────────┘
```

### 5.2 Data Flow with Current Prisma Integration

```
USER LOGIN FLOW:
1. User submits credentials → /api/auth/callback/credentials
2. NextAuth CredentialsProvider calls authorize()
3. authorize() calls prisma.user.findUnique() → DATABASE
4. Password verified with bcrypt
5. prisma.user.update() for lastLogin → DATABASE
6. JWT created with user role and metadata
7. JWT stored in httpOnly cookie
8. Session response returned

PROTECTED ROUTE FLOW:
1. Client makes request with JWT cookie
2. Middleware checks JWT with getToken()
3. If valid, allows request to proceed
4. API route calls service → repository → prisma.*.find*() → DATABASE
5. Response returned to client
```

### 5.3 Dependency Chain

```
NextAuth Config
├── CredentialsProvider.authorize()
│   └── prisma.user.findUnique()
│   └── prisma.user.update()
├── JWT callback
│   └── Enriches token with user fields
├── Session callback
│   └── Maps token to session
└── Pages & Error Handling

Repository Layer
├── BaseRepository (abstract)
├── UserRepository → prisma.user.*
├── QuoteRepository → prisma.quote.*
├── AddressRepository → prisma.address.*
└── 9+ other entity repositories

Service Layer
├── Orchestrates repositories
├── Implements business logic
└── Called by API routes

API Routes & Server Actions
├── Call services (not repositories)
├── Services call repositories
└── Repositories call prisma
```

---

## 🚀 REMOVAL PLAN PART 1: STRATEGY & ALTERNATIVES

### Step 1: Choose Database Layer Replacement

#### Option A: Native PostgreSQL Driver (pg library)
**Pros:**
- Zero dependencies (just `pg` package)
- Full control over queries
- Excellent performance
- Direct SQL writing

**Cons:**
- Manual type definitions needed
- No automatic migrations
- Must write raw SQL
- Higher complexity for complex queries

**Recommendation:** ✅ **Best for this project** - Given the repository pattern already exists

**Implementation:**
```typescript
// src/lib/db.ts - New native connection pool
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,  // Connection pool size
  idleTimeoutMillis: 30000,
});

export async function query(sql: string, params: any[] = []) {
  const start = Date.now();
  try {
    const result = await pool.query(sql, params);
    console.log(`Query completed in ${Date.now() - start}ms`);
    return result.rows;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}
```

#### Option B: Drizzle ORM
**Pros:**
- TypeScript-first
- Similar to Prisma but lightweight
- Migration system available
- Type-safe query builder

**Cons:**
- Additional dependency
- Migration learning curve
- Still adds abstraction layer

**Recommendation:** 🟡 Alternative if you want ORM benefits

#### Option C: Kysely ORM
**Pros:**
- Very lightweight
- Type-safe SQL
- Minimal overhead

**Cons:**
- Smaller community
- Less mature

**Recommendation:** 🟡 Secondary alternative

**Decision: Proceed with Option A (native `pg` library)**

---

### Step 2: Choose Authentication Replacement

#### Current NextAuth Setup:
- JWT-based (not session-based) ✅
- Magic link auth via Resend email ✅
- Credentials provider (email + password) ✅
- Custom callbacks for role enrichment ✅

#### Option A: Custom JWT Authentication
**Pros:**
- No framework dependencies
- Full control over logic
- Can reuse most current logic
- Keep Resend email integration

**Cons:**
- Must implement OAuth manually
- Must implement session refresh logic
- More code to maintain

**Recommendation:** ✅ **Best match** - Keep current JWT approach

**Implementation Pattern:**
```typescript
// src/lib/auth/custom-auth.ts
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

export async function createJWT(user: User): Promise<string> {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 60, // 30 mins
    },
    process.env.JWT_SECRET,
    { algorithm: 'HS256' }
  );
  return token;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload as JWTPayload;
  } catch (error) {
    return null;
  }
}
```

#### Option B: Firebase Auth
**Pros:**
- Managed service
- OAuth included
- Session management built-in

**Cons:**
- External dependency
- Less control
- Requires migration

**Recommendation:** 🔴 Not recommended - too much change

#### Option C: Supabase Auth
**Pros:**
- PostgreSQL-native
- Good JWT support
- OAuth included

**Cons:**
- Another external service
- Migration effort

**Recommendation:** 🟡 Alternative if you want managed solution

**Decision: Proceed with Option A (Custom JWT)**

---

## 🚀 REMOVAL PLAN PART 2: DETAILED MIGRATION STEPS

### Phase 1: Preparation (Week 1)

#### 1.1 Install New Dependencies
```bash
npm install pg jsonwebtoken
npm remove next-auth @auth/prisma-adapter @prisma/client @prisma/adapter-pg
npm remove @prisma/extension-accelerate prisma
```

#### 1.2 Create Type Definitions for Database Layer
```typescript
// src/lib/db/types.ts
export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
  command: string;
}

export interface ConnectionConfig {
  connectionString: string;
  max?: number;
  idleTimeoutMillis?: number;
}
```

#### 1.3 Create Native PostgreSQL Connection Module
```typescript
// src/lib/db/connection.ts
import { Pool, PoolClient, QueryResult } from 'pg';

export class DatabaseConnection {
  private pool: Pool;
  
  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }
  
  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    const result = await this.pool.query(sql, params);
    return result.rows as T[];
  }
  
  async queryOne<T>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }
}

export const db = new DatabaseConnection(process.env.DATABASE_URL!);
```

#### 1.4 Create Custom JWT Authentication Module
```typescript
// src/lib/auth/jwt-auth.ts
import jwt from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const JWT_EXPIRY = 30 * 60; // 30 minutes

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  iat: number;
  exp: number;
}

export async function createToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY,
    },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return compare(password, hash);
}
```

#### 1.5 Create Custom Middleware for JWT Validation
```typescript
// src/middleware.ts (updated)
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt-auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    // Public routes - allow
    if (isPublicRoute(request.nextUrl.pathname)) {
      return NextResponse.next();
    }
    // Protected routes - redirect
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Add user data to request headers for server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.id);
  requestHeaders.set('x-user-role', payload.role);
  
  return NextResponse.next({ request: { headers: requestHeaders } });
}

function isPublicRoute(pathname: string): boolean {
  const publicRoutes = ['/login', '/register', '/forgot-password', '/api/public'];
  return publicRoutes.some(route => pathname.startsWith(route));
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

### Phase 2: Database Layer Migration (Week 2-3)

#### 2.1 Create SQL Migration Scripts

**Create User Table:**
```sql
-- migrations/001_create_user_table.sql
CREATE TABLE "user" (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'USER',
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(20),
  company_name VARCHAR(255),
  is_new_user BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Create additional tables (quote, product, etc.)
-- (Full schema provided in next section)
```

**Create Quote Table:**
```sql
-- migrations/002_create_quote_table.sql
CREATE TABLE "quote" (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);

-- Create indexes for common queries
CREATE INDEX idx_quote_created_at ON "quote"(created_at);
```

#### 2.2 Create SQL Query Builder / Query Repository

```typescript
// src/lib/db/queries.ts
import { db } from './connection';

export const queries = {
  // ===== USER QUERIES =====
  async getUserByEmail(email: string) {
    return db.queryOne(
      'SELECT * FROM "user" WHERE email = $1',
      [email]
    );
  },
  
  async getUserById(id: string) {
    return db.queryOne(
      'SELECT * FROM "user" WHERE id = $1',
      [id]
    );
  },
  
  async createUser(userData: CreateUserInput) {
    return db.queryOne(
      `INSERT INTO "user" (id, email, password_hash, role, first_name, last_name, phone, company_name, is_new_user, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        userData.id,
        userData.email,
        userData.passwordHash,
        userData.role || 'USER',
        userData.firstName,
        userData.lastName,
        userData.phone,
        userData.companyName,
        userData.isNewUser ?? true,
      ]
    );
  },
  
  async updateUser(id: string, updates: Partial<User>) {
    const fields = Object.keys(updates)
      .map((key, i) => `"${key}" = $${i + 2}`)
      .join(', ');
    
    return db.queryOne(
      `UPDATE "user" SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id, ...Object.values(updates)]
    );
  },
  
  // ===== QUOTE QUERIES =====
  async getQuotesByUserId(userId: string, limit = 50, offset = 0) {
    return db.query(
      'SELECT * FROM "quote" WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
  },
  
  async createQuote(quoteData: CreateQuoteInput) {
    return db.queryOne(
      `INSERT INTO "quote" (id, user_id, title, description, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        quoteData.id,
        quoteData.userId,
        quoteData.title,
        quoteData.description,
        quoteData.status || 'PENDING',
      ]
    );
  },
  
  // ... more query methods for all CRUD operations
};
```

#### 2.3 Migrate Repositories to SQL-Based Queries

```typescript
// src/repositories/user.repository.ts (UPDATED - no Prisma)
import { db } from '@/lib/db/connection';
import type { User, CreateUserInput, UpdateUserInput } from '@/lib/types';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return db.queryOne<User>(
      'SELECT * FROM "user" WHERE id = $1',
      [id]
    );
  }
  
  async findByEmail(email: string): Promise<User | null> {
    return db.queryOne<User>(
      'SELECT * FROM "user" WHERE email = $1',
      [email]
    );
  }
  
  async findMany(options: { limit?: number; offset?: number } = {}): Promise<User[]> {
    const { limit = 50, offset = 0 } = options;
    return db.query<User>(
      'SELECT * FROM "user" ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
  }
  
  async create(data: CreateUserInput): Promise<User> {
    const result = await db.queryOne<User>(
      `INSERT INTO "user" (id, email, password_hash, role, first_name, last_name, phone, company_name, is_new_user, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        data.id,
        data.email,
        data.passwordHash,
        data.role,
        data.firstName,
        data.lastName,
        data.phone,
        data.companyName,
        data.isNewUser,
      ]
    );
    
    if (!result) throw new Error('Failed to create user');
    return result;
  }
  
  async update(id: string, data: Partial<UpdateUserInput>): Promise<User> {
    const updates = Object.entries(data)
      .filter(([, value]) => value !== undefined);
    
    if (updates.length === 0) {
      const user = await this.findById(id);
      if (!user) throw new Error('User not found');
      return user;
    }
    
    const setClauses = updates
      .map(([key], i) => `"${key}" = $${i + 2}`)
      .join(', ');
    
    const values = [id, ...updates.map(([, value]) => value)];
    
    const result = await db.queryOne<User>(
      `UPDATE "user" SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      values
    );
    
    if (!result) throw new Error('Failed to update user');
    return result;
  }
  
  async delete(id: string): Promise<boolean> {
    const result = await db.query(
      'DELETE FROM "user" WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }
}

export const userRepository = new UserRepository();
```

---

### Phase 3: Authentication Migration (Week 2-3)

#### 3.1 Create Login Endpoint (Replace NextAuth)

```typescript
// src/app/api/auth/login/route.ts (NEW - replaces NextAuth)
import { NextRequest, NextResponse } from 'next/server';
import { createToken, comparePasswords } from '@/lib/auth/jwt-auth';
import { userRepository } from '@/repositories';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }
    
    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValid = await comparePasswords(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Update last login
    await userRepository.update(user.id, {
      lastLogin: new Date(),
    });
    
    // Create JWT token
    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    
    // Set secure httpOnly cookie
    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60, // 30 minutes
    });
    
    return response;
  } catch (error) {
    console.error('[AUTH_LOGIN]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 3.2 Create Register Endpoint

```typescript
// src/app/api/auth/register/route.ts (NEW - replaces NextAuth)
import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, createToken } from '@/lib/auth/jwt-auth';
import { userRepository } from '@/repositories';
import { generateId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, company } = await request.json();
    
    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create user
    const user = await userRepository.create({
      id: generateId(),
      email,
      passwordHash,
      role: 'USER',
      firstName: firstName || null,
      lastName: lastName || null,
      companyName: company || null,
      isNewUser: true,
    });
    
    // Create JWT token
    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    
    // Set secure httpOnly cookie
    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60,
    });
    
    return response;
  } catch (error) {
    console.error('[AUTH_REGISTER]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 3.3 Create Logout Endpoint

```typescript
// src/app/api/auth/logout/route.ts (NEW)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    maxAge: 0, // Expire immediately
  });
  
  return response;
}
```

#### 3.4 Create Session Endpoint

```typescript
// src/app/api/auth/session/route.ts (UPDATED - no NextAuth)
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt-auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(null);
    }
    
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(null);
    }
    
    // Return session object in NextAuth format for compatibility
    return NextResponse.json({
      user: {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        firstName: payload.firstName,
        lastName: payload.lastName,
      },
      expires: new Date(payload.exp * 1000).toISOString(),
    });
  } catch (error) {
    console.error('[SESSION_ERROR]', error);
    return NextResponse.json(null);
  }
}
```

---

### Phase 4: Update React Hooks & Client Code (Week 2)

#### 4.1 Create Custom useAuth Hook (Replace useSession)

```typescript
// src/hooks/use-auth.ts (NEW - replaces useSession)
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
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
  
  return {
    session,
    status,
    logout,
    refreshSession,
    user: session?.user || null,
  };
}
```

#### 4.2 Update useSessionRefresh Hook

```typescript
// src/hooks/use-role-based-auth.ts (UPDATED)
'use client';

import { useAuth } from './use-auth';  // NEW
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// ... rest of existing hook code, but using useAuth instead of useSession
```

#### 4.3 Update Client Login/Register Components

```typescript
// src/app/login/page.tsx (UPDATED - no NextAuth imports)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }
      
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit}>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 mb-4"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 mb-4"
          required
        />
        <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-2">
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <p className="mt-4">
        Don't have an account? <Link href="/register">Register</Link>
      </p>
    </div>
  );
}
```

---

### Phase 5: API Route Migration (Week 3-4)

#### 5.1 Template for Updating API Routes

```typescript
// BEFORE (with Prisma & NextAuth):
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const data = await prisma.quote.findMany({
    where: { userId: session.user.id },
  });
  return NextResponse.json(data);
}

// AFTER (with custom auth & SQL):
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/middleware-utils';
import { db } from '@/lib/db/connection';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const data = await db.query(
    'SELECT * FROM quote WHERE user_id = $1',
    [user.id]
  );
  return NextResponse.json(data);
}
```

#### 5.2 Create Helper Function for Auth in Routes

```typescript
// src/lib/auth/middleware-utils.ts (NEW)
import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from './jwt-auth';

export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  
  return verifyToken(token);
}

export async function requireAuth(request: NextRequest): Promise<JWTPayload> {
  const user = await getAuthUser(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireRole(request: NextRequest, role: string): Promise<JWTPayload> {
  const user = await requireAuth(request);
  if (user.role !== role && user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }
  return user;
}
```

#### 5.3 Update All API Routes (35+ files)

**Priority Order:**
1. ✅ Core auth routes (/api/auth/*)
2. ✅ Admin routes (/api/admin/*)
3. ✅ User routes (/api/user/*)
4. ✅ Quote routes (/api/quote-requests/*)
5. ✅ Public routes (/api/public/*, /api/health/*)

---

### Phase 6: Environment Variables Update (Week 1)

#### 6.1 Update .env Files

```bash
# REMOVE (delete these):
# DATABASE_URL="prisma+postgres://..."  # Prisma Accelerate
# PRISMA_DATABASE_URL="..."

# ADD (new):
DATABASE_URL="postgresql://user:password@db.example.com:5432/dbname"
JWT_SECRET="your-super-secret-key-min-32-chars-change-in-production"
JWT_EXPIRY=1800  # 30 minutes in seconds

# KEEP (still needed for email):
EMAIL_SERVER_HOST="smtp.resend.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="resend"
EMAIL_SERVER_PASSWORD="..."
EMAIL_FROM="noreply@example.com"
```

#### 6.2 Update Environment Validation

```typescript
// src/lib/config/index.ts (UPDATED)
export function validateEnvironment(): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is not set');
  }
  
  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET is not set');
    warnings.push('Using default JWT_SECRET (not secure for production)');
  }
  
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters long');
  }
  
  // Optional with warnings
  if (!process.env.EMAIL_SERVER_HOST) {
    warnings.push('Email functionality disabled (EMAIL_SERVER_HOST not set)');
  }
  
  return { errors, warnings };
}
```

#### 6.3 Remove NextAuth Dependencies from config

```typescript
// OLD (remove these validations):
if (!process.env.NEXTAUTH_SECRET) {
  errors.push('NEXTAUTH_SECRET is not set');
}

if (!process.env.NEXTAUTH_URL) {
  errors.push('NEXTAUTH_URL is not set');
}

// NEW VALIDATION (as shown above)
```

---

### Phase 7: Testing & Verification (Week 4)

#### 7.1 Unit Tests for JWT Auth

```typescript
// src/__tests__/auth/jwt.test.ts (NEW)
import { createToken, verifyToken, hashPassword, comparePasswords } from '@/lib/auth/jwt-auth';

describe('JWT Authentication', () => {
  it('should create and verify tokens', async () => {
    const payload = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'USER',
    };
    
    const token = await createToken(payload);
    expect(token).toBeDefined();
    
    const verified = await verifyToken(token);
    expect(verified).toBeDefined();
    expect(verified?.id).toBe(payload.id);
    expect(verified?.email).toBe(payload.email);
  });
  
  it('should reject invalid tokens', async () => {
    const verified = await verifyToken('invalid.token.here');
    expect(verified).toBeNull();
  });
  
  it('should hash and compare passwords', async () => {
    const password = 'test-password-123';
    const hash = await hashPassword(password);
    
    expect(hash).not.toBe(password);
    
    const matches = await comparePasswords(password, hash);
    expect(matches).toBe(true);
    
    const notMatches = await comparePasswords('wrong-password', hash);
    expect(notMatches).toBe(false);
  });
});
```

#### 7.2 Integration Tests for Login Flow

```typescript
// src/__tests__/auth/login.integration.test.ts (NEW)
import { POST as loginHandler } from '@/app/api/auth/login/route';

describe('Login Integration', () => {
  it('should successfully login with valid credentials', async () => {
    // Create test user
    // Call login endpoint
    // Verify response contains token
    // Verify cookie is set
  });
  
  it('should reject invalid credentials', async () => {
    // Call login with wrong password
    // Verify 401 response
  });
});
```

#### 7.3 Migration Verification Checklist

- [ ] All Prisma imports removed from codebase
- [ ] All NextAuth imports removed from codebase
- [ ] SQL migration scripts created and executed
- [ ] Native `pg` queries tested with database
- [ ] JWT token creation/verification tested
- [ ] Login endpoint working
- [ ] Register endpoint working
- [ ] Session retrieval working
- [ ] Middleware validating JWTs correctly
- [ ] All 35+ API routes migrated
- [ ] All repositories using SQL queries
- [ ] Error handling consistent
- [ ] Logging updated
- [ ] Tests passing
- [ ] Performance acceptable
- [ ] No TypeScript errors

---

### Phase 8: Cleanup (Week 4)

#### 8.1 Remove Prisma-Related Files

```bash
# Files to delete:
rm prisma/schema.prisma
rm prisma/migrations/*  # entire migrations folder
rm -rf node_modules/@prisma
rm -rf node_modules/next-auth
rm -rf node_modules/@auth
```

#### 8.2 Remove NextAuth-Related Code

```bash
# Files to delete:
rm -rf src/lib/auth/  # (keep only custom JWT utils)
rm -rf src/app/api/auth/  # (keep only new custom routes)
rm -f src/lib/auth-utils.ts  # (if NextAuth-specific)
```

#### 8.3 Clean .env Files

```bash
# Remove from .env, .env.local, .env.production, .env.example:
# - NEXTAUTH_URL
# - NEXTAUTH_SECRET
# - DATABASE_URL (if Prisma-specific)
# - PRISMA_DATABASE_URL
```

#### 8.4 Remove Seed & Setup Scripts

```bash
# Files to delete:
rm prisma/seed.ts
rm scripts/setup-admin.ts
rm scripts/seed-admin.ts

# Create new migration scripts instead:
# scripts/migrate-db.ts
# scripts/seed-initial-data.ts
```

---

## 📋 REMOVAL PLAN SUMMARY TABLE

| Phase | Week | Task | Files Affected | Status |
|-------|------|------|-----------------|--------|
| 1 | 1 | Install deps, create types, DB connection module | 5+ | 🔴 Not started |
| 2 | 2-3 | Create SQL migrations, rewrite repositories | 50+ | 🔴 Not started |
| 3 | 2-3 | Replace NextAuth with custom JWT auth | 10 | 🔴 Not started |
| 4 | 2 | Update React hooks & client code | 20+ | 🔴 Not started |
| 5 | 3-4 | Migrate all API routes (35+) | 35+ | 🔴 Not started |
| 6 | 1 | Update environment variables | 5 | 🔴 Not started |
| 7 | 4 | Test & verification | - | 🔴 Not started |
| 8 | 4 | Cleanup & remove old files | 20+ | 🔴 Not started |

**Total Effort:** 4-6 weeks  
**Estimated Lines of Code:** 5,000-8,000 LOC changes

---

## ⚠️ CRITICAL CONSIDERATIONS

### 1. Data Migration
- ✅ All Prisma schema models must be converted to SQL DDL
- ✅ Existing database must be backed up
- ✅ Migration strategy needed if data already exists
- ✅ Consider zero-downtime migration if production data

### 2. Type Safety
- ⚠️ Prisma provides generated types - must manually define interfaces
- ⚠️ SQL queries won't have automatic type inference
- ✅ Solution: Create type definition files for all entities

### 3. Performance
- ✅ Custom queries may be more performant (no ORM overhead)
- ⚠️ Manual N+1 query prevention required
- ⚠️ Indexing strategy critical for PostgreSQL

### 4. Backward Compatibility
- ⚠️ Client code relying on `useSession()` must be updated
- ⚠️ API clients expecting NextAuth format need updates
- ✅ Can create adapter layer for compatibility (not recommended for long-term)

### 5. Testing Burden
- ⚠️ No automatic Prisma mocking
- ✅ Must write integration tests against real database (or use test containers)
- ✅ Mock functions more complex to write

---

## 🎯 QUICK START CHECKLIST

```
BEFORE STARTING:
☐ Backup entire codebase
☐ Backup PostgreSQL database
☐ Create feature branch (e.g., `feature/remove-prisma-nextauth`)
☐ Review this entire plan with team

PHASE 1 (Week 1):
☐ Install pg, jsonwebtoken
☐ Create src/lib/db/connection.ts
☐ Create src/lib/auth/jwt-auth.ts
☐ Create src/lib/auth/middleware-utils.ts
☐ Update middleware.ts
☐ Update environment variables

PHASE 2 (Week 2-3):
☐ Create SQL migration scripts
☐ Create src/lib/db/queries.ts
☐ Migrate all 12 repositories
☐ Test repository layer with database

PHASE 3 (Week 2-3):
☐ Create /api/auth/login endpoint
☐ Create /api/auth/register endpoint
☐ Create /api/auth/logout endpoint
☐ Create /api/auth/session endpoint
☐ Test endpoints manually

PHASE 4 (Week 2):
☐ Create useAuth hook
☐ Update login component
☐ Update register component
☐ Update dashboard components

PHASE 5 (Week 3-4):
☐ Update all 35+ API routes
☐ Test each route
☐ Update server actions

PHASE 6 (Week 1):
☐ Already done - environment variables

PHASE 7 (Week 4):
☐ Write unit tests for auth
☐ Write integration tests
☐ Run full test suite
☐ Manual end-to-end testing

PHASE 8 (Week 4):
☐ Remove Prisma files
☐ Remove NextAuth files
☐ Delete unused migrations
☐ Final code cleanup
☐ Final testing

DEPLOYMENT:
☐ Run on staging environment first
☐ Verify all functionality
☐ Monitor for errors
☐ Deploy to production
☐ Monitor production for issues
```

---

## 📞 ESTIMATED COSTS & RISKS

### Time Investment
- **Development:** 4-6 weeks (2-3 developers)
- **Testing:** 1-2 weeks
- **Documentation:** 1 week
- **Total:** 6-9 weeks

### Risk Assessment
| Risk | Severity | Mitigation |
|------|----------|-----------|
| Data loss during migration | 🔴 CRITICAL | Full database backup, test migration script first |
| Session invalid after deploy | 🔴 CRITICAL | Set session expiry to longer value during transition |
| API routes broken | 🟡 HIGH | Comprehensive testing, unit tests for each route |
| Performance regression | 🟡 HIGH | Benchmark before/after, add indexes to SQL queries |
| Authentication bypass | 🔴 CRITICAL | Security audit of JWT implementation, external code review |
| Breaking client changes | 🟡 HIGH | Maintain API compatibility layer temporarily |

---

## ✅ NEXT STEPS

1. **Review this plan** with your team
2. **Create feature branch** and start Phase 1
3. **Set up SQL migration infrastructure**
4. **Implement custom JWT authentication**
5. **Gradually migrate API routes** (can do incrementally)
6. **Test thoroughly** before removing old code
7. **Deploy to staging** first
8. **Monitor production** carefully after deployment

---

**Document prepared:** January 11, 2026  
**Status:** COMPLETE - READY FOR IMPLEMENTATION  
**Next update:** After Phase 1 completion
