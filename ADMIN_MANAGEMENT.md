# Admin Management Setup

## Current Issue
- `bola@bzion.shop` has admin role (unauthorized)
- Only `admin@bzion.shop` should be able to create admins

## Solution Implemented

### 1. Database Changes
Run SQL script to fix admin roles:
```bash
# Connect to database and run:
scripts/manage-admins.sql
```

Or manually:
```sql
-- Remove admin from bola@bzion.shop
UPDATE users SET role = 'customer' WHERE email = 'bola@bzion.shop';

-- Ensure admin@bzion.shop is admin
UPDATE users SET role = 'admin' WHERE email = 'admin@bzion.shop';
```

### 2. API Endpoint Created
**POST /api/admin/users** - Create new admin user
- Only `admin@bzion.shop` can access
- Creates users with admin or customer role

**GET /api/admin/users** - List all users
- Any admin can access

### 3. Usage

#### Create New Admin User
```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION" \
  -d '{
    "email": "newadmin@bzion.shop",
    "firstName": "New",
    "lastName": "Admin",
    "role": "admin",
    "password": "SecurePassword123!"
  }'
```

#### List All Users
```bash
curl http://localhost:3000/api/admin/users \
  -H "Cookie: next-auth.session-token=YOUR_SESSION"
```

### 4. Security Rules
- Only `admin@bzion.shop` can create admin users
- All admins can view user list
- Password must be hashed with bcrypt
- Role must be 'admin' or 'customer'

### 5. Files Created
- `/src/app/api/admin/users/route.ts` - User management API
- `/scripts/manage-admins.sql` - SQL script to fix roles
- `/scripts/manage-admins.js` - Node script (requires DB connection)

### 6. Next Steps
1. Run SQL script to remove unauthorized admin
2. Login as admin@bzion.shop
3. Use API to create new admin users as needed
4. Update admin dashboard UI to include user management