# User Settings Design Document

## Audit & Design: Profile, Security, Activities

---

## Compatibility Audit

### ✅ What Already Fits

| Component | Status | Details |
|-----------|--------|---------|
| **User Model** | ✅ Complete | Has `firstName`, `lastName`, `phone`, `companyId` relation |
| **Address Model** | ✅ Complete | Separate model with `street`, `city`, `state`, `postalCode`, `country`, `type`, `isDefault` |
| **Company Model** | ✅ Complete | Has `name`, `registrationNumber`, `taxId`, `industry`, `website` |
| **AnalyticsEvent** | ✅ Complete | Supports `eventType`, `eventData` (JSON), nullable `userId` |
| **Auth.js v5** | ✅ Compatible | Uses JWT strategy, exposes `id`, `role`, `company` in session |
| **Password Hashing** | ✅ bcryptjs | Already used in auth.ts and register route |
| **Settings Route** | ✅ Exists | `/account/settings` with basic SettingsClient.tsx |
| **Server Actions** | ✅ Partial | `settings.ts` has `getUserProfile()` and validation schemas |

### ⚠️ What Needs Enhancement

| Component | Issue | Action Required |
|-----------|-------|-----------------|
| **SettingsClient.tsx** | UI only, no server action integration | Wire up to server actions |
| **settings.ts** | Missing `updateProfile`, `updateAddress`, `changePassword` | Add complete CRUD actions |
| **Activity Types** | Missing profile/security events | Add new event types |
| **Session Sync** | Name changes don't update session | Add session update trigger |
| **Password Change** | No implementation | Add secure change password flow |

### Schema Compatibility Summary

```
User Model Fields:
✅ firstName, lastName (nullable strings)
✅ phone (nullable string)
✅ companyId → Company relation
✅ password (hashed with bcryptjs)
✅ addresses[] → Address relation

Address Model:
✅ type (BILLING | SHIPPING)
✅ street, city, state, postalCode, country
✅ isDefault, userId

Company Model:
✅ name, registrationNumber, taxId, industry, website

AnalyticsEvent:
✅ eventType (string)
✅ eventData (JSON)
✅ userId (nullable - supports guests)
```

---

## Schema & Model Updates

### No Schema Changes Required

The existing Prisma schema fully supports all required functionality:

```prisma
// User - Already has all needed fields
model User {
  firstName    String?
  lastName     String?
  phone        String?
  company      Company? @relation(fields: [companyId], references: [id])
  companyId    Int?
  addresses    Address[]
  // ... password, email, etc.
}

// Address - Complete structure
model Address {
  type        AddressType @default(BILLING)
  street      String
  city        String
  state       String
  postalCode  String
  country     String @default("Nigeria")
  isDefault   Boolean @default(false)
  user        User? @relation(fields: [userId], references: [id])
  userId      Int?
}

// Company - Full business info
model Company {
  name               String
  registrationNumber String?
  taxId              String?
  industry           String?
  website            String?
}

// AnalyticsEvent - Flexible event storage
model AnalyticsEvent {
  eventType  String
  eventData  Json?
  userId     Int?
}
```

### Activity Event Types to Support

```typescript
// New event types for user settings
type SettingsEventType =
  | 'profile_updated'      // Name, phone changed
  | 'address_created'      // New address added
  | 'address_updated'      // Address modified
  | 'address_deleted'      // Address removed
  | 'company_updated'      // Company info changed
  | 'password_changed'     // Security update
  | 'notification_read'    // User read notification
  | 'notification_preferences_updated';

// Existing event types (already supported)
type ExistingEventType =
  | 'product_viewed'
  | 'quote_requested'
  | 'checkout_completed'
  | 'form_submitted'
  | 'newsletter_signup'
  | 'user_registered'
  | 'search_performed';
```

---

## Routes, Pages & Components

### File Structure

```
src/app/account/settings/
├── page.tsx                    # Server component - fetches data
├── SettingsClient.tsx          # Main client component (UPDATE)
├── _components/
│   ├── ProfileForm.tsx         # Name, phone form
│   ├── AddressForm.tsx         # Address CRUD
│   ├── CompanyForm.tsx         # Company info form
│   ├── SecurityForm.tsx        # Change password
│   └── NotificationPrefs.tsx   # Email preferences
└── _actions/
    └── (uses ../../../_actions/settings.ts)

src/app/account/_actions/
├── settings.ts                 # All settings server actions (UPDATE)
└── dashboard.ts                # Dashboard data (existing)

src/app/account/_types/
├── dashboard.ts                # Dashboard types (existing)
└── settings.ts                 # Settings types (NEW)
```

### Component Responsibilities

#### ProfileForm.tsx
```typescript
interface ProfileFormProps {
  initialData: {
    firstName: string;
    lastName: string;
    phone: string;
  };
}
// Calls: updateUserProfile(data)
// Events: profile_updated
```

