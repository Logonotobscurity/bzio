# User Dashboard Design Document

## Overview

This document defines the architecture for the authenticated user dashboard (`/account`) in the B2B platform. The dashboard provides users with a personalized view of their account status, quote requests, checkout activity, and recent platform interactions. It follows the same architectural patterns as the admin dashboard while being scoped to individual user data.

---

## Data Requirements

### TypeScript Interfaces

```typescript
// src/app/account/_types/dashboard.ts

/**
 * Complete dashboard data structure passed to the client component
 */
export interface UserDashboardData {
  user: UserAccountDetails;
  stats: UserStats;
  recentActivity: UserActivityItem[];
}

/**
 * User account details for the profile section
 */
export interface UserAccountDetails {
  id: string;
  name: string;                    // "mayowa"
  email: string;                   // "logonotobscurity@gmail.com"
  company: string | null;          // "lolo"
  role: 'CUSTOMER' | 'ADMIN';      // "customer"
  status: 'active' | 'inactive';   // "Active Now"
  lastLoginAt: Date | null;        // "4 days ago / Jan 9, 2026"
  emailVerified: boolean;
  createdAt: Date;
}

/**
 * Aggregated statistics for the dashboard cards
 */
export interface UserStats {
  quoteRequests: StatCard;
  checkouts: StatCard;
  totalActivity: StatCard;
}

/**
 * Individual stat card data
 */
export interface StatCard {
  label: string;                   // "Quote Requests"
  status: 'live' | 'active' | 'track'; // Status badge text
  total: number;                   // 0
  change: number;                  // +2
  changePeriod: string;            // "this month" | "this month" | "new today"
}

/**
 * Single activity item for the recent activity feed
 */
export interface UserActivityItem {
  id: string;
  type: ActivityType;
  description: string;             // "Requested quote QR-2026-001"
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Activity event types matching the tracking system
 */
export type ActivityType = 
  | 'quote_requested'
  | 'checkout_completed'
  | 'form_submitted'
  | 'product_viewed'
  | 'search_performed'
  | 'user_registered'
  | 'newsletter_signup';
```

### Prisma Query Functions

```typescript
// src/app/account/_actions/dashboard.ts

import { prisma } from '@/lib/prisma';
import { cachedQuery, CACHE_TTL } from '@/lib/cache';

/**
 * Fetch all dashboard data in a single optimized query batch
 */
export async function getUserDashboardData(userId: number): Promise<UserDashboardData> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    user,
    totalQuotes,
    quotesThisMonth,
    totalCheckouts,
    checkoutsThisMonth,
    totalEvents,
    eventsToday,
    recentEvents,
  ] = await Promise.all([
    // User profile
    prisma.user.findUnique({
      where: { id: userId },
      include: { company: { select: { name: true } } },
    }),
    
    // Quote stats
    prisma.quote.count({ where: { userId } }),
    prisma.quote.count({ 
      where: { userId, createdAt: { gte: startOfMonth } } 
    }),
    
    // Checkout stats (from AnalyticsEvent)
    prisma.analyticsEvent.count({ 
      where: { userId, eventType: 'checkout_completed' } 
    }),
    prisma.analyticsEvent.count({ 
      where: { 
        userId, 
        eventType: 'checkout_completed',
        createdAt: { gte: startOfMonth } 
      } 
    }),
    
    // Total activity stats
    prisma.analyticsEvent.count({ where: { userId } }),
    prisma.analyticsEvent.count({ 
      where: { userId, createdAt: { gte: startOfToday } } 
    }),
    
    // Recent activity (last 10 events)
    prisma.analyticsEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  if (!user) {
    throw new Error('User not found');
  }

  return {
    user: {
      id: user.id.toString(),
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0],
      email: user.email,
      company: user.company?.name || null,
      role: user.role as 'CUSTOMER' | 'ADMIN',
      status: user.isActive ? 'active' : 'inactive',
      lastLoginAt: user.lastLogin,
      emailVerified: !!user.emailVerified,
      createdAt: user.createdAt,
    },
    stats: {
      quoteRequests: {
        label: 'Quote Requests',
        status: 'live',
        total: totalQuotes,
        change: quotesThisMonth,
        changePeriod: 'this month',
      },
      checkouts: {
        label: 'Checkouts',
        status: 'active',
        total: totalCheckouts,
        change: checkoutsThisMonth,
        changePeriod: 'this month',
      },
      totalActivity: {
        label: 'Total Activity',
        status: 'track',
        total: totalEvents,
        change: eventsToday,
        changePeriod: 'new today',
      },
    },
    recentActivity: recentEvents.map((event) => ({
      id: event.id.toString(),
      type: event.eventType as ActivityType,
      description: formatActivityDescription(event.eventType, event.eventData),
      timestamp: event.createdAt,
      metadata: event.eventData as Record<string, unknown> | undefined,
    })),
  };
}

function formatActivityDescription(type: string, data: unknown): string {
  const eventData = data as Record<string, unknown> | null;
  
  switch (type) {
    case 'quote_requested':
      return `Requested quote ${eventData?.reference || ''}`;
    case 'checkout_completed':
      return `Completed checkout for ₦${eventData?.totalAmount || 0}`;
    case 'form_submitted':
      return `Submitted ${eventData?.formType || 'form'}`;
    case 'product_viewed':
      return `Viewed product ${eventData?.productName || eventData?.sku || ''}`;
    case 'search_performed':
      return `Searched for "${eventData?.query || ''}"`;
    case 'newsletter_signup':
      return 'Subscribed to newsletter';
    default:
      return type.replace(/_/g, ' ');
  }
}
```

