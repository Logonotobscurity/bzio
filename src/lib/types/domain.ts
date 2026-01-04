/**
 * Domain Types
 * 
 * Core business domain types (Company, Product, Brand, Category, User, Quote, etc.)
 * These represent entities in the database and business logic.
 * Aligned with Prisma schema.
 */

// ===== PRODUCT CATALOG =====
export interface Company {
  id: number;
  name: string;
  slug: string;
  brandCount: number;
  productCount: number;
  categories: string[];
  description: string;
  logo?: string;
  isActive: boolean;
}

export type Brand = {
  id: string | number;
  name: string;
  slug: string;
  imageUrl: string | null;
  isFeatured: boolean;
  brand_description?: string;
  companyId?: number | null;
  productCount?: number;
  categoryCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  brandDescription?: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  productCount?: number;
  brandCount?: number;
};

export type Product = {
  id: number;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  brandId: number;
  company: string;
  companyId: number;
  category: string;
  categorySlug: string;
  description?: string;
  detailedDescription?: string;
  price?: number;
  moq?: number;
  unit?: string;
  inStock?: boolean;
  quantity?: number;
  images: string[];
  specifications?: {
    brand: string;
    company: string;
    unit: string;
    moq: number;
    sku: string;
    size?: string;
  };
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  imageUrl: string;
};

// ===== USER & AUTHENTICATION =====
export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  emailVerified?: boolean;
  lastLogin?: Date;
  isNewUser?: boolean;
  createdAt?: Date;
}

// ===== QUOTES & ORDERS =====
export interface Quote {
  id: string;
  reference: string;
  userId?: number;
  status: string;
  total?: number;
  createdAt: Date;
  updatedAt: Date;
  lines?: QuoteLine[];
}

export interface QuoteLine {
  id: string;
  quoteId: string;
  productId?: string;
  productName: string;
  productSku?: string;
  qty: number;
  unitPrice?: number;
  description?: string;
}

// ===== NOTIFICATIONS =====
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminNotification {
  id: string;
  adminId: number;
  title: string;
  message: string;
  type: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===== ANALYTICS & LOGGING =====
export interface ErrorLogReport {
  id?: string;
  message: string;
  stack?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
  url: string;
  userAgent: string;
  sessionId: string;
  userId?: string;
  component?: string;
  context?: Record<string, unknown>;
  environment?: string;
  version?: string;
  breadcrumbs?: unknown[];
  sourceMap?: unknown;
  [key: string]: any;
}

export interface AnalyticsEvent {
  id: string;
  eventType: string;
  userId?: number;
  data: Record<string, any>;
  timestamp: Date;
}

// ===== FORMS & SUBSCRIPTIONS =====
export interface FormSubmission {
  id: string;
  formType: string;
  email: string;
  data: Record<string, any>;
  status: string;
  submittedAt: Date;
  ipAddress?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: string;
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

// ===== BUSINESS CONCEPTS =====
export interface Address {
  id: number;
  userId: number;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface NegotiationMessage {
  id: string;
  quoteId: string;
  sender: string;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