#### AddressForm.tsx
```typescript
interface AddressFormProps {
  addresses: Address[];
  onAddressChange: () => void;
}
// Calls: createAddress, updateAddress, deleteAddress, setDefaultAddress
// Events: address_created, address_updated, address_deleted
```

#### CompanyForm.tsx
```typescript
interface CompanyFormProps {
  company: Company | null;
}
// Calls: updateCompany, createCompany
// Events: company_updated
```

#### SecurityForm.tsx
```typescript
interface SecurityFormProps {
  email: string;
}
// Calls: changePassword(currentPassword, newPassword)
// Events: password_changed
```

---

## Server Actions Design

### Complete settings.ts Implementation

```typescript
// src/app/account/_actions/settings.ts

"use server";

import { auth } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { revalidatePath } from "next/cache";
import { compare, hash } from 'bcryptjs';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const profileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
});

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().default('Nigeria'),
  type: z.enum(['BILLING', 'SHIPPING']).default('BILLING'),
  isDefault: z.boolean().default(false),
});

const companySchema = z.object({
  name: z.string().min(1),
  registrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getCurrentUserId(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  return parseInt(session.user.id);
}

async function trackActivity(
  userId: number,
  eventType: string,
  metadata?: Record<string, unknown>
) {
  await prisma.analyticsEvent.create({
    data: {
      userId,
      eventType,
      eventData: metadata || {},
    },
  });
}

// ============================================================================
// PROFILE ACTIONS
// ============================================================================

export async function updateUserProfile(input: z.infer<typeof profileSchema>) {
  const userId = await getCurrentUserId();
  const data = profileSchema.parse(input);

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName || null,
      phone: data.phone || null,
    },
  });

  await trackActivity(userId, 'profile_updated', {
    fields: ['firstName', 'lastName', 'phone'],
  });

  revalidatePath('/account');
  return { success: true, user };
}

// ============================================================================
// ADDRESS ACTIONS
// ============================================================================

export async function createAddress(input: z.infer<typeof addressSchema>) {
  const userId = await getCurrentUserId();
  const data = addressSchema.parse(input);

  // If setting as default, unset other defaults
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId, type: data.type },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: { ...data, userId },
  });

  await trackActivity(userId, 'address_created', {
    addressId: address.id,
    type: data.type,
  });

  revalidatePath('/account/settings');
  return { success: true, address };
}

export async function updateAddress(
  addressId: number,
  input: z.infer<typeof addressSchema>
) {
  const userId = await getCurrentUserId();
  const data = addressSchema.parse(input);

  // Verify ownership
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) throw new Error('Address not found');

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId, type: data.type, id: { not: addressId } },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id: addressId },
    data,
  });

  await trackActivity(userId, 'address_updated', { addressId });

  revalidatePath('/account/settings');
  return { success: true, address };
}

export async function deleteAddress(addressId: number) {
  const userId = await getCurrentUserId();

  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) throw new Error('Address not found');

  await prisma.address.delete({ where: { id: addressId } });

  await trackActivity(userId, 'address_deleted', { addressId });

  revalidatePath('/account/settings');
  return { success: true };
}

// ============================================================================
// COMPANY ACTIONS
// ============================================================================

export async function updateCompany(input: z.infer<typeof companySchema>) {
  const userId = await getCurrentUserId();
  const data = companySchema.parse(input);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { companyId: true },
  });

  let company;
  if (user?.companyId) {
    company = await prisma.company.update({
      where: { id: user.companyId },
      data,
    });
  } else {
    company = await prisma.company.create({
      data: {
        ...data,
        users: { connect: { id: userId } },
      },
    });
  }

  await trackActivity(userId, 'company_updated', {
    companyId: company.id,
  });

  revalidatePath('/account/settings');
  return { success: true, company };
}

// ============================================================================
// SECURITY ACTIONS
// ============================================================================

export async function changePassword(input: z.infer<typeof passwordSchema>) {
  const userId = await getCurrentUserId();
  const data = passwordSchema.parse(input);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user) throw new Error('User not found');

  // Verify current password
  const isValid = await compare(data.currentPassword, user.password);
  if (!isValid) {
    return { success: false, error: 'Current password is incorrect' };
  }

  // Hash and update new password
  const hashedPassword = await hash(data.newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  await trackActivity(userId, 'password_changed', {
    timestamp: new Date().toISOString(),
  });

  revalidatePath('/account/settings');
  return { success: true };
}
```

---

## Activity & Tracking Design

### Event Types & Recording

