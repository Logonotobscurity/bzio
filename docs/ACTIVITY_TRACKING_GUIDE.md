/**
 * Activity Tracking Integration Guide
 * 
 * This guide explains how to integrate activity tracking throughout the application.
 * 
 * ============================================================================
 * SETUP
 * ============================================================================
 * 
 * The UserActivity model and API endpoints are now available:
 * - Database Model: UserActivity (prisma/schema.prisma)
 * - API Endpoint: POST /api/user/activities
 * - Service: logActivity() in src/lib/activity-service.ts
 * 
 * ============================================================================
 * USAGE EXAMPLES
 * ============================================================================
 * 
 * 1. PRODUCT VIEWS
 *    Location: src/components/product-card.tsx or product detail pages
 *    
 *    ```typescript
 *    import { logActivity } from '@/lib/activity-service';
 *    
 *    const handleProductView = async (productId: number, productName: string) => {
 *      await logActivity(
 *        userId,
 *        'view',
 *        `Viewed product: ${productName}`,
 *        `Viewed: ${productName}`,
 *        String(productId),
 *        'Product',
 *        { productId, productName }
 *      );
 *    };
 *    ```
 * 
 * 2. CART OPERATIONS
 *    Location: src/components/add-to-quote-button.tsx or cart operations
 *    
 *    ```typescript
 *    // When adding to cart
 *    await logActivity(
 *      userId,
 *      'cart_add',
 *      `Added product to cart`,
 *      `Added: ${productName}`,
 *      cartItemId,
 *      'CartItem',
 *      { productId, quantity, price }
 *    );
 *    
 *    // When removing from cart
 *    await logActivity(
 *      userId,
 *      'cart_remove',
 *      `Removed product from cart`,
 *      `Removed: ${productName}`,
 *      cartItemId,
 *      'CartItem',
 *      { productId, quantity }
 *    );
 *    ```
 * 
 * 3. QUOTE OPERATIONS
 *    Location: API routes handling quote creation/updates
 *    
 *    ```typescript
 *    // When creating a quote
 *    await logActivity(
 *      userId,
 *      'quote_create',
 *      `Created quote`,
 *      `Created quote #${reference}`,
 *      quoteId,
 *      'Quote',
 *      { reference, itemCount, total }
 *    );
 *    
 *    // When submitting a quote
 *    await logActivity(
 *      userId,
 *      'quote_submitted',
 *      `Submitted quote for negotiation`,
 *      `Submitted quote #${reference}`,
 *      quoteId,
 *      'Quote',
 *      { reference, total }
 *    );
 *    ```
 * 
 * 4. SEARCH
 *    Location: src/components/search-bar.tsx
 *    
 *    ```typescript
 *    await logActivity(
 *      userId,
 *      'search',
 *      `Searched for products`,
 *      `Searched: "${query}"`,
 *      null,
 *      null,
 *      { query, resultsCount }
 *    );
 *    ```
 * 
 * 5. PROFILE UPDATES
 *    Location: src/app/api/user/profile/route.ts
 *    
 *    ```typescript
 *    await logActivity(
 *      userId,
 *      'profile_update',
 *      `Updated profile information`,
 *      `Updated account details`,
 *      null,
 *      null,
 *      { updatedFields: Object.keys(body) }
 *    );
 *    ```
 * 
 * ============================================================================
 * ACTIVITY TYPES
 * ============================================================================
 * 
 * - view: User viewed a product or page
 * - cart_add: User added item to cart
 * - cart_remove: User removed item from cart
 * - quote_create: User created a new quote
 * - quote_update: User updated a quote
 * - quote_submitted: User submitted quote for negotiation
 * - search: User performed a search
 * - purchase: User made a purchase
 * - order_placement: User placed an order
 * - profile_update: User updated their profile
 * 
 * ============================================================================
 * DATABASE MIGRATION
 * ============================================================================
 * 
 * After updating schema.prisma, run:
 * 
 *   npx prisma migrate dev --name add_user_activity
 * 
 * This will:
 * 1. Create the user_activities table
 * 2. Update the database schema
 * 3. Generate updated Prisma client
 * 
 * ============================================================================
 * VIEWING ACTIVITIES
 * ============================================================================
 * 
 * Activities are automatically displayed in the "Recent Activity" section
 * of the user dashboard at: /dashboard
 * 
 * API Endpoint to fetch activities:
 *   GET /api/user/activities?limit=20&offset=0
 * 
 * Response format:
 * {
 *   "activities": [
 *     {
 *       "id": "uuid",
 *       "activityType": "view",
 *       "title": "Viewed: Product Name",
 *       "description": "Viewed product: Product Name",
 *       "referenceId": "123",
 *       "referenceType": "Product",
 *       "metadata": { "productId": 123, "productName": "..." },
 *       "createdAt": "2024-01-09T10:30:00Z"
 *     }
 *   ],
 *   "pagination": {
 *     "total": 50,
 *     "limit": 20,
 *     "offset": 0,
 *     "hasMore": true
 *   }
 * }
 * 
 * ============================================================================
 * IMPLEMENTATION CHECKLIST
 * ============================================================================
 * 
 * [ ] Run database migration
 * [ ] Integrate activity logging in product-card.tsx (view)
 * [ ] Integrate activity logging in cart operations (cart_add, cart_remove)
 * [ ] Integrate activity logging in quote creation API (quote_create, quote_submitted)
 * [ ] Integrate activity logging in search (search)
 * [ ] Integrate activity logging in profile updates (profile_update)
 * [ ] Test activity display in dashboard
 * [ ] Test activity filtering by type
 * 
 * ============================================================================
 */

export const ACTIVITY_TYPES = {
  VIEW: 'view',
  CART_ADD: 'cart_add',
  CART_REMOVE: 'cart_remove',
  QUOTE_CREATE: 'quote_create',
  QUOTE_UPDATE: 'quote_update',
  QUOTE_SUBMITTED: 'quote_submitted',
  SEARCH: 'search',
  PURCHASE: 'purchase',
  ORDER_PLACEMENT: 'order_placement',
  PROFILE_UPDATE: 'profile_update',
} as const;
