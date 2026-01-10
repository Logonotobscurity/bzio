# Dashboard Restructuring - Architecture & Flow Diagrams

## System Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                        USER DASHBOARD                           │
│  /dashboard - OrderDashboard Component                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Account Details Card                                     │   │
│  │ - Displays user profile info                            │   │
│  │ - "Edit Profile" button opens modal                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Recent Activity Component                                │   │
│  │ - Fetches from /api/user/activities                     │   │
│  │ - Displays activity timeline                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Stats Cards & Orders Table (Original)                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Edit Profile Modal Dialog                                │   │
│  │ - Opens on "Edit Profile" click                         │   │
│  │ - Sends PUT to /api/user/profile                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow - Profile Update Activity

```text
User Dashboard
       │
       ▼
Edit Profile Modal
       │
       ├─ User fills form
       │
       ▼
PUT /api/user/profile
       │
       ├─ Update user data in database
       │
       ├─ Call logActivity()
       │  │
       │  ▼
       │  Create UserActivity record
       │  - activityType: "profile_update"
       │  - description: "Updated account details"
       │  - metadata: [updated fields]
       │
       ├─ Return updated user
       │
       ▼
Dashboard Updates
       │
       ├─ Profile card refreshes
       │
       ├─ Recent Activity feed refreshes
       │  └─ Shows new "Updated account details" activity
       │
       ▼
Success Toast: "Profile updated successfully"
```

## Data Flow - Cart Activity

```text
┌─ ADD TO CART ─────────────────────────────────────┐
│                                                    │
│ User clicks "Add to Cart"                         │
│        │                                          │
│        ▼                                          │
│ POST /api/user/cart/items                        │
│ { productId, quantity }                          │
│        │                                          │
│        ├─ Create/update CartItem                │
│        │                                          │
│        ├─ Call logActivity()                    │
│        │  └─ Type: "cart_add"                   │
│        │     Desc: "Added X qty to cart"        │
│        │     Meta: {productId, name, qty, price}│
│        │                                          │
│        ▼                                          │
│ Success + Notification                          │
└────────────────────────────────────────────────────┘

┌─ REMOVE FROM CART ────────────────────────────────┐
│                                                    │
│ User clicks "Remove" on cart item                │
│        │                                          │
│        ▼                                          │
│ DELETE /api/user/cart/items/[id]                │
│        │                                          │
│        ├─ Delete CartItem                       │
│        │                                          │
│        ├─ Call logActivity()                    │
│        │  └─ Type: "cart_remove"                │
│        │     Desc: "Removed product from cart"  │
│        │     Meta: {productId, name, qty}       │
│        │                                          │
│        ▼                                          │
│ Success + Cart updates                          │
└────────────────────────────────────────────────────┘
```

## Activity Logging Service Flow

```text
┌────────────────────────────────────────────────────────┐
│           logActivity(userId, type, desc, ...)         │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Receives:                                             │
│ - userId (integer)                                    │
│ - activityType (string)                              │
│ - title (optional string)                            │
│ - description (string)                               │
│ - referenceId (optional string)                       │
│ - referenceType (optional string)                     │
│ - metadata (optional object)                         │
│                                                        │
│        ▼                                              │
│                                                        │
│ Create UserActivity in database:                     │
│ {                                                     │
│   id: UUID,                                          │
│   userId,                                            │
│   activityType,                                      │
│   title,                                             │
│   description,                                       │
│   referenceId,                                       │
│   referenceType,                                     │
│   metadata,                                          │
│   createdAt: now()                                   │
│ }                                                     │
│                                                        │
│        ▼                                              │
│                                                        │
│ Return (doesn't throw errors - non-blocking)        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Recent Activity Component Flow

```text
┌──────────────────────────────────────────────────────┐
│  Recent Activity Component Mounts                     │
└──────────────────────────────────────────────────────┘
            │
            ▼
    Get user session
            │
            ├─ No session?
            │  └─ Show login required
            │
            ▼
    SET loading = true
    FETCH /api/user/activities?limit=10
            │
            ▼
    Receive activities array
            │
            ├─ Empty array?
            │  └─ Show "No activities yet"
            │
            ▼
    SET activities = data
    SET loading = false
            │
            ▼
    Render activity list:
    ├─ For each activity:
    │  ├─ Get activity icon (by type)
    │  ├─ Format relative time
    │  ├─ Format description
    │  ├─ Display metadata
    │
    ▼
    USER SEES ACTIVITY TIMELINE
