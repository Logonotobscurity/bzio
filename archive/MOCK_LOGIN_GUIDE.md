# Mock Login & Profile System - Testing Guide

## Overview
A complete mock authentication system with persistent state management using Zustand has been implemented for testing and development purposes.

## Demo Credentials

You can use these credentials to test the login system:

### Account 1
- **Email:** `demo@bzion.com`
- **Password:** `demo123`
- **Name:** John Doe
- **Company:** ABC Trading Ltd
- **Phone:** +234 801 234 5678

### Account 2
- **Email:** `test@bzion.com`
- **Password:** `test123`
- **Name:** Jane Smith
- **Company:** XYZ Supply Co
- **Phone:** +234 702 987 6543

## Features Implemented

### 1. **Auth Store** (`src/lib/auth-store.ts`)
- Mock user database with 2 test accounts
- Login/logout functionality
- Persistent storage using localStorage
- Profile information management

### 2. **Activity Store** (`src/lib/activity-store.ts`)
- Track user platform activities
- 5 activity types:
  - Quote Request
  - Product View
  - Purchase
  - Profile Update
  - Search
- Mock activities pre-populated for testing
- Persistent storage

### 3. **Login Page** (`src/app/login/page.tsx`)
- Functional email/password form
- Demo credentials quick-fill buttons
- Error handling with toast notifications
- Responsive mobile design
- Loading states

### 4. **Profile/Account Page** (`src/app/account/page.tsx`)
- **Responsive Layout:**
  - 1 column on mobile
  - 3-column grid on desktop (sidebar + activities)
  
- **Sidebar Profile Card:**
  - User avatar with initials
  - Email, company, phone, join date
  - Edit profile button (disabled for mock)
  - Logout button
  
- **Activity Statistics:**
  - Total quote requests
  - Total products viewed
  - Total platform activities
  
- **Activity Feed:**
  - Displays last 20 activities
  - Color-coded by type
  - Icons for each activity type
  - Timestamps (relative time format)
  - Activity details (items, values, etc.)
  - Empty state message

## How to Test

### Step 1: Navigate to Login
```
http://localhost:3000/login
```

### Step 2: Choose One of These Options:

**Option A: Quick Fill Demo**
- Click on a demo account card (e.g., "John Doe")
- The form will auto-fill with credentials
- Click "Sign In"

**Option B: Manual Entry**
- Enter any demo email: `demo@bzion.com` or `test@bzion.com`
- Enter corresponding password: `demo123` or `test123`
- Click "Sign In"

**Option C: Invalid Credentials**
- Try any other email/password combination
- Should show error toast: "Invalid email or password"

### Step 3: View Profile
- You'll be redirected to `/account`
- See your profile information in the sidebar
- View all your activities in the feed
- Activities are sorted by most recent first

### Step 4: Test Logout
- Click the "Log Out" button in the profile sidebar
- You'll be redirected to home page
- Trying to visit `/account` again will redirect to login

## Data Persistence

All data is persisted to browser localStorage:
- **Auth state:** `auth-storage`
- **Activity data:** `activity-storage`

This means:
- Login state persists across page refreshes
- Activities persist across sessions
- Clearing browser storage will reset everything

## Responsive Behavior

### Mobile (< 768px)
- Single column layout
- Sidebar appears above activities
- Touch-friendly buttons and spacing
- Smaller text sizes
- Full-width cards

### Tablet (768px - 1024px)
- Still 1-2 column layout
- Better spacing

### Desktop (> 1024px)
- 3-column layout
- Sticky sidebar (stays visible while scrolling)
- Optimized spacing and typography

## Activity Types & Icons

| Type | Icon | Color | Typical Data |
|------|------|-------|-------------|
| Quote Request | File | Blue | Items, Value |
| Product View | Eye | Purple | Product ID |
| Purchase | Cart | Green | Order details |
| Profile Update | Edit | Orange | Update type |
| Search | Search | Yellow | Query, Results |

## Mock Activity Data

Pre-populated activities include:
- 7 sample activities from the past week
- Mix of all activity types
- Realistic descriptions
- Sample metrics (items count, values)

## Files Modified/Created

```
src/lib/
├── auth-store.ts (NEW)           # User authentication state
├── activity-store.ts (NEW)       # User activity tracking

src/app/
├── login/page.tsx (UPDATED)      # Login form with mock auth
├── account/page.tsx (UPDATED)    # Profile & activities page
```

## Testing Checklist

- [ ] Login with demo@bzion.com / demo123
- [ ] Login with test@bzion.com / test123
- [ ] Try invalid credentials (should show error)
- [ ] Verify profile shows correct user data
- [ ] Check all 7 activities display in feed
- [ ] Test activity filtering by type (via stats)
- [ ] Verify responsive layout on mobile
- [ ] Test logout functionality
- [ ] Refresh page and verify login persists
- [ ] Test on different screen sizes

## Future Enhancements

1. Connect to real backend API
2. Add password reset functionality
3. Add profile editing
4. Add activity filtering/search
5. Add activity export/download
6. Add more activity types
7. Add activity pagination
8. Add user preferences/settings
9. Add notification system
10. Add activity analytics

## Notes

- This is a mock system for development/testing only
- All credentials are hardcoded (not production-ready)
- Data is stored client-side in localStorage (not secure)
- For production, integrate with proper backend & authentication service
