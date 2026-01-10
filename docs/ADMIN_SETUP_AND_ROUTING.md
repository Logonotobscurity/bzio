# 🔐 Admin User Setup & Routing Guide

This guide explains how to set up admin users and ensure strict routing to the admin dashboard.

## 📋 Overview

The admin system has been completely refactored to ensure:
- ✅ Admin users created fresh (old admin deleted)
- ✅ Strict routing to `/admin` dashboard only
- ✅ Role-based access control (RBAC)
- ✅ No bouncing to landing page or customer dashboard

## 🚀 Quick Start

### Option 1: CLI Setup Script (Recommended)

```bash
# Delete existing admin and create fresh admin user
npx tsx scripts/setup-admin.ts
```

**Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ADMIN SETUP COMPLETE

📧 Admin Email:    bola@bzion.shop
🔐 Admin Password: BzionAdmin@2024!Secure

⚠️  LOGIN INSTRUCTIONS:
   1. Go to http://localhost:3000/admin/login
   2. Enter email: bola@bzion.shop
   3. Enter password: BzionAdmin@2024!Secure
   4. Click "Login"
   5. You will be redirected to /admin dashboard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Option 2: API Setup Endpoint

```bash
# Set environment variable first
export ADMIN_SETUP_TOKEN="your-secure-setup-token"

# Create/replace admin user
curl -X POST http://localhost:3000/api/admin/setup \
  -H "Authorization: Bearer your-secure-setup-token" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bola@bzion.shop",
    "password": "BzionAdmin@2024!Secure",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "admin": {
    "id": "user_123",
    "email": "bola@bzion.shop",
    "firstName": "Admin",
    "role": "admin"
  },
  "credentials": {
    "email": "bola@bzion.shop",
    "password": "BzionAdmin@2024!Secure",
    "loginUrl": "/admin/login"
  },
  "instructions": [
    "Go to /admin/login",
    "Enter the email and password provided above",
    "Click \"Login\"",
    "You will be redirected to /admin dashboard"
  ]
}
```

## 🔄 Routing Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   ADMIN LOGIN FLOW                       │
└─────────────────────────────────────────────────────────┘

1️⃣  UNAUTHENTICATED USER
    └─ Visit /admin/login
    └─ Enter credentials (email, password)
    └─ Click "Login"
    ↓
    System validates credentials ✓
    System verifies role = 'admin' ✓
    ↓
    🎯 REDIRECT TO: /admin (dashboard)
    ✅ SUCCESS - Admin dashboard loads

2️⃣  ALREADY AUTHENTICATED ADMIN
    └─ Land on /admin/login
    └─ Session detected (role = 'admin')
    ↓
    🎯 IMMEDIATE REDIRECT TO: /admin
    ✅ SUCCESS - Skip login, go straight to dashboard

3️⃣  CUSTOMER ACCOUNT ON /admin/login
    └─ Land on /admin/login
    └─ Try to login with customer account
    └─ Session created ✓
    └─ Check role... role = 'customer' ❌
    ↓
    ❌ REJECT - Show error
    "Your account does not have administrator privileges"
    └─ Password cleared for security
    └─ Stay on login page
    └─ Show link to customer login

4️⃣  ADMIN ACCESSING /account (CUSTOMER PAGE)
    └─ Admin tries to access /account
    └─ useEffect detects role = 'admin'
    ↓
    🎯 REDIRECT TO: /admin
    ✅ SUCCESS - Prevented customer page access

5️⃣  ADMIN HEADER BUTTON CLICK
    └─ Header "Welcome back: [Name]" button clicked
    └─ getUserDashboardPath('admin') returns '/admin'
    └─ router.push('/admin')
    ↓
    🎯 NAVIGATE TO: /admin
    ✅ SUCCESS - Consistent routing
