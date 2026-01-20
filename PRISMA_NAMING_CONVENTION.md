# Prisma Naming Convention Standard

## Overview
This document establishes the uniform naming convention for all Prisma models and their usage across the codebase.

## Core Principle
**Prisma models use `snake_case` | TypeScript interfaces use `PascalCase`**

## Prisma Schema Models (snake_case)

### Current Prisma Models
```prisma
model users { }
model companies { }
model brands { }
model categories { }
model products { }
model quotes { }
model quote_lines { }
model quote_events { }
model quote_messages { }
model addresses { }
model customers { }
model admin_notifications { }
model notifications { }
model notification_preferences { }
model analytics_events { }
model error_logs { }
model form_submissions { }
model newsletter_subscribers { }
model leads { }
```

## TypeScript Domain Types (PascalCase)

### Mapping: Prisma Model → TypeScript Interface

| Prisma Model (snake_case) | TypeScript Interface (PascalCase) | Domain Type File |
|---------------------------|-----------------------------------|------------------|
| `users` | `User` | `src/lib/types/domain.ts` |
| `companies` | `Company` | `src/lib/types/domain.ts` |
| `brands` | `Brand` | `src/lib/types/domain.ts` |
| `categories` | `Category` | `src/lib/types/domain.ts` |
| `products` | `Product` | `src/lib/types/domain.ts` |
| `quotes` | `Quote` | `src/lib/types/domain.ts` |
| `quote_lines` | `QuoteLine` | `src/lib/types/domain.ts` |
| `quote_messages` | `QuoteMessage` | `src/lib/types/domain.ts` |
| `addresses` | `Address` | `src/lib/types/domain.ts` |
| `customers` | `Customer` | `src/lib/types/domain.ts` |
| `admin_notifications` | `AdminNotification` | `src/lib/types/domain.ts` |
| `notifications` | `Notification` | `src/lib/types/domain.ts` |
| `analytics_events` | `AnalyticsEvent` | `src/lib/types/domain.ts` |
| `error_logs` | `ErrorLog` | `src/lib/types/domain.ts` |
| `form_submissions` | `FormSubmission` | `src/lib/types/domain.ts` |
| `newsletter_subscribers` | `NewsletterSubscriber` | `src/lib/types/domain.ts` |
| `leads` | `Lead` | `src/lib/types/domain.ts` |

## Prisma Client Usage Patterns

### ✅ CORRECT Usage
```typescript
// Prisma queries use snake_case model names
await prisma.admin_notifications.findMany()
await prisma.users.findUnique()
await prisma.quote_lines.create()
await prisma.newsletter_subscribers.update()
```

### ❌ INCORRECT Usage (Common Mistakes)
```typescript
// DO NOT use camelCase for Prisma models
await prisma.adminNotifications.findMany()  // ❌ Wrong
await prisma.adminNotification.findMany()   // ❌ Wrong
await prisma.quoteLines.create()            // ❌ Wrong
await prisma.newsletterSubscriber.update()  // ❌ Wrong
```


## Field Naming Convention

### Prisma Schema Fields (camelCase)
```prisma
model admin_notifications {
  id        Int      @id @default(autoincrement())
  adminId   Int      // camelCase
  title     String
  message   String
  type      AdminNotificationType
  isRead    Boolean  // camelCase
  data      Json?
  createdAt DateTime // camelCase
}
```

### TypeScript Interface Fields (camelCase)
```typescript
export interface AdminNotification {
  id: number;
  adminId: number;        // matches Prisma field
  title: string;
  message: string;
  type: string;
  data?: Record<string, any>;
  isRead: boolean;        // matches Prisma field
  createdAt: Date;        // matches Prisma field
}
```

## Repository Pattern

### File Naming: kebab-case
```
src/repositories/admin-notification.repository.ts
src/repositories/user.repository.ts
src/repositories/quote.repository.ts
```

### Class Naming: PascalCase
```typescript
export class AdminNotificationRepository { }
export class UserRepository { }
export class QuoteRepository { }
```

### Prisma Usage in Repositories
```typescript
export class AdminNotificationRepository {
  async findAll() {
    return await prisma.admin_notifications.findMany(); // ✅ snake_case
  }
  
  async findById(id: number): Promise<AdminNotification | null> {
    return await prisma.admin_notifications.findUnique({ // ✅ snake_case
      where: { id }
    });
  }
}
```


## Service Layer Pattern

### File Naming: kebab-case or camelCase
```
src/services/notification.service.ts
src/services/quoteService.ts
```

### Prisma Usage in Services
```typescript
// notification.service.ts
export async function createAdminNotification(data: NotificationPayload) {
  return await prisma.admin_notifications.create({ // ✅ snake_case
    data: {
      adminId: data.adminId,
      title: data.title,
      message: data.message,
      type: data.type,
      isRead: false
    }
  });
}
```

## API Routes Pattern

### Prisma Usage in API Routes
```typescript
// src/app/api/admin/notifications/route.ts
export async function GET(request: NextRequest) {
  const notifications = await prisma.admin_notifications.findMany({ // ✅ snake_case
    orderBy: { createdAt: 'desc' }
  });
  
  return NextResponse.json(notifications);
}
```

## Server Actions Pattern

