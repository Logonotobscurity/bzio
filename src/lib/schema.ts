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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}