---

## Routing & Components

### File Structure

```
src/app/account/
├── page.tsx                           # Server component - data fetching & auth
├── layout.tsx                         # Account layout with sidebar
├── loading.tsx                        # Loading skeleton
├── error.tsx                          # Error boundary
├── _types/
│   └── dashboard.ts                   # TypeScript interfaces
├── _actions/
│   └── dashboard.ts                   # Server actions for data fetching
└── _components/
    ├── UserDashboardShell.tsx         # Main client component wrapper
    ├── UserStatsCards.tsx             # Stats cards grid
    ├── UserAccountDetails.tsx         # Account info panel
    ├── UserRecentActivity.tsx         # Activity feed
    └── UserGreeting.tsx               # Greeting header with status
```

### Component Responsibilities

#### `page.tsx` (Server Component)
```typescript
// Responsibility: Auth check, data fetching, render shell
// Props: None (uses auth() and params)

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserDashboardData } from './_actions/dashboard';
import UserDashboardShell from './_components/UserDashboardShell';

export default async function AccountPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/account');
  }
  
  const userId = parseInt(session.user.id as string);
  const dashboardData = await getUserDashboardData(userId);
  
  return <UserDashboardShell data={dashboardData} />;
}
```

#### `UserDashboardShell.tsx` (Client Component)
```typescript
// Responsibility: Layout orchestration, state management, refresh logic
// Props: { data: UserDashboardData }

interface UserDashboardShellProps {
  data: UserDashboardData;
}

// Renders:
// - UserGreeting (top)
// - UserStatsCards (3-column grid)
// - Two-column layout: UserAccountDetails + UserRecentActivity
```

#### `UserGreeting.tsx`
```typescript
// Responsibility: Display user name, status badge, last login
// Props: { user: UserAccountDetails }

interface UserGreetingProps {
  user: UserAccountDetails;
}

// Renders:
// - "Welcome back, mayowa"
// - Status badge: "Active Now" (green) or "Inactive" (gray)
// - Last login: "4 days ago / Jan 9, 2026"
```

