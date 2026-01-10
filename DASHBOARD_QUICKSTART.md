# Quick Start Guide - Dashboard Restructuring

## What Changed?

Your user dashboard now has:
1. **Account Details** section with editable profile information
2. **Recent Activity** feed showing what users have been doing (viewing products, adding to cart, etc.)
3. Activity tracking automatically logs user actions

## Getting Started

### Step 1: Run Database Migration
```bash
npx prisma migrate dev --name add_user_activity
```

This creates the `user_activities` table and updates the database schema.

### Step 2: Test the Dashboard

1. Navigate to `/dashboard` after logging in
2. You should see:
   - **Account Details Card** at the top with your profile info and an "Edit Profile" button
   - **Recent Activity Section** below showing recent actions
   - Original stats and orders sections below

### Step 3: Test Account Details Editing

1. Click the **"Edit Profile"** button on the Account Details card
2. Update any fields (First Name, Last Name, Phone, Company, etc.)
3. Click **"Save Changes"**
4. Verify:
   - Profile updates successfully
   - An activity is logged in "Recent Activity" as "Updated account details"

### Step 4: Test Activity Tracking

Perform these actions and watch the Recent Activity section update:

1. **Add to Cart**: 
   - Go to any product
   - Click "Add to Cart" or "Add to Quote"
   - Watch for "Added: [Product Name] to cart" in Recent Activity

2. **Remove from Cart**:
   - View your cart
   - Remove an item
   - Watch for "Removed: [Product Name] from cart" in Recent Activity

## Current Activity Types

✅ **Already Tracking**:
- Profile updates
- Cart additions
- Cart removals

⏳ **Ready to Integrate** (guides in `docs/ACTIVITY_TRACKING_GUIDE.md`):
- Product views
- Search queries
- Quote creation/updates
- Order placement

## UI Overview

### Account Details Card
```
╔─────────────────────────────────────────────────────┐
║ Account Details                 [Edit Profile]      │
║ email@example.com                                   │
║                                                     │
║ Name: John Doe      │ Phone: +234...                │
║ Company: ABC Corp   │ Type: Retailer               │
└─────────────────────────────────────────────────────┘
```

### Recent Activity
```
╔─────────────────────────────────────────────────────┐
║ Recent Activity                                     │
║                                                     │
║ 👤 Updated account details              5m ago      │
║ 🛒 Added 5 × Product Name to cart       1h ago      │
║ 🛒 Removed Product Name from cart       2h ago      │
╚─────────────────────────────────────────────────────┘
```

## API Endpoints

All new endpoints are ready to use:

### Get Activities
```
GET /api/user/activities?limit=20&offset=0
GET /api/user/activities?type=cart_add  (filter by type)
```

### Create Activity (manual, usually automatic)
```
POST /api/user/activities
Content-Type: application/json

{
  "activityType": "quote_create",
  "title": "Created Quote",
  "description": "Created quote #QT-001",
  "referenceId": "123",
  "referenceType": "Quote",
  "metadata": { "total": 50000 }
}
```

## Next Actions

### For Developers:
1. Follow the integration guide in `docs/ACTIVITY_TRACKING_GUIDE.md`
2. Add activity tracking to other components (products, searches, orders)
3. Run tests to verify activities are being logged

### For Product Team:
1. Test the dashboard thoroughly
2. Verify all user actions are being captured
3. Check activity descriptions are user-friendly
4. Plan for activity export/analytics features

## Troubleshooting

### Activities not showing?
- Verify database migration ran: `npx prisma migrate dev`
- Check browser console for errors
- Verify user is authenticated

### Edit Profile not working?
- Check network tab for API errors
- Verify user has proper permissions
- Check for error messages in toast notifications

### Activities not being logged?
- Make sure you completed Step 1 (database migration)
- Check API response for the action that should log activity
- Look at server logs for any errors

## Files to Review

| File | Purpose |
|------|---------|
| `docs/ACTIVITY_TRACKING_GUIDE.md` | Full integration guide with examples |
| `IMPLEMENTATION_SUMMARY_DASHBOARD_RESTRUCTURE.md` | Technical details of all changes |
| `src/components/order-dashboard.tsx` | Main dashboard component |
| `src/components/recent-activity.tsx` | Activity feed component |
| `src/lib/activity-service.ts` | Activity service/helpers |

## Support

For questions or issues:
1. Check `docs/ACTIVITY_TRACKING_GUIDE.md` for implementation examples
2. Review `IMPLEMENTATION_SUMMARY_DASHBOARD_RESTRUCTURE.md` for technical details
3. Check server logs for any API errors
4. Verify database migration completed successfully

---

**Ready to go! Run the migration and test your dashboard.**