### Prisma Usage in Server Actions
```typescript
// src/app/admin/_actions/notifications.ts
'use server';

export async function getAdminNotifications(adminId: number) {
  return await prisma.admin_notifications.findMany({ // ✅ snake_case
    where: { adminId },
    orderBy: { createdAt: 'desc' }
  });
}
```


## Enum Naming Convention

### Prisma Enums (PascalCase)
```prisma
enum UserRole {
  ADMIN
  CUSTOMER
  SUPPLIER
}

enum AdminNotificationType {
  NEW_USER
  NEW_QUOTE
  LOW_STOCK
  SYSTEM_ALERT
  INFO
}

enum QuoteStatus {
  DRAFT
  PENDING
  NEGOTIATING
  ACCEPTED
  REJECTED
  EXPIRED
}
```

### TypeScript Enum Usage
```typescript
import { UserRole, AdminNotificationType } from '@prisma/client';

// Use Prisma-generated enums directly
const role: UserRole = UserRole.ADMIN;
const notifType: AdminNotificationType = AdminNotificationType.NEW_USER;
```

## Common Misalignments to Fix

### 1. AdminNotification Model
```typescript
// ❌ WRONG - Using camelCase for Prisma model
await prisma.adminNotification.findMany()
await prisma.adminNotifications.findMany()

// ✅ CORRECT - Using snake_case
await prisma.admin_notifications.findMany()
```

### 2. Quote Lines Model
```typescript
// ❌ WRONG
await prisma.quoteLines.create()
await prisma.quoteLine.create()

// ✅ CORRECT
await prisma.quote_lines.create()
```

### 3. Newsletter Subscribers Model
```typescript
// ❌ WRONG
await prisma.newsletterSubscriber.findMany()
await prisma.newsletterSubscribers.findMany()

// ✅ CORRECT
await prisma.newsletter_subscribers.findMany()
```


### 4. Analytics Events Model
```typescript
// ❌ WRONG
await prisma.analyticsEvent.create()
await prisma.analyticsEvents.create()

// ✅ CORRECT
await prisma.analytics_events.create()
```

### 5. Form Submissions Model
```typescript
// ❌ WRONG
await prisma.formSubmission.findMany()
await prisma.formSubmissions.findMany()

// ✅ CORRECT
await prisma.form_submissions.findMany()
```

## Type Imports

### Prisma Generated Types
```typescript
// Import Prisma-generated types
import { Prisma } from '@prisma/client';

// Use GetPayload for complex types
type AdminNotificationWithRelations = Prisma.admin_notificationsGetPayload<{
  include: { /* relations */ }
}>;

// ❌ WRONG - These don't exist
type Wrong = Prisma.AdminNotificationGetPayload<{}>;
type Wrong2 = Prisma.adminNotificationGetPayload<{}>;
```

### Domain Types
```typescript
// Import domain types from our type definitions
import type { 
  AdminNotification, 
  User, 
  Quote, 
  QuoteLine 
} from '@/lib/types/domain';
```

## Files Requiring Updates

### High Priority (Build Blockers)
1. `src/repositories/admin-notification.repository.ts` - Fix all `prisma.adminNotification` → `prisma.admin_notifications`
2. `src/app/admin/_actions/notifications.ts` - Fix Prisma model references
3. `src/app/api/admin/notifications/route.ts` - Fix Prisma queries
4. `src/app/api/admin/notifications/[id]/route.ts` - Fix Prisma queries
5. `src/services/notification.service.ts` - Fix Prisma model usage


### Medium Priority (Type Errors)
6. Fix all `AdminNotificationGetPayload` → `admin_notificationsGetPayload`
7. Fix all `FormSubmissionGetPayload` → `form_submissionsGetPayload`
8. Fix all `NewsletterSubscriberGetPayload` → `newsletter_subscribersGetPayload`
9. Fix all `AnalyticsEventGetPayload` → `analytics_eventsGetPayload`

## Validation Commands

After applying fixes, run these commands to validate:

```bash
# 1. Validate Prisma schema
npx prisma validate

# 2. Regenerate Prisma client
npx prisma generate

# 3. Check TypeScript errors
npx tsc --noEmit

# 4. Run linter
npm run lint

# 5. Run tests
npm test
```

## Quick Reference Table

| Context | Convention | Example |
|---------|-----------|---------|
| Prisma Model Name | `snake_case` | `admin_notifications` |
| Prisma Field Name | `camelCase` | `isRead`, `adminId` |
| TypeScript Interface | `PascalCase` | `AdminNotification` |
| TypeScript Field | `camelCase` | `isRead`, `adminId` |
| Enum Name | `PascalCase` | `AdminNotificationType` |
| Enum Value | `UPPER_SNAKE_CASE` | `NEW_USER`, `LOW_STOCK` |
| Repository File | `kebab-case` | `admin-notification.repository.ts` |
| Repository Class | `PascalCase` | `AdminNotificationRepository` |
| Service File | `kebab-case` or `camelCase` | `notification.service.ts` |
| Prisma Query | `snake_case` | `prisma.admin_notifications.findMany()` |

## Summary

**Golden Rule**: When writing Prisma queries, always use the exact model name from `schema.prisma` (snake_case).
The TypeScript interfaces are for type safety only and should never be used in Prisma queries.

---
**Document Version**: 1.0  
**Last Updated**: 2025-01-17  
**Status**: Reference Standard - Ready for Implementation
