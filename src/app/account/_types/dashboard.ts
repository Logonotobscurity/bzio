/**
 * User Dashboard Type Definitions
 * These interfaces define the data structures for the authenticated user dashboard
 */

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
  name: string;
  email: string;
  company: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  status: 'active' | 'inactive';
  lastLoginAt: Date | null;
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
export interface StatCard {}

/**
 * Single activity item for the recent activity feed
 */
export interface UserActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Activity event types matching the tracking system
 */
export type ActivityType =
  // Existing events
  | 'quote_requested'
  | 'checkout_completed'
  | 'form_submitted'
  | 'product_viewed'
  | 'search_performed'
  | 'user_registered'
  | 'newsletter_signup'
  // Settings events
  | 'profile_updated'
  | 'address_created'
  | 'address_updated'
  | 'address_deleted'
  | 'company_updated'
  | 'password_changed'
  | 'notification_read'
  | 'notification_preferences_updated';
