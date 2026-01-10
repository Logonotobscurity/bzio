# TypeScript Codebase Audit & Debug Report

**Date:** January 9, 2026  
**Status:** In Progress  
**Total Errors:** 48 across 5 service files

---

## Executive Summary

The codebase has **48 TypeScript errors** concentrated in 5 service files. These errors fall into clear patterns:

1. **Repository-Service Type Mismatches** (28 errors)
   - Domain type definitions don't match repository return types
   - Missing properties between service interfaces and repository contracts

2. **JSON Value Type Issues** (12 errors)
   - `JsonValue` type from Prisma conflicts with `Record<string, any>` expectations
   - Affects notification.service.ts, newsletter.service.ts, lead.service.ts

3. **Error Logging Service Signature Mismatch** (8 errors)
   - `errorLoggingService.logError()` expects 1 argument but receives 2
   - All errors in quote.service.ts

4. **Property Existence Issues** (6 errors)
   - Missing properties not defined in domain types
   - Non-existent methods in repositories

---

## TypeScript Configuration Analysis

**File:** `tsconfig.json`

**Current Settings:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitReturns": false,
    "strictNullChecks": false,          ← PERMISSIVE
    "strictFunctionTypes": false,       ← PERMISSIVE
    "strictBindCallApply": false,       ← PERMISSIVE
    "strictPropertyInitialization": false,  ← PERMISSIVE
    "noImplicitThis": false             ← PERMISSIVE
  }
}
```

**Analysis:** 
- TypeScript is configured with `strict: true` but many strict options are disabled
- This creates inconsistent type checking - some checks pass while others fail
- Recommendation: Either fully enable strict mode or fully disable it for consistency

---

## Error Classification & Details

### 1. notification.service.ts - 15 Errors

**Primary Location:** Lines 32, 37, 63, 70, 77, 84, 91, 101, 115, 122, 130

#### Error 1-2: JSON Value Type Mismatch (Line 32, 37)
```
Error: Type 'Record<string, unknown>' is not assignable to type 'InputJsonValue'
Error Code: TS2322, TS2345
Category: Type Mismatches, Generic Type Issues
```

**Root Cause:**
- Service interface expects `data?: Record<string, unknown>`
- Repository interface defines `data?: Prisma.InputJsonValue`
- `Prisma.InputJsonValue` is a union of `JsonValue | InputJsonValue[]` but doesn't include arbitrary objects

**Fix:**
```typescript
// Change service input interface from:
interface CreateNotificationInput {
  data?: Record<string, unknown>;
}

// To:
interface CreateNotificationInput {
  data?: Prisma.InputJsonValue;
}

// OR import and use the proper type:
import type { Prisma } from '@prisma/client';
```

#### Error 3: Missing Method (Line 63)
```
Error: Property 'findByUserId' does not exist on type 'AdminNotificationRepository'
Error Code: TS2551
Category: Property Access Errors
```

**Root Cause:**
- Service calls `adminNotificationRepository.findByUserId()`
- Repository only has `findByAdminId()` method

**Fix:**
```typescript
// Change from:
return adminNotificationRepository.findByUserId(userId, limit, skip);

