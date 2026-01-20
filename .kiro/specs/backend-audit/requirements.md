# Requirements Document

## Introduction

This specification defines the requirements for a comprehensive backend audit and architecture verification of a Next.js 16 application using Auth.js v5, Prisma 5, and TypeScript. The audit will produce an actionable Markdown summary identifying misalignments, gaps, and risks across authentication, database, routing, tracking, and admin dashboard components.

## Glossary

- **Audit_System**: The automated analysis process that examines codebase components
- **Auth_Module**: The authentication and authorization system (Auth.js v5 / NextAuth)
- **Prisma_Layer**: The database ORM layer using Prisma Client
- **Tracking_Service**: Server actions that record analytics events and user activities
- **Admin_Dashboard**: The administrative interface for managing users, quotes, and analytics
- **RBAC**: Role-Based Access Control system distinguishing ADMIN and CUSTOMER roles
- **Middleware**: Next.js middleware handling route protection and auth checks

## Requirements

### Requirement 1: Authentication Configuration Audit

**User Story:** As a backend architect, I want to verify the Auth.js v5 configuration is correctly implemented, so that authentication flows are secure and follow best practices.

#### Acceptance Criteria

1. WHEN the Audit_System examines auth.ts, THE Audit_System SHALL verify that NextAuth v5 patterns are used correctly (not legacy v4 patterns)
2. WHEN the Audit_System examines session configuration, THE Audit_System SHALL verify JWT strategy is properly configured with correct token handling
3. WHEN the Audit_System examines callbacks, THE Audit_System SHALL verify jwt and session callbacks correctly propagate role and user data
4. WHEN the Audit_System examines the authorized callback, THE Audit_System SHALL verify it correctly implements route protection logic
5. WHEN the Audit_System finds version incompatibilities between next-auth and @auth/prisma-adapter, THE Audit_System SHALL report them with recommended version alignment
6. IF the Audit_System detects lastLogin not being updated correctly, THEN THE Audit_System SHALL report the issue with a fix recommendation

### Requirement 2: Middleware Alignment Audit

**User Story:** As a backend architect, I want to verify middleware aligns with Auth.js v5 patterns, so that route protection is consistent and secure.

#### Acceptance Criteria

1. WHEN the Audit_System examines middleware.ts, THE Audit_System SHALL verify it exports the auth middleware correctly
2. WHEN the Audit_System examines the matcher configuration, THE Audit_System SHALL verify it covers all necessary routes
3. IF the Audit_System detects Prisma usage in middleware (edge runtime), THEN THE Audit_System SHALL report crypto/engine compatibility issues
4. WHEN the Audit_System examines route protection, THE Audit_System SHALL verify public, user, and admin routes are correctly categorized
5. IF the Audit_System detects logic that should be in authorized callback but is in middleware, THEN THE Audit_System SHALL recommend refactoring

### Requirement 3: RBAC Implementation Audit

**User Story:** As a backend architect, I want to verify role-based access control is correctly implemented, so that admin and user routes are properly protected.

#### Acceptance Criteria

