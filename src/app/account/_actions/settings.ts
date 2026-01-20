"use server";

import { auth } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { revalidatePath } from "next/cache";
import { invalidateDashboardCache } from '@/lib/cache';
import { compare, hash } from 'bcryptjs';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
});

const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().default('Nigeria'),
  type: z.enum(['BILLING', 'SHIPPING']).default('BILLING'),
  isDefault: z.boolean().default(false),
});

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const notificationPrefsSchema = z.object({
  emailNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  quoteUpdates: z.boolean(),
  productAlerts: z.boolean(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getCurrentUserId(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return parseInt(session.user.id);
}

async function trackActivity(
  userId: number,
  eventType: string,
  metadata?: Record<string, unknown>
) {
  await prisma.analytics_events.create({
    data: {
      userId,
      eventType,
      eventData: metadata ? JSON.parse(JSON.stringify(metadata)) : {},
    },
  });
}

// ============================================================================
// PROFILE ACTIONS
// ============================================================================

/**
 * Get full user profile with address and company
 */
export async function getUserProfile() {
  const userId = await getCurrentUserId();

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: {
      companies: true,
      addresses: {
        orderBy: { isDefault: 'desc' },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    isActive: user.isActive,
    emailVerified: !!user.emailVerified,
    createdAt: user.createdAt,
    company: user.companies ? {
      id: user.companies.id,
      name: user.companies.name,
      industry: user.companies.industry || '',
      website: user.companies.website || '',
      isVerified: user.companies.isVerified,
    } : null,
    addresses: user.addresses.map(addr => ({
      id: addr.id,
      type: addr.type,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault,
    })),
  };
}

/**
 * Update user profile (name, phone)
 */
export async function updateUserProfile(input: z.infer<typeof profileSchema>) {
  const userId = await getCurrentUserId();
  const data = profileSchema.parse(input);

  const user = await prisma.users.update({
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

  invalidateDashboardCache(`user:dashboard:${userId}`);
  revalidatePath('/account');
  revalidatePath('/account/settings');
  
  return { success: true, user };
}

// ============================================================================
// ADDRESS ACTIONS
// ============================================================================

/**
 * Create a new address
 */
export async function createAddress(input: z.infer<typeof addressSchema>) {
  const userId = await getCurrentUserId();
  const data = addressSchema.parse(input);

  // If setting as default, unset other defaults of same type
  if (data.isDefault) {
    await prisma.addresses.updateMany({
      where: { userId, type: data.type },
      data: { isDefault: false },
    });
  }

  const address = await prisma.addresses.create({
    data: {
      street: data.street,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
      type: data.type,
      isDefault: data.isDefault,
      users: { connect: { id: userId } },
      updatedAt: new Date(),
    },
  });

  await trackActivity(userId, 'address_created', {
    addressId: address.id,
    type: data.type,
  });

  invalidateDashboardCache(`user:dashboard:${userId}`);
  revalidatePath('/account/settings');
  
  return { success: true, address };
}

/**
 * Update an existing address
 */
export async function updateAddress(
  addressId: number,
  input: z.infer<typeof addressSchema>
) {
  const userId = await getCurrentUserId();
  const data = addressSchema.parse(input);

  // Verify ownership
  const existing = await prisma.addresses.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) {
    throw new Error('Address not found');
  }

  // If setting as default, unset other defaults of same type
  if (data.isDefault) {
    await prisma.addresses.updateMany({
      where: { userId, type: data.type, id: { not: addressId } },
      data: { isDefault: false },
    });
  }

  const address = await prisma.addresses.update({
    where: { id: addressId },
    data,
  });

  await trackActivity(userId, 'address_updated', { addressId });

  invalidateDashboardCache(`user:dashboard:${userId}`);
  revalidatePath('/account/settings');
  
  return { success: true, address };
}

/**
 * Delete an address
 */
export async function deleteAddress(addressId: number) {
  const userId = await getCurrentUserId();

  // Verify ownership
  const existing = await prisma.addresses.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) {
    throw new Error('Address not found');
  }

  await prisma.addresses.delete({ where: { id: addressId } });

  await trackActivity(userId, 'address_deleted', { addressId });

  invalidateDashboardCache(`user:dashboard:${userId}`);
  revalidatePath('/account/settings');
  
  return { success: true };
}

/**
 * Set an address as default
 */
export async function setDefaultAddress(addressId: number) {
  const userId = await getCurrentUserId();

  // Verify ownership and get type
  const address = await prisma.addresses.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) {
    throw new Error('Address not found');
  }

  // Unset other defaults of same type
  await prisma.addresses.updateMany({
    where: { userId, type: address.type },
    data: { isDefault: false },
  });

  // Set this one as default
  await prisma.addresses.update({
    where: { id: addressId },
    data: { isDefault: true },
  });

  await trackActivity(userId, 'address_updated', { 
    addressId, 
    action: 'set_default' 
  });

  invalidateDashboardCache(`user:dashboard:${userId}`);
  revalidatePath('/account/settings');
  
  return { success: true };
}

// ============================================================================
// COMPANY ACTIONS
// ============================================================================

/**
 * Update or create company information
 */
export async function updateCompany(input: z.infer<typeof companySchema>) {
  const userId = await getCurrentUserId();
  const data = companySchema.parse(input);

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { companyId: true },
  });

  let company;
  if (user?.companyId) {
    // Update existing company
    company = await prisma.companies.update({
      where: { id: user.companyId },
      data: {
        name: data.name,
        industry: data.industry || null,
        website: data.website || null,
      },
    });
  } else {
    // Create new company and link to user
    company = await prisma.companies.create({
      data: {
        name: data.name,
        industry: data.industry || null,
        website: data.website || null,
        users: { connect: { id: userId } },
        // Prisma types require updatedAt on create in this schema; set to now
        updatedAt: new Date(),
      },
    });
  }

  await trackActivity(userId, 'company_updated', {
    companyId: company.id,
  });

  invalidateDashboardCache(`user:dashboard:${userId}`);
  revalidatePath('/account/settings');
  
  return { success: true, company };
}

// ============================================================================
// SECURITY ACTIONS
// ============================================================================

/**
 * Change user password
 */
export async function changePassword(input: z.infer<typeof passwordSchema>) {
  const userId = await getCurrentUserId();
  const data = passwordSchema.parse(input);

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isValid = await compare(data.currentPassword, user.password);
  if (!isValid) {
    return { success: false, error: 'Current password is incorrect' };
  }

  // Hash and update new password
  const password = await hash(data.newPassword, 12);
  await prisma.users.update({
    where: { id: userId },
    data: { password: password },
  });

  await trackActivity(userId, 'password_changed', {
    timestamp: new Date()
  });

  revalidatePath('/account/settings');
  
  return { success: true };
}

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

/**
 * Get notification preferences for current user
 */
export async function getNotificationPreferences() {
  const userId = await getCurrentUserId();

  const prefs = await prisma.notification_preferences.findUnique({
    where: { userId },
  });

  // Return defaults if no preferences exist
  return prefs || {
    emailNotifications: true,
    marketingEmails: false,
    quoteUpdates: true,
    productAlerts: false,
  };
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  input: z.infer<typeof notificationPrefsSchema>
) {
  const userId = await getCurrentUserId();
  const data = notificationPrefsSchema.parse(input);

  // Upsert - create if doesn't exist, update if it does
  const prefs = await prisma.notification_preferences.upsert({
    where: { userId },
    update: {
      emailNotifications: data.emailNotifications,
      marketingEmails: data.marketingEmails,
      quoteUpdates: data.quoteUpdates,
      productAlerts: data.productAlerts,
      updatedAt: new Date(),
    },
    create: {
      users: { connect: { id: userId } },
      emailNotifications: data.emailNotifications,
      marketingEmails: data.marketingEmails,
      quoteUpdates: data.quoteUpdates,
      productAlerts: data.productAlerts,
      updatedAt: new Date(),
    },
  });

  await trackActivity(userId, 'notification_preferences_updated', {
    preferences: data,
  });

  revalidatePath('/account/settings');
  
  return { success: true, preferences: prefs };
}