#### `UserStatsCards.tsx`
```typescript
// Responsibility: Render 3 stat cards in a responsive grid
// Props: { stats: UserStats }

interface UserStatsCardsProps {
  stats: UserStats;
}

// Renders for each card:
// - Label: "Quote Requests"
// - Status badge: "Live" / "Active" / "Track"
// - Total: "0"
// - Change: "+2 this month"
// Empty state: Shows 0 with appropriate messaging
```

#### `UserAccountDetails.tsx`
```typescript
// Responsibility: Display account information in a card
// Props: { user: UserAccountDetails }

interface UserAccountDetailsProps {
  user: UserAccountDetails;
}

// Renders:
// - Email: logonotobscurity@gmail.com
// - Company: lolo
// - Role: customer
// - Member since: Jan 2026
// - Email verified badge
```

#### `UserRecentActivity.tsx`
```typescript
// Responsibility: Display activity feed with empty state
// Props: { activities: UserActivityItem[] }

interface UserRecentActivityProps {
  activities: UserActivityItem[];
}

// Renders:
// - Title: "Recent Activity"
// - Subtitle: "Your latest platform interactions"
// - Activity list with icons and timestamps
// Empty state: "No activities yet" with illustration
```

---

## Metrics & Activity Logic

### Quote Requests Card

| Field | Source | Calculation |
|-------|--------|-------------|
| Total | `Quote` table | `COUNT(*) WHERE userId = ?` |
| Change | `Quote` table | `COUNT(*) WHERE userId = ? AND createdAt >= startOfMonth` |
| Status | Static | Always "Live" |

### Checkouts Card

| Field | Source | Calculation |
|-------|--------|-------------|
| Total | `AnalyticsEvent` | `COUNT(*) WHERE userId = ? AND eventType = 'checkout_completed'` |
| Change | `AnalyticsEvent` | `COUNT(*) WHERE userId = ? AND eventType = 'checkout_completed' AND createdAt >= startOfMonth` |
| Status | Static | Always "Active" |

### Total Activity Card

| Field | Source | Calculation |
|-------|--------|-------------|
| Total | `AnalyticsEvent` | `COUNT(*) WHERE userId = ?` |
| Change | `AnalyticsEvent` | `COUNT(*) WHERE userId = ? AND createdAt >= startOfToday` |
| Status | Static | Always "Track" |

### Recent Activity Feed

| Field | Source | Calculation |
|-------|--------|-------------|
| Items | `AnalyticsEvent` | `SELECT * WHERE userId = ? ORDER BY createdAt DESC LIMIT 10` |
| Description | Derived | Format based on `eventType` and `eventData` JSON |

### Consistency with Admin Dashboard

The user dashboard uses the **same `AnalyticsEvent` table** as the admin dashboard:

```typescript
// Admin dashboard: All events across all users
prisma.analyticsEvent.findMany({ orderBy: { createdAt: 'desc' } });

// User dashboard: Events filtered to current user
prisma.analyticsEvent.findMany({ 
  where: { userId },
  orderBy: { createdAt: 'desc' } 
});
```

Event types are identical:
- `quote_requested` → tracked by `trackQuoteRequest()`
- `checkout_completed` → tracked by `trackCheckoutEvent()`
- `form_submitted` → tracked by `trackFormSubmission()`
- `product_viewed` → tracked by `trackProductView()`
- `search_performed` → tracked by `trackSearchQuery()`

---

## Auth & Access Control

### Route Protection

```typescript
// src/app/account/layout.tsx

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  // Redirect unauthenticated users
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/account');
  }
  
  // Both CUSTOMER and ADMIN roles can access
  // No role check needed - any authenticated user can view their account
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Account sidebar/navigation */}
      {children}
    </div>
  );
}
```

### Session Data Usage

```typescript
// Available from session:
session.user.id        // Used to fetch user-specific data
session.user.email     // Display in header
session.user.name      // Display in greeting
session.user.role      // Show role badge

// Fetched from DB for accuracy:
user.lastLogin         // "4 days ago"
user.company.name      // "lolo"
user.emailVerified     // Verification badge
```