1. WHEN the Audit_System examines public routes, THE Audit_System SHALL verify /, /products, /quote, /guest-quote, /newsletter, /contact, /auth/* are accessible without authentication
2. WHEN the Audit_System examines user routes, THE Audit_System SHALL verify /account and /checkout require authentication
3. WHEN the Audit_System examines admin routes, THE Audit_System SHALL verify /admin/** requires ADMIN role
4. IF the Audit_System detects RBAC checks that can be bypassed, THEN THE Audit_System SHALL report the vulnerability with fix recommendations
5. IF the Audit_System detects client stores used as source of truth for auth instead of session, THEN THE Audit_System SHALL report the architectural smell

### Requirement 4: Prisma Schema and Type Alignment Audit

**User Story:** As a backend architect, I want to verify Prisma models align with TypeScript types and services, so that type safety is maintained throughout the application.

#### Acceptance Criteria

1. WHEN the Audit_System examines schema.prisma, THE Audit_System SHALL verify all models have correct relations and indexes
2. WHEN the Audit_System compares Prisma models to TypeScript types, THE Audit_System SHALL report any field name mismatches (e.g., formType vs type, isRead vs read)
3. WHEN the Audit_System examines nullable fields, THE Audit_System SHALL verify they correctly handle anonymous user tracking (userId optional)
4. WHEN the Audit_System examines PrismaClient initialization, THE Audit_System SHALL verify it's configured for Node runtime (not edge)
5. IF the Audit_System detects enum mismatches between Prisma and TypeScript, THEN THE Audit_System SHALL report them with alignment recommendations

### Requirement 5: Tracking Functions Audit

**User Story:** As a backend architect, I want to verify tracking server actions have correct signatures and are used consistently, so that analytics data is reliably captured.

#### Acceptance Criteria

1. WHEN the Audit_System examines each tracking function, THE Audit_System SHALL document its expected input shape
2. WHEN the Audit_System examines tracking function usage in components, THE Audit_System SHALL verify parameter shapes match function signatures
3. WHEN the Audit_System examines tracking functions, THE Audit_System SHALL verify they correctly write to Prisma models (AnalyticsEvent, FormSubmission, ProductView, SearchQuery, Notification)
4. IF the Audit_System detects tracking calls with mismatched parameters, THEN THE Audit_System SHALL report the mismatch with corrected signatures
5. WHEN the Audit_System examines trackCheckoutEvent, trackUserRegistration, trackQuoteRequest, trackNewsletterSignup, trackFormSubmission, trackProductView, trackSearchQuery, createNotification, updateUserLastLogin, THE Audit_System SHALL verify each function's status (OK or Needs fix)

### Requirement 6: Routing Structure Audit

**User Story:** As a backend architect, I want to verify the App Router structure matches the intended routing map, so that all routes are correctly protected and accessible.

#### Acceptance Criteria

1. WHEN the Audit_System examines src/app/**, THE Audit_System SHALL verify route structure matches intended access levels
2. WHEN the Audit_System examines each route, THE Audit_System SHALL verify protection level (public, user, admin) is correctly implemented
3. WHEN the Audit_System examines layouts, THE Audit_System SHALL verify route-level guards are correctly placed for admin/user flows
4. IF the Audit_System detects routes that should be protected but are not, THEN THE Audit_System SHALL report them with fix recommendations
5. IF the Audit_System detects routes that are over-protected, THEN THE Audit_System SHALL report them with fix recommendations

### Requirement 7: Admin Dashboard Data Flow Audit

**User Story:** As a backend architect, I want to verify admin dashboard data flows correctly from user actions through to UI, so that administrators see accurate and timely information.

#### Acceptance Criteria

1. WHEN the Audit_System examines admin dashboard pages, THE Audit_System SHALL verify data flows from user actions → server actions → DB → admin queries → dashboard UI
2. WHEN the Audit_System examines admin tabs (Activity, Quotes, Users, Newsletter, Forms, Events), THE Audit_System SHALL verify each tab correctly queries and displays data
3. IF the Audit_System detects missing wiring between server actions and UI, THEN THE Audit_System SHALL report the gap with implementation recommendations
4. WHEN the Audit_System examines admin API routes, THE Audit_System SHALL verify they correctly query Prisma models
5. IF the Audit_System detects admin routes without proper RBAC protection, THEN THE Audit_System SHALL report the security issue

### Requirement 8: Audit Report Generation

**User Story:** As a backend architect, I want the audit to produce a structured Markdown report, so that I can systematically address identified issues.

#### Acceptance Criteria

1. THE Audit_System SHALL produce a Markdown file with sections: Overview, Auth & Middleware Audit, Prisma & Database Audit, Tracking & Analytics Audit, Routing & Admin Dashboard Audit, Action Plan
2. WHEN reporting issues, THE Audit_System SHALL provide code-level fix snippets or pseudo-code
3. WHEN reporting Prisma issues, THE Audit_System SHALL provide recommended schema.prisma changes
4. WHEN reporting tracking function issues, THE Audit_System SHALL provide corrected function signatures and sample calls
5. THE Audit_System SHALL provide a phased action plan with: Phase 1 (Make it build & run), Phase 2 (Align models & tracking), Phase 3 (Harden auth & admin)
6. FOR each phase, THE Audit_System SHALL list concrete tasks with expected outcomes and acceptance criteria
