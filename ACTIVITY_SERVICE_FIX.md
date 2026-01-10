# Activity Service Fix - UserActivity Model

## Error
```
Property 'userActivity' does not exist on type 'PrismaClient'
```

## Root Cause
The `logActivity` function signature was incorrect and didn't match how it was being called throughout the codebase.

## Issues Found

### 1. Wrong Function Signature
**File**: `src/lib/activity-service.ts`
**Problem**: Function expected 7 parameters but was being called with 3
**Impact**: TypeScript errors and incorrect usage

```typescript
// BEFORE (WRONG)
export async function logActivity(
  userId: number,
  activityType: ActivityType,
  description: string,
  title?: string,
  referenceId?: string,
  referenceType?: string,
  data: ActivityData = {}
)

// Called as:
await logActivity(userId, 'login', { isFirstLogin: true });
// ❌ Missing required 'description' parameter
```

### 2. Prisma Client Not Generated
**Problem**: Prisma client was out of sync with schema
**Impact**: TypeScript couldn't find UserActivity model

## Fixes Applied

### Fix 1: Simplified Function Signature
**File**: `src/lib/activity-service.ts`

```typescript
// AFTER (CORRECT)
export async function logActivity(
  userId: number,
  activityType: ActivityType,
  data: ActivityData = {}
) {
  try {
    await prisma.userActivity.create({
      data: {
        userId,
        activityType,
        title: (data.title as string) || null,
        description: (data.message as string) || activityType,
        referenceId: (data.referenceId as string) || null,
        referenceType: (data.referenceType as string) || null,
        metadata: Object.keys(data).length > 0 ? data : null,
      },
    });
  } catch (error) {
    console.error(`Failed to log activity ${activityType} for user ${userId}:`, error);
  }
}
```

### Fix 2: Regenerated Prisma Client
```bash
npx prisma generate
```

## Usage Examples

### Before (Broken)
```typescript
// ❌ Wrong - missing required parameters
await logActivity(userId, 'login', { isFirstLogin: true });
```

### After (Fixed)
```typescript
// ✅ Correct - all data in single object
await logActivity(userId, 'login', { 
  message: 'User logged in',
  isFirstLogin: true 
});

// ✅ With full context
await logActivity(userId, 'quote_create', {
  title: 'New Quote Created',
  message: 'User created a new quote',
  referenceId: quoteId,
  referenceType: 'Quote',
  quoteTotal: 1500.00
});

// ✅ Minimal usage
await logActivity(userId, 'view', {
  message: 'Viewed product page'
});
```

## Database Schema (Confirmed)

```prisma
model UserActivity {
  id            String   @id @default(uuid())
  userId        Int      @map("user_id")
  activityType  String   @map("activity_type")
  title         String?
  description   String
  referenceId   String?  @map("reference_id")
  referenceType String?  @map("reference_type")
  metadata      Json?
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime @default(now())
  
  @@index([userId])
  @@index([createdAt])
  @@index([userId, createdAt])
  @@index([activityType])
  @@map("user_activities")
}
```

## Activity Types Supported

```typescript
export type ActivityType = 
  | 'login' 
  | 'logout' 
  | 'quote_request' 
  | 'checkout' 
  | 'profile_update' 
  | 'password_reset'
  | 'email_verified'
  | 'account_created'
  | 'email_sent'
  | 'view'
  | 'cart_add'
  | 'cart_remove'
  | 'quote_create'
  | 'quote_update'
  | 'quote_submitted'
  | 'search'
  | 'purchase'
  | 'order_placement';
```

## Testing Checklist

- [x] Prisma client generated successfully
- [x] TypeScript errors resolved
- [x] Function signature matches usage
- [x] Activity logging works in auth flow
- [x] Metadata stored correctly
- [x] No breaking changes to existing code

## Files Modified

1. `src/lib/activity-service.ts` - Fixed function signature
2. Prisma client regenerated

## Summary

The activity service is now fixed:
- ✅ Simplified function signature (3 params instead of 7)
- ✅ All data passed in single object
- ✅ Prisma client regenerated
- ✅ TypeScript errors resolved
- ✅ Backward compatible with existing usage

Activity logging now works correctly throughout the application.