### Role-Based UI Differences

| Feature | CUSTOMER | ADMIN |
|---------|----------|-------|
| View dashboard | ✅ | ✅ |
| View own stats | ✅ | ✅ |
| View own activity | ✅ | ✅ |
| Admin panel link | ❌ | ✅ (in sidebar) |
| Edit other users | ❌ | ❌ (use /admin) |

---

## Implementation Status ✅ COMPLETE

All components have been implemented and verified:

### Core Dashboard (✅ Complete)
- `src/app/account/_types/dashboard.ts` - TypeScript interfaces
- `src/app/account/_actions/dashboard.ts` - Server actions with caching
- `src/app/account/page.tsx` - Main dashboard page
- `src/app/account/layout.tsx` - Account layout with sidebar
- `src/app/account/loading.tsx` - Loading skeleton
- `src/app/account/error.tsx` - Error boundary

### Dashboard Components (✅ Complete)
- `src/app/account/_components/UserDashboardShell.tsx` - Main client wrapper
- `src/app/account/_components/UserGreeting.tsx` - Welcome header
- `src/app/account/_components/UserStatsCards.tsx` - Stats grid
- `src/app/account/_components/UserAccountDetails.tsx` - Account info panel
- `src/app/account/_components/UserRecentActivity.tsx` - Activity feed

### Sub-Routes (✅ Complete)
- `src/app/account/quotes/page.tsx` - User quotes list
- `src/app/account/quotes/QuotesClient.tsx` - Quotes client component
- `src/app/account/orders/page.tsx` - Orders page (placeholder)
- `src/app/account/notifications/page.tsx` - Notifications page
- `src/app/account/notifications/NotificationsClient.tsx` - Notifications client
- `src/app/account/settings/page.tsx` - Settings page
- `src/app/account/settings/SettingsClient.tsx` - Settings client component

### API Endpoint (✅ Complete)
- `src/app/api/account/dashboard-data/route.ts` - Dashboard data refresh API

### Features Implemented
- ✅ Server-side auth with redirect to login
- ✅ Optimized parallel Prisma queries
- ✅ Caching layer integration
- ✅ Client-side refresh functionality
- ✅ Responsive sidebar navigation
- ✅ Admin panel link for admin users
- ✅ Sign out functionality
- ✅ Empty states for all sections
- ✅ Loading skeletons
- ✅ Error boundary with retry

---

## Example Rendered Output

```
┌─────────────────────────────────────────────────────────────┐
│  Welcome back, mayowa                                       │
│  🟢 Active Now  •  Last login: 4 days ago / Jan 9, 2026    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Quote Requests  │ │ Checkouts       │ │ Total Activity  │
│ 🟢 Live         │ │ 🟢 Active       │ │ 📊 Track        │
│                 │ │                 │ │                 │
│ 0               │ │ 0               │ │ 0               │
│ +2 this month   │ │ +0 this month   │ │ +1 new today    │
└─────────────────┘ └─────────────────┘ └─────────────────┘

┌─────────────────────────┐ ┌─────────────────────────────────┐
│ Account Details         │ │ Recent Activity                 │
│                         │ │ Your latest platform interactions│
│ Email:                  │ │                                 │
│ logonotobscurity@...    │ │ ┌─────────────────────────────┐ │
│                         │ │ │ 📭 No activities yet        │ │
│ Company: lolo           │ │ │                             │ │
│ Role: customer          │ │ │ Start exploring to see your │ │
│ Member since: Jan 2026  │ │ │ activity here               │ │
│ ✅ Email verified       │ │ └─────────────────────────────┘ │
└─────────────────────────┘ └─────────────────────────────────┘
```

---

**Document Version**: 1.1  
**Created**: January 13, 2026  
**Updated**: January 13, 2026  
**Status**: ✅ Implementation Complete  
**Author**: Architecture Team
