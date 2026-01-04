/**
 * API Types
 * 
 * Request/Response DTOs and API-specific types
 * Used for API contracts, validation, and transformations
 */

// ===== API RESPONSES =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

// ===== PRODUCT APIs =====
export interface ProductDetailResponse {
  id: number;
  sku: string;
  name: string;
  slug: string;
  price?: number;
  description?: string;
  detailedDescription?: string;
  images: string[];
  brand: string;
  company: string;
  category: string;
  moq?: number;
  unit?: string;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  relatedProducts?: ProductListItem[];
  specifications?: Record<string, unknown>;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  imageUrl: string;
  price?: number;
  brand: string;
  category: string;
}

export interface SearchProductsRequest {
  query: string;
  filters?: {
    category?: string;
    brand?: string;
    company?: string;
    minPrice?: number;
    maxPrice?: number;
  };
  limit?: number;
  offset?: number;
}

// ===== QUOTE APIs =====
export interface CreateQuoteRequest {
  buyerContactEmail: string;
  buyerContactPhone?: string;
  buyerCompanyId?: string;
  lines: {
    productId?: string;
    productName: string;
    productSku?: string;
    qty: number;
    unitPrice?: number;
    description?: string;
  }[];
}

export interface QuoteResponse {
  id: string;
  reference: string;
  status: string;
  total?: number;
  lines: {
    productName: string;
    qty: number;
    unitPrice?: number;
    description?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// ===== USER APIs =====
export interface UserRegistrationRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  phone?: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserProfileResponse {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  phone?: string;
  emailVerified: boolean;
  isNewUser: boolean;
  lastLogin?: string;
}

// ===== FORM SUBMISSION APIs =====
export interface FormSubmissionRequest {
  formType: string;
  name?: string;
  email: string;
  phone?: string;
  message?: string;
  subject?: string;
  companyName?: string;
  [key: string]: unknown;
}

export interface NewsletterSubscribeRequest {
  email: string;
}

export interface ContactFormRequest {
  name: string;
  email: string;
  phone: string;
  message: string;
}

// ===== NOTIFICATION APIs =====
export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  type?: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

// ===== ERROR RESPONSES =====
export interface ErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// ===== ADMIN APIs =====
export interface AdminActivityResponse {
  id: string;
  type: string;
  actor: {
    id?: string;
    email: string;
    name?: string;
  };
  data: Record<string, unknown>;
  timestamp: string;
  status: string;
}

export interface AdminStatsResponse {
  totalUsers: number;
  newUsersThisWeek: number;
  totalQuotes: number;
  pendingQuotes: number;
  totalNewsletterSubscribers: number;
  totalFormSubmissions: number;
  totalCheckouts: number;
}

// ===== SESSION & AUTH =====
export interface SessionResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    isAdmin: boolean;
  };
  expires: string;
}