```

## 📁 Key Files & Changes

### Setup Script
- **File:** `scripts/setup-admin.ts`
- **Purpose:** CLI tool to delete existing admin and create fresh one
- **Usage:** `npx tsx scripts/setup-admin.ts`

### Admin Setup API
- **File:** `src/app/api/admin/setup/route.ts`
- **Method:** `POST /api/admin/setup`
- **Purpose:** Programmatic admin creation (requires `ADMIN_SETUP_TOKEN`)
- **Features:**
  - Deletes existing admin with email
  - Creates fresh admin user
  - Returns credentials only on creation
  - Requires environment variable for security

### Admin Login Component
- **File:** `src/app/admin/login/admin-login-content.tsx`
- **Changes:**
  - Added strict routing to `/admin` only (no home/landing redirects)
  - Verify role BEFORE routing
  - Enhanced logging for debugging
  - Shows loading states during verification
  - Prevents customer account access

### Account Page Protection
- **File:** `src/app/account/page.tsx`
- **Changes:**
  - Added useEffect to detect admin users
  - Auto-redirect admins to `/admin` if they access `/account`
  - Prevents admins from viewing customer dashboard

### Customer Login Fix
- **File:** `src/app/login/login-content.tsx`
- **Changes:**
  - Auto-redirect admins to `/admin` dashboard (not showing error)
  - Faster UX for admins on customer login

## 🔐 Security Features

### Setup Token Authentication
- `ADMIN_SETUP_TOKEN` required in environment
- Token checked on every `/api/admin/setup` request
- Prevents unauthorized admin creation

### Role-Based Access Control
- Database role: `'admin'` or `'customer'` (lowercase)
- JWT token includes role
- Session callback verifies role
- All API routes check role before access

### Password Security
- Bcrypt hashing (10 rounds)
- Password never logged
- Password only returned on creation
- Cleared from login form on failed attempt

### Routing Protection
- Middleware blocks unauthenticated access to /admin
- useEffect redirects admins from /account
- Strict routing prevents redirect loops
- router.replace() prevents history issues

## 📊 Database Schema

```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  hashedPassword  String
  firstName       String
  lastName        String?
  role            String   @default("customer")  // 'admin' or 'customer'
  emailVerified   DateTime?
  lastLogin       DateTime?
  isNewUser       Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## 🧪 Testing Checklist

- [ ] Run `npx tsx scripts/setup-admin.ts`
- [ ] Login at `/admin/login` with new credentials
- [ ] Verify redirected to `/admin` dashboard
- [ ] Click header "Welcome back" button
- [ ] Verify stays on `/admin` (doesn't bounce)
- [ ] Create customer account and login
- [ ] Verify customer redirected to `/account`
- [ ] Customer clicks header button
- [ ] Verify navigates to `/account` (not `/admin`)
- [ ] Try accessing `/admin` as customer
- [ ] Verify middleware redirects to `/account`
- [ ] Try accessing `/account` as admin
- [ ] Verify redirected to `/admin`

## 🔗 Environment Variables

```bash
# Required for API setup endpoint
ADMIN_SETUP_TOKEN="your-secure-token-here"

# NextAuth configuration
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Database
DATABASE_URL="postgresql://..."
```

## 📝 Admin Routes

| Route | Protected | Role Required | Purpose |
|-------|-----------|---------------|---------|
| `/admin/login` | No | None | Admin login page |
| `/admin` | Yes | admin | Admin dashboard |
| `/admin/products` | Yes | admin | Product management |
| `/admin/customers` | Yes | admin | Customer management |
| `/api/admin/*` | Yes | admin | Admin API endpoints |

## ❓ Troubleshooting

### Admin bounces back to landing page
**Solution:** Check that role in database is lowercase `'admin'`, not `'ADMIN'`

### Can't access admin dashboard
**Solution:** Verify role = 'admin' in database: 
```sql
SELECT id, email, role FROM "User" WHERE role = 'admin';
```

### Admin/Customer redirects not working
**Solution:** Clear browser cookies and try fresh login

### API setup token not working
**Solution:** Verify `ADMIN_SETUP_TOKEN` environment variable is set:
```bash
echo $ADMIN_SETUP_TOKEN
```

## 📞 Support

For issues or questions about admin setup and routing, refer to:
- `AUTHENTICATION_FLOW_COMPLETE.md` - Complete auth flow guide
- `auth.ts` - NextAuth configuration
- `middleware.ts` - Route protection middleware
- `src/lib/auth-constants.ts` - Role constants and paths