// To:
return adminNotificationRepository.findByAdminId(Number(userId), limit, skip);
```

#### Error 4: Type Mismatch (Line 70)
```
Error: Argument of type 'string' is not assignable to parameter of type 'number'
Error Code: TS2345
Category: Type Mismatches
```

**Root Cause:**
- `userId` is string, but `countUnread()` expects number

**Fix:**
```typescript
return adminNotificationRepository.countUnread(Number(userId));
```

#### Errors 5-6: Return Type Mismatch (Lines 77, 84, 115)
```
Error: Type '{ id: string; ... }' is not assignable to type 'AdminNotification'
Error: Type 'BatchPayload' is not assignable to type 'number'
Error Code: TS2322, TS2345
Category: Type Mismatches
```

**Root Cause:**
- Repository returns `JsonValue` for data field, service expects `Record<string, any>`
- `markAllAsRead()` returns Prisma `BatchPayload`, not `number`
- `deleteAll()` returns Prisma `BatchPayload`, not `number`

**Fix:**
```typescript
// Update repository return type handling
// Cast return values appropriately
return (await adminNotificationRepository.markAllAsRead(adminId)).count;
return (await adminNotificationRepository.deleteAll(adminId)).count;
```

**Complete File Fixes:**

| Line | Error | Fix |
|------|-------|-----|
| 32, 37 | JSON type mismatch | Use `Prisma.InputJsonValue` in service |
| 63 | Method not found | Change to `findByAdminId()` |
| 70 | String vs number | Cast `userId` to number |
| 77 | Return type | Repository returns correct type |
| 84 | Return type | Handle `BatchPayload.count` |
| 91, 101, 122, 130 | JSON mismatch | Repository returns correct type |
| 115 | Return type | Handle `BatchPayload.count` |

---

### 2. lead.service.ts - 10 Errors

**Primary Location:** Lines 45, 47, 60, 67, 74, 81, 88, 95, 102, 177

#### Root Cause Analysis

**Issue 1: Property Naming Mismatch (Lines 45, 47)**
```
Error: 'firstName' does not exist in type 'CreateLeadInput'
Error Code: TS2353
Category: Property Access Errors
```

**Root Cause:**
- Service uses `firstName`, `lastName` properties
- Repository interface expects `name` (single field)
- Lead model in Prisma schema uses `name`, not separate `firstName`/`lastName`

**Issue 2: JSON Type Mismatch (Lines 60, 67, 74, 81, 88, 95, 102, 177)**
```
Error: Type 'JsonValue' is not assignable to type 'Record<string, any>'
Error Code: TS2322
Category: Type Mismatches, Generic Type Issues
```

**Root Cause:**
- Service imports `Lead` from domain types
- Domain type expects `metadata: Record<string, any>`
- Repository returns Prisma `Lead` type with `metadata: JsonValue`
- `JsonValue` union type includes `string | number | boolean` which aren't compatible with object

**Fixes:**

```typescript
// Fix 1: Update service interface to match repository
interface CreateLeadInput {
  email: string;
  name: string;           // Changed from firstName/lastName
  phone?: string;
  company?: string;
  source: string;
  status?: string;
}

// Fix 2: Remove the import of Lead from domain types
// Instead use repository's inferred type
import type { Prisma } from '@prisma/client';
type Lead = Prisma.LeadGetPayload<{}>;

// Fix 3: Update service to use correct field names
return leadRepository.create({
  email: input.email,
  name: input.name,        // Use name instead of firstName
  companyName: input.company,
  phone: input.phone,
  type: 'lead',
  source: input.source,
  status: input.status || 'new',
});
```

**Complete File Fixes:**

| Lines | Error | Fix |
|-------|-------|-----|
| 45, 47 | Property mismatch | Use `name` field, not `firstName`/`lastName` |
| 60 | Return type | Repository type is correct |
| 67, 74 | Return type | Repository type is correct |
| 81, 88 | Return type | Repository type is correct |
| 95, 102 | Return type | Repository type is correct |
| 177 | Return type | Repository type is correct |

---

### 3. newsletter.service.ts - 8 Errors

**Primary Location:** Lines 35, 40, 42, 51, 67, 82, 121, 150

#### Root Cause Analysis

**Issue 1: Missing Properties (Lines 35, 40, 42, 51, 82, 150)**
```
Error: Property 'isActive' does not exist
Error: Property 'interests' does not exist
Error: Property 'firstName' does not exist
Error Code: TS2339, TS2353
Category: Property Access Errors
```

**Root Cause:**
- Service uses domain types expecting `isActive`, `firstName`, `lastName`, `interests`
- Repository defines `NewsletterSubscriber` based on Prisma schema
- Prisma schema only has `email`, `status`, `source`, `metadata`, `subscribedAt`, `unsubscribedAt`
- Service tries to set properties that don't exist

**Issue 2: Return Type Mismatch (Line 67)**
```
Error: Type '{ id: string; email: string; ... }' is not assignable to type 'boolean'
Error Code: TS2322
Category: Type Mismatches
```

**Root Cause:**
- `unsubscribe()` method returns `boolean`
- Repository `unsubscribe()` likely returns the updated entity object, not boolean

**Issue 3: Input Type Mismatch (Line 121)**
```
Error: Type 'UpdateSubscriberInput' has no properties in common with 'UpdateNewsletterSubscriberInput'
Error Code: TS2559
Category: Type Mismatches
```

**Root Cause:**
- Service defines its own `UpdateSubscriberInput` interface
- Repository expects `UpdateNewsletterSubscriberInput`
- They have different properties

**Fixes:**

```typescript
// Fix 1: Update domain interfaces to match schema
interface SubscribeInput {
  email: string;
  source?: string;  // Instead of firstName, lastName, interests
  status?: string;
  metadata?: Record<string, any>;
}

