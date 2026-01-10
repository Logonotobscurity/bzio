# User Dashboard Cart & Profile Management Implementation

## Summary
Successfully implemented comprehensive user cart, profile management, and address management features. Admin users can now view and manage all customer data including quotes, carts, and addresses.

## Features Implemented

### 1. Database Schema Updates (`prisma/schema.prisma`)
- **Extended User Model** with business information fields:
  - `companyPhone`: Company phone number
  - `businessType`: Type of business (retailer, wholesaler, distributor, etc.)
  - `businessRegistration`: Business registration/license number
  
- **New Cart Model**: Manages shopping carts for users
  - `id`: Unique cart identifier
  - `userId`: Reference to user
  - `status`: Cart status (active, converted_to_quote, abandoned)
  - `items`: Relationship to CartItem
  
- **New CartItem Model**: Individual items in a cart
  - `id`: Unique item identifier
  - `cartId`: Reference to cart
  - `productId`: Reference to product
  - `userId`: Reference to user
  - `quantity`: Item quantity
  - `unitPrice`: Custom unit price (if different from product price)
  - Includes relationships to Cart, User, and Product

- **Enhanced Address Model**: Already present, used for delivery addresses
  - Supports shipping and billing addresses
  - Default address marking
  - Contact person and phone for delivery

### 2. API Endpoints

#### User Profile Management
- **GET `/api/user/profile`**: Fetch user profile with personal and business info
- **PUT `/api/user/profile`**: Update user profile information

#### Address Management
- **GET `/api/user/addresses`**: Fetch all user addresses
- **POST `/api/user/addresses`**: Add a new address
- **PUT `/api/user/addresses/[id]`**: Update an existing address
- **DELETE `/api/user/addresses/[id]`**: Delete an address

#### Shopping Cart Management
- **GET `/api/user/cart`**: Get user's cart history
- **GET `/api/user/cart/items`**: Get active cart with all items
- **POST `/api/user/cart/items`**: Add product to cart
- **PUT `/api/user/cart/items/[id]`**: Update cart item quantity or price
- **DELETE `/api/user/cart/items/[id]`**: Remove item from cart

#### Admin Customer Management
- **GET `/api/admin/customers`**: List all customers with pagination and search
- **GET `/api/admin/customers/[id]`**: Get detailed customer information
- **GET `/api/admin/customers/[id]/quotes`**: Get customer's quotes with pagination

### 3. Frontend Components

#### ProfileEditComponent (`src/components/profile-edit-component.tsx`)
- **Two-tab interface**:
  - **Profile Tab**: Edit personal and business information
    - First name, last name, email (read-only), phone
    - Company name, company phone
    - Business type and business registration number
  - **Addresses Tab**: Manage delivery and billing addresses
    - Add new addresses
    - Edit existing addresses
    - Delete addresses
    - Mark default address
    - Support for multiple address types (shipping, billing, other)
    - Contact person and phone for each address

#### CartDisplayComponent (`src/components/cart-display-component.tsx`)
- Display all items in user's active quote cart
- **Features**:
  - View product images, names, SKUs, and prices
  - Adjust quantity using +/- buttons or direct input
  - Remove items from cart
  - Real-time subtotal calculation
  - Cart summary with total
  - Proceed to checkout button
  - Empty state message

#### AdminCustomerDataComponent (`src/components/admin-customer-data-component.tsx`)
- **Admin-only interface** for viewing customer data
- **Three-tab interface**:
  - **Addresses Tab**: View all customer addresses with type and default status
  - **Cart Items Tab**: View items in customer carts with quantities and prices
  - **Quotes Tab**: View customer's quote history with status and totals
- **Features**:
  - Search customers by name, email, or company
  - Pagination support
  - Quick stats (total quotes, active carts, last login)
  - Detailed customer information cards
  - Member since date and last login tracking

### 4. Updated Pages

#### Account Page (`src/app/account/page.tsx`)
- Added tabbed interface with three sections:
  - **Overview**: Existing activity dashboard
  - **Profile & Addresses**: New ProfileEditComponent
  - **Quote Cart**: New CartDisplayComponent
- Maintains existing welcome alert and activity feed
- Seamless integration with existing UI

#### Admin Customers Page (`src/app/admin/customers/page.tsx`)
- Replaced static server-rendered page with client-side AdminCustomerDataComponent
- Enhanced UX with search, filtering, and detailed views
- Real-time data fetching and interaction

## Technical Details

### Authentication & Authorization
- All endpoints require user authentication via NextAuth
- Admin-only endpoints verify `session.user.role === 'admin'`
- User data is scoped to authenticated user (cannot access other users' data)

### Database Operations
- Uses Prisma ORM for all database queries
- Includes proper relationships and cascading deletes
- Optimized queries with selective field selection
- Pagination support for large datasets

### Error Handling
- Comprehensive try-catch blocks in all API routes
- User-friendly error messages via toast notifications
- Proper HTTP status codes (400, 401, 404, 500)
- Console logging for debugging

### UI/UX Features
- Loading states with skeleton screens
- Toast notifications for success/error messages
- Form validation before submission
- Responsive design for mobile and desktop
- Consistent styling with existing UI components

## Usage Examples

### Adding to Cart (Frontend)
```typescript
const response = await fetch('/api/user/cart/items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    productId: 123, 
    quantity: 5,
    unitPrice: 999.99 // optional
  })
});
```

### Viewing Customer Data (Admin)
```typescript
// Get all customers
const response = await fetch('/api/admin/customers?limit=10&offset=0&search=john');

// Get specific customer
const response = await fetch('/api/admin/customers/5');

// Get customer quotes
const response = await fetch('/api/admin/customers/5/quotes?limit=10');
```

### Managing Addresses (User)
```typescript
// Add address
const response = await fetch('/api/user/addresses', {
  method: 'POST',
  body: JSON.stringify({
    type: 'shipping',
    label: 'Office',
    addressLine1: '123 Main St',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    isDefault: true
  })
});
```

## Data Flow

1. **User Profile Update**:
   - User edits profile → API updates database → Toast notification
   - Address changes automatically saved to database
   - Admin can view all customer addresses

2. **Cart Management**:
   - User adds product → Stored in Cart/CartItem tables
   - Quantities and prices tracked per item
   - Admin can view cart contents for any customer

3. **Admin Viewing Customer Data**:
   - Admin searches for customer
   - Admin clicks "View Details"
   - System fetches customer info, addresses, cart items, and quotes
   - Admin sees comprehensive customer profile

## Next Steps (Optional Enhancements)

1. Cart persistence to database (instead of just localStorage)
2. Bulk quote creation from cart items
3. Address validation using postal code API
4. Email notifications when cart abandoned
5. Customer activity history
6. Address book templates
7. Export customer data to CSV/PDF
8. Advanced analytics for admin dashboard

## Migration Required

Run Prisma migration to update database schema:
```bash
npx prisma migrate dev --name add_cart_and_profile_fields
npx prisma generate
```

## Testing Checklist

- [ ] User can edit profile information
- [ ] User can add/edit/delete addresses
- [ ] User can set default address
- [ ] User can add products to cart
- [ ] User can update cart quantities
- [ ] User can remove items from cart
- [ ] Cart totals calculate correctly
- [ ] Admin can search for customers
- [ ] Admin can view customer details
- [ ] Admin can see customer addresses
- [ ] Admin can see customer cart items
- [ ] Admin can see customer quote history
- [ ] All API endpoints return proper errors for unauthorized access
- [ ] All forms validate input correctly
