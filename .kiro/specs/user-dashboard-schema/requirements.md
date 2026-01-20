# Requirements Document

## Introduction

This document defines the requirements for updating the Prisma schema to fully support the User Dashboard and User Settings features as described in the design documents. The goal is to ensure the database schema provides all necessary fields, relationships, and indexes for optimal performance and feature completeness.

## Glossary

- **User**: An authenticated account holder in the B2B platform
- **Dashboard**: The `/account` page showing user statistics and activity
- **Settings**: The `/account/settings` page for profile, address, company, and security management
- **AnalyticsEvent**: A record tracking user interactions and activities
- **NotificationPreferences**: User preferences for email and notification settings
- **Address**: A billing or shipping address associated with a user or company

## Requirements

### Requirement 1: User Profile Fields

**User Story:** As a user, I want to manage my profile information, so that my account details are accurate and up-to-date.

#### Acceptance Criteria

1. THE User model SHALL include `firstName` and `lastName` fields for personal identification
2. THE User model SHALL include a `phone` field for contact information
3. THE User model SHALL include a `lastLogin` timestamp for activity tracking
4. THE User model SHALL include an `emailVerified` timestamp for verification status
5. THE User model SHALL include an `isActive` boolean for account status

### Requirement 2: Address Management

**User Story:** As a user, I want to manage multiple addresses, so that I can have different billing and shipping locations.

#### Acceptance Criteria

1. THE Address model SHALL support `BILLING` and `SHIPPING` address types
2. THE Address model SHALL include `street`, `city`, `state`, `postalCode`, and `country` fields
3. THE Address model SHALL include an `isDefault` boolean to mark primary addresses
4. WHEN a user creates an address, THE System SHALL associate it with the user via `userId`
5. THE Address model SHALL support both user and company associations

### Requirement 3: Company Information

**User Story:** As a business user, I want to manage my company information, so that my business details are properly recorded.

#### Acceptance Criteria

1. THE Company model SHALL include `name`, `registrationNumber`, `taxId`, `industry`, and `website` fields
2. THE User model SHALL have an optional relation to Company via `companyId`
3. WHEN a user updates company information, THE System SHALL create or update the associated Company record

### Requirement 4: Analytics Event Tracking

**User Story:** As a user, I want my platform activities tracked, so that I can see my recent interactions on the dashboard.

#### Acceptance Criteria

1. THE AnalyticsEvent model SHALL store `eventType` as a string for flexible event categorization
2. THE AnalyticsEvent model SHALL store `eventData` as JSON for event-specific metadata
3. THE AnalyticsEvent model SHALL have an optional `userId` relation for user-specific events
4. THE AnalyticsEvent model SHALL include indexes on `eventType`, `userId`, and `createdAt` for query performance
5. WHEN tracking settings events, THE System SHALL record events including `profile_updated`, `address_created`, `address_updated`, `address_deleted`, `company_updated`, and `password_changed`

### Requirement 5: Notification Preferences

**User Story:** As a user, I want to manage my notification preferences, so that I control what communications I receive.

#### Acceptance Criteria

1. THE NotificationPreferences model SHALL include `emailNotifications` boolean for general email settings
2. THE NotificationPreferences model SHALL include `quoteUpdates` boolean for quote-related notifications
3. THE NotificationPreferences model SHALL include `marketingEmails` boolean for promotional content
4. THE NotificationPreferences model SHALL have a one-to-one relation with User via unique `userId`
5. WHEN a user is created, THE System SHALL allow creation of default notification preferences

### Requirement 6: Quote Statistics

**User Story:** As a user, I want to see my quote request statistics, so that I can track my purchasing activity.

#### Acceptance Criteria

1. THE Quote model SHALL have a `userId` relation for user-specific quotes
2. THE Quote model SHALL include a `createdAt` timestamp for time-based statistics
3. THE Quote model SHALL include indexes on `userId`, `status`, and `createdAt` for efficient dashboard queries

### Requirement 7: Schema Performance Optimization

**User Story:** As a system, I want optimized database indexes, so that dashboard queries perform efficiently.

#### Acceptance Criteria

1. THE User model SHALL include indexes on `role`, `isActive`, and `createdAt`
2. THE AnalyticsEvent model SHALL include composite indexes for common query patterns
3. THE Notification model SHALL include indexes on `userId`, `isRead`, and `createdAt`
4. THE Quote model SHALL include indexes on `userId`, `status`, and `createdAt`