interface UpdateSubscriberInput {
  status?: string;
  metadata?: Record<string, any>;
  unsubscribedAt?: Date;
}

// Fix 2: Update methods to use correct property names
async subscribe(input: SubscribeInput): Promise<NewsletterSubscriber> {
  this.validateEmail(input.email);

  const existing = await newsletterSubscriberRepository.findByEmail(input.email);
  if (existing && existing.status === 'active') {  // Use 'status' field
    throw new Error('Email already subscribed');
  }

  if (existing && existing.status !== 'active') {
    return newsletterSubscriberRepository.update(existing.id, {
      status: 'active',
      metadata: input.metadata,  // Use metadata, not interests
    });
  }

  return newsletterSubscriberRepository.create({
    email: input.email,
    source: input.source || 'web',
    status: 'active',
    metadata: input.metadata,
  });
}

// Fix 3: Update unsubscribe return type
async unsubscribe(email: string): Promise<NewsletterSubscriber> {
  const subscriber = await newsletterSubscriberRepository.findByEmail(email);
  if (!subscriber) {
    throw new Error('Subscriber not found');
  }

  return await newsletterSubscriberRepository.update(subscriber.id, {
    status: 'inactive',
    unsubscribedAt: new Date(),
  });
}

// Fix 4: Remove filter logic that depends on non-existent properties
async getActiveSubscribers(limit?: number, skip?: number): Promise<NewsletterSubscriber[]> {
  return newsletterSubscriberRepository.findAll(limit, skip);
}

// Fix 5: Update method signatures to use correct input types
async updateSubscriber(
  id: string | number,
  input: UpdateSubscriberInput  // Now matches repository type
): Promise<NewsletterSubscriber> {
  return newsletterSubscriberRepository.update(id, input);
}
```

**Complete File Fixes:**

| Lines | Error | Fix |
|-------|-------|-----|
| 35, 40, 42 | Property `isActive` | Use `status` field |
| 51, 82 | Property `firstName` | Use `metadata` field |
| 67 | Return type mismatch | Return `NewsletterSubscriber` not `boolean` |
| 121 | Input type mismatch | Use `UpdateNewsletterSubscriberInput` |
| 150 | Property `interests` | Use `metadata` field |

---

### 4. quote-message.service.ts - 6 Errors

**Primary Location:** Lines 32, 44, 58, 74, 121

#### Root Cause Analysis

**Issue 1: Type Conversion (Lines 32, 44, 74)**
```
Error: Argument of type 'number' is not assignable to parameter of type 'string'
Error Code: TS2345
Category: Type Mismatches
```

**Root Cause:**
- Service converts `quoteId` to number: `Number(input.quoteId)`
- Repository expects string in `CreateQuoteMessageInput`
- Prisma schema likely has `quoteId` as string

**Issue 2: Return Type Mismatch (Line 58)**
```
Error: Type 'BatchPayload' is missing properties from type 'QuoteMessage'
Error Code: TS2740
Category: Type Mismatches
```

**Root Cause:**
- `markAsRead()` returns `BatchPayload` from Prisma updateMany
- Service expects `QuoteMessage` (update single message)

**Issue 3: Missing Property (Line 121)**
```
Error: Property 'userId' does not exist
Error Code: TS2339
Category: Property Access Errors
```

**Root Cause:**
- Service filters by `userId`
- Repository message entity has `senderRole`, `senderEmail`, `senderName` but no `userId` field

**Fixes:**

```typescript
// Fix 1: Don't convert quoteId to number
async sendMessage(input: CreateMessageInput): Promise<QuoteMessage> {
  this.validateMessageInput(input);

  return quoteMessageRepository.create({
    quoteId: String(input.quoteId),  // Keep as string
    userId: input.userId,
    message: input.message,
    messageType: input.messageType || 'comment',
    isRead: false,
  });
}

// Fix 2: Use correct parameter type
async getQuoteMessages(quoteId: string | number): Promise<QuoteMessage[]> {
  return quoteMessageRepository.findByQuoteId(String(quoteId));  // Convert to string
}

// Fix 3: Update markAsRead to handle single message (not batch)
async markAsRead(id: string | number): Promise<QuoteMessage> {
  return quoteMessageRepository.update(String(id), { isRead: true });
}

// Fix 4: Use correct field name
async countUnread(quoteId: string | number): Promise<number> {
  return quoteMessageRepository.countUnread(String(quoteId));
}

