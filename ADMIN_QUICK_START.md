# 🚀 ADMIN SETUP QUICK REFERENCE

## One-Liner Admin Setup

```bash
npx tsx scripts/setup-admin.ts
```

That's it! This will:
1. ❌ Delete old admin user (if exists)
2. ✅ Create fresh admin user
3. 📧 Email: `bola@bzion.shop`
4. 🔐 Password: `BzionAdmin@2024!Secure`

## Login to Admin Dashboard

```
1. Go to: http://localhost:3000/admin/login
2. Email:    bola@bzion.shop
3. Password: BzionAdmin@2024!Secure
4. Click "Login"
5. 🎯 Redirected to /admin dashboard
```

## What Changed (for developers)

### New Files
| File | Purpose |
|------|---------|
| `scripts/setup-admin.ts` | Delete old + create new admin |
| `src/app/api/admin/setup/route.ts` | API version of setup |
| `ADMIN_SETUP_AND_ROUTING.md` | Full documentation |

### Updated Files
| File | Changes |
|------|---------|
| `admin-login-content.tsx` | Strict routing to /admin |
| `account/page.tsx` | Added admin redirect |
| `login/login-content.tsx` | Auto-redirect admins |

## Routing Guarantees

```
Admin logs in         → Routes to /admin ✓
Admin visits login    → Routes to /admin ✓
Admin accesses /account → Routes to /admin ✓
Customer logs in      → Routes to /account ✓
Customer accesses /admin → Routes to /account ✓
```

## Key Points

✅ Admin ALWAYS ends up on `/admin` dashboard  
✅ Old admin is deleted when creating new one  
✅ Role verified BEFORE any routing  
✅ No redirect loops or bouncing  
✅ Passwords hashed securely  
✅ API endpoint secured with token  

## Verify Setup

```bash
# Check admin exists in database
psql -c "SELECT email, role FROM \"User\" WHERE role='admin';"

# Should show: bola@bzion.shop | admin
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't login | Run setup script again |
| Wrong role | Ensure role is lowercase 'admin' in DB |
| Bouncing to landing page | Clear cookies, try fresh login |
| API endpoint not working | Check ADMIN_SETUP_TOKEN env var |

---

**Need more help?** See `ADMIN_SETUP_AND_ROUTING.md` for complete guide.
