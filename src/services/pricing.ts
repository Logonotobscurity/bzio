/**
 * Pricing Service
 * Centralized pricing calculation logic
 * Prevents duplication across components and services
 */

import { Product } from '@/lib/schema';

/**
 * Calculate price for a product with optional discount
 * @param product - The product to calculate price for
 * @param quantity - Quantity being purchased
 * @param discountPercent - Discount percentage (0-100)
 * @returns Calculated total price
 */
export async function calculatePrice(
  product: Product,
  quantity: number,
  discountPercent: number = 0
): Promise<number> {
  if (!product || quantity <= 0) {
    return 0;
  }

  const subtotal = product.price * quantity;
  const discountAmount = subtotal * (discountPercent / 100);
  return subtotal - discountAmount;
}

/**
 * Calculate bulk price across multiple products
 * @param items - Array of product items with prices and quantities
 * @param discountPercent - Discount percentage to apply to total
 * @returns Total bulk price
 */
export async function calculateBulkPrice(
  items: Array<{ price: number; quantity: number }>,
  discountPercent: number = 0
): Promise<number> {
  if (!items || items.length === 0) {
    return 0;
  }

  const subtotal = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  const discountAmount = subtotal * (discountPercent / 100);
  return subtotal - discountAmount;
}

/**
 * Format price for display
 * @param price - Price in base currency
 * @param currency - Currency code (default: USD)
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(price);
}

/**
 * Calculate per-unit price
 * @param totalPrice - Total price
 * @param quantity - Quantity
 * @returns Per-unit price
 */
export function calculatePerUnitPrice(totalPrice: number, quantity: number): number {
  if (quantity <= 0) return 0;
  return totalPrice / quantity;
}

/**
 * Check if product qualifies for bulk discount
 * @param quantity - Quantity being purchased
 * @param moq - Minimum order quantity for bulk discount
 * @returns True if qualifies for bulk discount
 */
export function qualifiesForBulkDiscount(quantity: number, moq: number): boolean {
  return quantity >= moq;
}

/**
 * Calculate savings from discount
 * @param originalPrice - Original price before discount
 * @param discountPercent - Discount percentage
 * @returns Amount saved
 */
export function calculateSavings(originalPrice: number, discountPercent: number): number {
  return originalPrice * (discountPercent / 100);
}