// Fix 5: Use senderEmail instead of userId
async getMessagesByUser(senderEmail: string): Promise<QuoteMessage[]> {
  const all = await quoteMessageRepository.findAll();
  return all?.filter(m => m.senderEmail === senderEmail) || [];
}
```

**Complete File Fixes:**

| Line | Error | Fix |
|------|-------|-----|
| 32 | Type conversion | Keep `quoteId` as string |
| 44 | Type conversion | Pass string, not number |
| 58 | Return type | Handle `BatchPayload` or use single update |
| 74 | Type conversion | Pass string, not number |
| 121 | Missing property | Use `senderEmail` instead of `userId` |

---

### 5. quote.service.ts - 9 Errors

**Primary Location:** Lines 25, 49, 74, 99, 128, 149, 170, 188, 231

#### Root Cause Analysis

**Issue: Error Logging Signature Mismatch (All lines)**
```
Error: Expected 1 arguments, but got 2
Error Code: TS2554
Category: Async/Promise Issues
```

**Root Cause:**
- Service calls: `errorLoggingService.logError(error, { context: '...', ... })`
- ErrorLoggingService expects: `logError(input: LogErrorInput)`
- `LogErrorInput` takes a single object with `message`, `stack`, `severity`, etc.
- Service passes error as first arg, then object as second

**Fix:**

```typescript
// Change from:
await errorLoggingService.logError(error, {
  context: 'QuoteService.getAllQuotes',
  severity: 'error',
});

// To:
await errorLoggingService.logError({
  message: error instanceof Error ? error.message : String(error),
  severity: 'error',
  metadata: {
    context: 'QuoteService.getAllQuotes',
  },
});

// Or create a wrapper method in QuoteService:
private async logError(error: unknown, context: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
  await errorLoggingService.logError({
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    severity,
    metadata: { context },
  });
}

// Then use it as:
await this.logError(error, 'QuoteService.getAllQuotes', 'error');
```

**Complete File Fixes:**

| Line | Context | Fix |
|------|---------|-----|
| 25 | getAllQuotes | Update error logging call signature |
| 49 | getQuoteById | Update error logging call signature |
| 74 | getQuoteByReference | Update error logging call signature |
| 99 | updateQuote | Update error logging call signature |
| 128 | deleteQuote | Update error logging call signature |
| 149 | getUserQuotes | Update error logging call signature |
| 170 | getQuotesByStatus | Update error logging call signature |
| 188 | getQuoteCount | Update error logging call signature |
| 231 | createQuote | Update error logging call signature |

---

## Cross-File Pattern Analysis

### Common Issues Across Multiple Files

#### 1. **Prisma JsonValue Type Incompatibility**
**Affected:** notification.service.ts, lead.service.ts, newsletter.service.ts

**Pattern:**
```typescript
// Service expects:
data?: Record<string, any>

// Repository provides:
data?: Prisma.InputJsonValue
```

**Solution:**
- Align service interfaces with repository types
- Use `Prisma.InputJsonValue` consistently
- OR update domain types to account for `JsonValue` union

#### 2. **Missing Repository Methods**
**Affected:** notification.service.ts, quote-message.service.ts

**Pattern:**
- Services call methods that don't exist on repositories
- Example: `findByUserId` vs `findByAdminId`

**Solution:**
- Either add methods to repository
- Or use correct method names in service

#### 3. **Type Mismatches Between Domains and Repositories**
**Affected:** lead.service.ts, newsletter.service.ts

**Pattern:**
- Service domain types expect properties not in schema
- Example: `firstName`, `lastName`, `isActive`, `interests`

**Solution:**
- Update service interfaces to match repository contracts
- Don't mix domain types with repository types

#### 4. **Async Operation Return Type Issues**
**Affected:** notification.service.ts, quote-message.service.ts

**Pattern:**
- Prisma batch operations return `BatchPayload`
- Services expect primitive types (`number`, specific entities)

**Solution:**
- Extract count from `BatchPayload`: `result.count`
- Use update for single records, not updateMany

---

## Architectural Recommendations

### 1. **Establish Clear Type Boundaries**
Create three distinct type layers:
- **Domain Types** - Business logic entities
- **Repository Types** - Database schema types
- **Service Types** - Input/output contracts

```typescript
// src/lib/types/domain.ts
export interface Lead {
  id: string;
  name: string;
  email: string;
  // ... business domain
}

// src/repositories/lead.repository.ts
type LeadEntity = Prisma.LeadGetPayload<{}>;