| Event Type | Trigger | Metadata |
|------------|---------|----------|
| `profile_updated` | User saves profile form | `{ fields: string[] }` |
| `address_created` | User adds new address | `{ addressId, type }` |
| `address_updated` | User edits address | `{ addressId }` |
| `address_deleted` | User removes address | `{ addressId }` |
| `company_updated` | User updates company info | `{ companyId }` |
| `password_changed` | User changes password | `{ timestamp }` |
| `notification_read` | User marks notification read | `{ notificationId }` |
| `product_viewed` | User views product page | `{ productId, sku, name }` |
| `quote_requested` | User submits quote | `{ quoteId, reference }` |
| `checkout_completed` | User completes checkout | `{ totalAmount }` |

### Activity Display in Dashboard

Update `formatActivityDescription` in `dashboard.ts`:

```typescript
function formatActivityDescription(type: string, data: unknown): string {
  const eventData = data as Record<string, unknown> | null;

  switch (type) {
    // Existing events
    case 'quote_requested':
      return `Requested quote ${eventData?.reference || ''}`;
    case 'checkout_completed':
      return `Completed checkout for ₦${eventData?.totalAmount || 0}`;
    case 'product_viewed':
      return `Viewed product ${eventData?.productName || eventData?.sku || ''}`;
    
    // New settings events
    case 'profile_updated':
      return 'Updated profile information';
    case 'address_created':
      return `Added new ${eventData?.type?.toLowerCase() || ''} address`;
    case 'address_updated':
      return 'Updated address';
    case 'address_deleted':
      return 'Removed an address';
    case 'company_updated':
      return 'Updated company information';
    case 'password_changed':
      return 'Changed account password';
    case 'notification_read':
      return 'Marked notification as read';
    
    default:
      return type.replace(/_/g, ' ');
  }
}
```

### Update ActivityType in dashboard.ts

```typescript
export type ActivityType =
  // Existing
  | 'quote_requested'
  | 'checkout_completed'
  | 'form_submitted'
  | 'product_viewed'
  | 'search_performed'
  | 'user_registered'
  | 'newsletter_signup'
  // New settings events
  | 'profile_updated'
  | 'address_created'
  | 'address_updated'
  | 'address_deleted'
  | 'company_updated'
  | 'password_changed'
  | 'notification_read';
```

---

## Security & Password Management

### Change Password Flow

```
1. User clicks "Change Password" button
2. Modal/form opens with fields:
   - Current Password
   - New Password
   - Confirm New Password
3. Client-side validation:
   - All fields required
   - New password min 8 chars
   - Passwords match
4. Submit to server action `changePassword()`
5. Server-side:
   a. Verify session (get userId)
   b. Fetch user's current password hash
   c. Compare current password with hash (bcrypt)
   d. If invalid: return error
   e. Hash new password (bcrypt, 12 rounds)
   f. Update user record
   g. Log activity event
   h. Return success
6. UI shows success toast or error message
```

### Server Action Signature

```typescript
export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ success: boolean; error?: string }>;
```

### Security Considerations

- ✅ Verify current password before allowing change
- ✅ Use bcrypt with 12 rounds for hashing
- ✅ Validate password strength (min 8 chars)
- ✅ Log password change event (without storing passwords)
- ✅ Session remains valid after password change
- ⚠️ Consider: Force re-login after password change (optional)
- ⚠️ Consider: Rate limiting on password attempts (future)

---

## Implementation Checklist

### Phase 1: Server Actions (Backend)
- [ ] 1.1 Complete `updateUserProfile()` in settings.ts
- [ ] 1.2 Add `createAddress()`, `updateAddress()`, `deleteAddress()`
- [ ] 1.3 Add `updateCompany()` action
- [ ] 1.4 Implement `changePassword()` with bcrypt verification
- [ ] 1.5 Add `trackActivity()` helper and call from all actions

### Phase 2: Types & Activity Updates
- [ ] 2.1 Create `src/app/account/_types/settings.ts` with form types
- [ ] 2.2 Update `ActivityType` in dashboard.ts with new events
- [ ] 2.3 Update `formatActivityDescription()` for new event types

### Phase 3: UI Components
- [ ] 3.1 Create `ProfileForm.tsx` component
- [ ] 3.2 Create `AddressForm.tsx` with add/edit/delete
- [ ] 3.3 Create `CompanyForm.tsx` component
- [ ] 3.4 Create `SecurityForm.tsx` with password change modal
- [ ] 3.5 Create `NotificationPrefs.tsx` for email settings

### Phase 4: Integration
- [ ] 4.1 Update `SettingsClient.tsx` to use new components
- [ ] 4.2 Update `settings/page.tsx` to fetch full profile data
- [ ] 4.3 Add loading states and error handling
- [ ] 4.4 Add success/error toast notifications

### Phase 5: Testing & Polish
- [ ] 5.1 Test profile update flow
- [ ] 5.2 Test address CRUD operations
- [ ] 5.3 Test password change with correct/incorrect passwords
- [ ] 5.4 Verify activity events appear in dashboard
- [ ] 5.5 Test form validation and error states

---

*Document generated for User Settings implementation*
*Stack: Next.js 16 + Auth.js v5 + Prisma 5*
