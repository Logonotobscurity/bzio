# 🚀 Admin Authentication - Quick Reference

## 5-Minute Setup

### Terminal 1: Dev Server
```bash
npm run dev
# Wait for: "ready - started server on 0.0.0.0:3000"
```

### Terminal 2: Create Admin
```bash
node scripts/setup-admin-via-api.mjs
```

**Output:**
```
✅ ADMIN SETUP COMPLETE

📧 Email:    bola@bzion.shop
🔐 Password: BzionAdmin@2024!Secure
```

### Terminal 3: Test Login
```bash
# Open browser
# Navigate to: http://localhost:3000/admin/login
# Enter credentials above
# Should redirect to: http://localhost:3000/admin
```

---

## Key Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `node scripts/setup-admin-via-api.mjs` | Create admin user |
| `npm run build` | Build for production |
| `npm test` | Run tests |

---

## Role Constants

```typescript
// src/lib/auth-constants.ts
export const USER_ROLES = {
  ADMIN: 'admin',      // ← lowercase (CRITICAL!)
  USER: 'customer',    // ← lowercase (CRITICAL!)
};
```

**⚠️ IMPORTANT:** Always use lowercase. Wrong case breaks routing.

---

## Routing Rules

| Route | Admin? | Customer? |
|-------|--------|-----------|
| `/admin/login` | ✅ | ❌ |
| `/admin` | ✅ | → redirect |
| `/login` | → redirect | ✅ |
| `/account` | → redirect | ✅ |

**Redirect Logic:**
- Admin at `/login` → goes to `/admin`
- Admin at `/account` → goes to `/admin`
- Customer at `/admin` → goes to `/login`

---

## Environment Variables

```bash
# Required in .env
DATABASE_URL="postgres://..."                   # Database URL
ADMIN_SETUP_TOKEN="bzion-admin-setup-..."       # Setup security token
NEXTAUTH_SECRET="your-secret-here"              # NextAuth security
NEXTAUTH_URL="http://localhost:3000"            # App URL

# Email (usually already set)
EMAIL_SERVER_HOST="smtp.resend.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="resend"
EMAIL_SERVER_PASSWORD="..."
EMAIL_FROM="BZION <noreply@bzion.shop>"
```

---

## Common Tasks

### Create Admin User
```bash
node scripts/setup-admin-via-api.mjs
```

### Test Admin Login
```
URL: http://localhost:3000/admin/login
Email: bola@bzion.shop
Password: BzionAdmin@2024!Secure
Result: Should go to /admin
```

### Test Customer Login
1. Create customer (via signup or DB)
2. Go to http://localhost:3000/login
3. Enter customer credentials
4. Should go to /account

### Check Session in Browser
1. Open DevTools
2. Go to Application → Cookies
3. Find and click `sessionToken`
4. Should show `role: "admin"` or `role: "customer"`

### Create New Admin (Replace Old)
```bash
# Deletes old admin and creates new one
node scripts/setup-admin-via-api.mjs
```

---

## File Locations

| What | File | Key Function |
|------|------|--------------|
| Role constants | `src/lib/auth-constants.ts` | `USER_ROLES` object |
| Admin login | `src/app/admin/login/admin-login-content.tsx` | Strict routing |
| Customer login | `src/app/login/login-content.tsx` | Auto-redirect admins |
| Setup API | `src/app/api/admin/setup/route.ts` | Create admin |
| Setup script | `scripts/setup-admin-via-api.mjs` | Run locally |
| Middleware | `src/middleware.ts` | Role-based routing |
| NextAuth config | `src/app/api/auth/[...nextauth]/route.ts` | Session callbacks |

---

## Troubleshooting 60-Seconds

| Problem | Solution |
|---------|----------|
| Setup script fails | `npm run dev` first, then run script |
| Wrong credentials | Run setup again, use new credentials |
| Admin bounces to home | Clear cache, restart browser, try again |
| Can't login | Check DATABASE_URL in .env |
| Wrong redirect | Check role in session (DevTools) |
| "Not authorized" | Check ADMIN_SETUP_TOKEN in .env |

---

## Role Check Patterns

### NextAuth Session (Client)
```typescript
const { data: session } = useSession();
if (session?.user?.role === 'admin') {
  // Admin logic
}
```

### Middleware (Server)
```typescript
if (request.auth?.token?.role !== 'admin') {
  // Redirect or deny
}
```

### API Endpoint (Server)
```typescript
const session = await getServerSession(authOptions);
if (session?.user?.role !== 'admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

### Component (Client)
```typescript
export default function AdminPage() {
  const { data: session } = useSession();
  
  useEffect(() => {
    if (session?.user?.role !== 'admin') {
      router.push('/login');
    }
  }, [session]);
  
  return <AdminDashboard />;
}
```

---

## API Endpoints

### Create Admin (POST)
```bash
curl -X POST http://localhost:3000/api/admin/setup \
  -H "Authorization: Bearer bzion-admin-setup-key-2024-secure" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bola@bzion.shop",
    "password": "BzionAdmin@2024!Secure",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

### Response
```json
{
  "success": true,
  "data": {
    "email": "bola@bzion.shop",
    "password": "BzionAdmin@2024!Secure",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }
}
```

---

## Before Committing Code

✅ Check:
- [ ] No uppercase role values (use lowercase 'admin'/'customer')
- [ ] All role checks use `session?.user?.role`
- [ ] Admin routes redirect non-admins
- [ ] Customer routes redirect admins
- [ ] No sensitive data in logs
- [ ] ADMIN_SETUP_TOKEN not in code (only .env)

---

## Before Deploying

✅ Verify:
- [ ] DATABASE_URL set in production
- [ ] ADMIN_SETUP_TOKEN set in production
- [ ] NEXTAUTH_URL set to production domain
- [ ] Dev server builds without errors: `npm run build`
- [ ] Local testing passes completely
- [ ] All environment variables ready

---

## Quick Links

| Document | Purpose |
|----------|---------|
| `ADMIN_SETUP_FINAL.md` | Complete setup guide |
| `ADMIN_AUTHENTICATION_COMPLETE.md` | Full technical overview |
| `ADMIN_DEPLOYMENT_CHECKLIST.md` | Production deployment |
| This file | Quick reference |

---

## Still Stuck?

1. Check the logs: `npm run dev` output
2. Check browser DevTools: Console and Network tabs
3. Check ADMIN_SETUP_FINAL.md: Troubleshooting section
4. Check .env: All required variables set
5. Check database: Admin user exists with correct role

---

**Last Updated:** 2024  
**Status:** ✅ READY TO USE