// src/services/lead.service.ts
interface CreateLeadInput {
  name: string;
  email: string;
}
```

### 2. **Use Type Mapping Functions**
Map between repository types and domain types explicitly:

```typescript
private mapToLeadDomain(entity: LeadEntity): Lead {
  return {
    id: entity.id,
    name: entity.name,
    email: entity.email,
  };
}
```

### 3. **Standardize Error Logging**
Create a typed wrapper for consistent error handling:

```typescript
protected async withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    await errorLoggingService.logError({
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      severity,
      metadata: { context },
    });
    throw error;
  }
}

// Usage:
async getAllQuotes() {
  return this.withErrorHandling(
    () => quoteRepository.findAll(),
    'QuoteService.getAllQuotes',
    'error'
  );
}
```

### 4. **Use Repository Base Class Consistently**
Ensure all repositories implement common interface:

```typescript
abstract class BaseRepository<T, C, U> {
  abstract findAll(limit?: number, skip?: number): Promise<T[]>;
  abstract findById(id: string | number): Promise<T | null>;
  abstract create(data: C): Promise<T>;
  abstract update(id: string | number, data: U): Promise<T>;
  abstract delete(id: string | number): Promise<boolean>;
}
```

### 5. **Strict Type Configuration**
Recommend updating tsconfig.json:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## Priority Action Items

### 🔴 CRITICAL (Fix First)
1. **Fix error logging in quote.service.ts** - 9 errors
   - All quote service methods have wrong error logging signature
   - Blocking compilation

2. **Fix JSON type issues in notification.service.ts** - 4 core issues
   - Creates cascading failures in return types
   - Affects type inference

### 🟠 HIGH (Fix Second)
3. **Fix lead.service.ts property mismatches** - Use `name` not `firstName`
   - Changes to interface and 8 method returns

4. **Fix newsletter.service.ts properties** - Remove non-existent fields
   - `isActive` → `status`
   - `firstName`, `interests` → `metadata`

### 🟡 MEDIUM (Fix Third)
5. **Fix quote-message.service.ts type conversions**
   - Keep `quoteId` as string throughout
   - Fix property references

---

## Implementation Order

```
Phase 1: Type Definition Updates (30 min)
├─ Update service interfaces to match repositories
├─ Remove mismatched domain type imports
└─ Add Prisma type imports

Phase 2: Error Logging Fix (20 min)
├─ Create error logging wrapper or update calls
└─ Apply to all quote.service.ts methods

Phase 3: Repository Alignment (40 min)
├─ Update notification.service.ts methods
├─ Update lead.service.ts methods
├─ Update newsletter.service.ts methods
├─ Update quote-message.service.ts methods
└─ Fix return type handling

Phase 4: Verification (10 min)
├─ Run typecheck
├─ Run tests
└─ Verify no regressions
```

---

## File-by-File Fix Summary

### notification.service.ts (15 errors → 0)
- [ ] Import `Prisma` types
- [ ] Update `CreateNotificationInput.data` type
- [ ] Fix method calls: `findByAdminId()` instead of `findByUserId()`
- [ ] Cast `userId` to number
- [ ] Handle `BatchPayload` return types

### lead.service.ts (10 errors → 0)
- [ ] Update `CreateLeadInput` interface
- [ ] Use `name` field instead of `firstName`/`lastName`
- [ ] Remove domain type imports conflicting with repo types

### newsletter.service.ts (8 errors → 0)
- [ ] Update interfaces to use `status`, `metadata`
- [ ] Remove `isActive`, `firstName`, `lastName`, `interests` properties
- [ ] Update `unsubscribe()` return type
- [ ] Fix method signatures

### quote-message.service.ts (6 errors → 0)
- [ ] Keep `quoteId` as string
- [ ] Use `senderEmail` instead of `userId`
- [ ] Handle `BatchPayload` from Prisma

### quote.service.ts (9 errors → 0)
- [ ] Update all `errorLoggingService.logError()` calls
- [ ] Match signature: `logError(input: LogErrorInput)`

---

## Completion Checklist

After applying all fixes, verify:

- [ ] All 48 errors are resolved
- [ ] `npm run typecheck` passes
- [ ] No new errors introduced
- [ ] `npm run test` passes (if tests exist)
- [ ] All service methods have proper return types
- [ ] No `any` types used (except where justified)
- [ ] Error logging is consistent across all services
- [ ] Repository and service types are aligned
- [ ] Null checks are explicit where needed
- [ ] Async operations properly handle Prisma batch responses

---

## Generated: January 9, 2026
