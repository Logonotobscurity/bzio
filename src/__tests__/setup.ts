/**
 * Test Setup & Utilities
 * Global test helpers, mock factories, and common test utilities
 */

import { User, Product, Brand, Category, Quote, NewsletterSubscriber } from '@prisma/client';

/**
 * Mock Prisma Client Factory
 * Creates a fully mocked Prisma client for testing
 */
export const createMockPrismaClient = () => {
  return {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    brand: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    quote: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    newsletterSubscriber: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  };
};

/**
 * Mock Data Factories
 */

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  emailVerified: null,
  image: null,
  role: 'CUSTOMER',
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLogin: null,
  isActive: true,
  ...overrides,
});

export const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: '1',
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  unit: 'kg',
  quantity: 10,
  brandId: '1',
  categoryId: '1',
  image: 'https://example.com/image.jpg',
  isAvailable: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  moq: 1,
  discount: 0,
  ...overrides,
});

export const createMockBrand = (overrides: Partial<Brand> = {}): Brand => ({
  id: '1',
  name: 'Test Brand',
  description: null,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockCategory = (overrides: Partial<Category> = {}): Category => ({
  id: '1',
  name: 'Test Category',
  description: null,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockQuote = (overrides: any = {}) => ({
  id: '1',
  userId: '1',
  productId: '1',
  quantity: 5,
  unit: 'kg',
  totalPrice: 500,
  status: "PENDING",
  message: 'Test message',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockNewsletterSubscriber = (
  overrides: Partial<NewsletterSubscriber> = {}
): NewsletterSubscriber => ({
  id: '1',
  email: 'subscriber@example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
  ...overrides,
});

/**
 * Common Test Helpers
 */

export const mockFetch = (response: any) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
      blob: () => Promise.resolve(new Blob()),
    })
  ) as jest.Mock;
};

export const mockFetchError = (error: string) => {
  global.fetch = jest.fn(() => Promise.reject(new Error(error))) as jest.Mock;
};

export const mockLocalStorage = () => {
  const store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key]);
    },
  };
};

/**
 * Wait utilities for async tests
 */
export const waitFor = (callback: () => void, options = { timeout: 1000 }) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      try {
        callback();
        clearInterval(interval);
        resolve(true);
      } catch (error) {
        if (Date.now() - startTime > options.timeout) {
          clearInterval(interval);
          reject(error);
        }
      }
    }, 50);
  });
};

/**
 * Render utilities for component testing
 */
export const createMockSession = (overrides: any = {}) => ({
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'CUSTOMER',
    ...overrides,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});