```

## Database Schema Relationships

```text
┌─────────────┐
│    User     │
├─────────────┤
│ id (PK)     │◄─────────────────────────┐
│ email       │                          │
│ firstName   │                          │
│ lastName    │                          │
│ phone       │    ┌──────────────────┐  │
│ ...         │    │ UserActivity     │  │
└─────────────┘    ├──────────────────┤  │
      ▲            │ id (PK)          │  │
      │            │ userId (FK) ──────┘
      │            │ activityType     │
      │            │ title            │
      │            │ description      │
      │            │ referenceId      │
      │            │ referenceType    │
      │            │ metadata         │
      │            │ createdAt        │
      │            └──────────────────┘
      │                    │
      └────────────────────┘
        One User to Many Activities
```

## Activity Types & Event Sources

```text
┌─────────────────────────────────────────────────────────┐
│                  ACTIVITY EVENT SOURCES                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Profile Updates                                        │
│ └─ PUT /api/user/profile                             │
│    └─ activity_type: profile_update                  │
│                                                         │
│ Cart Operations                                        │
│ ├─ POST /api/user/cart/items                         │
│ │  └─ activity_type: cart_add                        │
│ └─ DELETE /api/user/cart/items/[id]                 │
│    └─ activity_type: cart_remove                     │
│                                                         │
│ Ready to Add (See integration guide):                 │
│ ├─ Product Views (product-card.tsx)                  │
│ │  └─ activity_type: view                            │
│ ├─ Search (search-bar.tsx)                           │
│ │  └─ activity_type: search                          │
│ ├─ Quote Operations (quote APIs)                     │
│ │  ├─ activity_type: quote_create                    │
│ │  ├─ activity_type: quote_update                    │
│ │  └─ activity_type: quote_submitted                 │
│ ├─ Orders (order APIs)                               │
│ │  ├─ activity_type: purchase                        │
│ │  └─ activity_type: order_placement                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```


## API Endpoint Flows

### GET /api/user/activities

```json
Request:
  GET /api/user/activities?limit=20&offset=0&type=cart_add
  Authorization: Bearer token

Processing:
  1. Verify authentication
  2. Get userId from session
  3. Build query filter (if type provided)
  4. Count total activities
  5. Fetch paginated results
  6. Format response with pagination info

Response:
  {
    activities: [
      {
        id, activityType, title, description,
        referenceId, referenceType, metadata,
        createdAt
      },
      ...
    ],
    pagination: {
      total,
      limit,
      offset,
      hasMore
    }
  }

Errors:
  - 401: Not authenticated
  - 500: Server error
```

### POST /api/user/activities

```json
Request:
  POST /api/user/activities
  {
    activityType: "quote_create",
    title: "Created Quote",
    description: "Created quote #QT-001",
    referenceId: "123",
    referenceType: "Quote",
    metadata: { reference: "QT-001", total: 50000 }
  }

Processing:
  1. Verify authentication
  2. Get userId from session
  3. Validate required fields
  4. Create UserActivity record
  5. Return created activity

Response:
  {
    id: "uuid",
    userId: 123,
    activityType: "quote_create",
    title: "Created Quote",
    description: "Created quote #QT-001",
    referenceId: "123",
    referenceType: "Quote",
    metadata: { reference: "QT-001", total: 50000 },
    createdAt: "2024-01-09T10:30:00Z"
  }

Errors:
  - 400: Missing required fields
  - 401: Not authenticated
  - 500: Server error
```

## Component Hierarchy

```text
OrderDashboard (Main Dashboard)
├─ Account Details Card
│  ├─ User Profile Display
│  └─ Edit Profile Button
│     └─ Dialog (Edit Profile Modal)
│        ├─ Form Fields
│        └─ Save/Cancel Buttons
├─ RecentActivity Component
│  ├─ Activity Loader (if loading)
│  ├─ Empty State (if no activities)
│  └─ Activity List
│     ├─ Activity Item (repeating)
│     │  ├─ Icon
│     │  ├─ Title/Description
│     │  ├─ Timestamp
│     │  ├─ Badge
│     │  └─ Metadata (if present)
├─ Stats Cards (existing)
│  ├─ Total Orders Card
│  ├─ Pending Orders Card
│  ├─ Total Value Card
│  └─ Completion Rate Card
└─ Orders Table (existing)
   └─ Order Rows
```

---

## Key Points

✅ **Single Responsibility**: Each component has one job
✅ **Separation of Concerns**: UI, API, and service layers separated
✅ **Async & Non-Blocking**: Activity logging won't fail operations
✅ **Data Consistency**: All activities linked to authenticated users
✅ **Scalable**: Easy to add new activity types
✅ **Indexed**: Database queries optimized with proper indexes
✅ **Responsive**: Components work on mobile and desktop

