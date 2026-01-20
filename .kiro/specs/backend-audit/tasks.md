# Implementation Plan: Backend Audit & Architecture Verification

## Overview

This implementation plan breaks down the backend audit into discrete tasks that analyze the codebase and produce a comprehensive BACKEND_AUDIT_SUMMARY.md report. The audit will be performed manually by examining code files and documenting findings.

## Tasks

- [x] 1. Set up audit infrastructure and analyze package versions
  - Create BACKEND_AUDIT_SUMMARY.md file with section headers
  - Document tech stack versions from package.json (Next.js, NextAuth, Prisma, adapter)
  - Check version compatibility between next-auth ^5.0.0-beta.30 and @auth/prisma-adapter ^2.11.1
  - _Requirements: 1.5, 8.1_

- [x] 2. Audit authentication configuration
  - [x] 2.1 Analyze src/lib/auth.ts for Auth.js v5 patterns
    - Verify NextAuth export pattern (auth, handlers, signIn, signOut)
    - Check PrismaAdapter configuration
    - Verify JWT session strategy
    - Document any issues with code-level fix snippets
    - _Requirements: 1.1, 1.2_

  - [x] 2.2 Analyze callbacks (jwt, session, authorized)
    - Verify role propagation through jwt callback
    - Verify session callback correctly exposes role and company
    - Verify authorized callback implements correct route protection logic
    - Check lastLogin update in authorize function
    - _Requirements: 1.3, 1.4, 1.6_

  - [x] 2.3 Write property test for role propagation
    - **Property 1: Role Propagation Through Callbacks**
    - **Validates: Requirements 1.3**

- [x] 3. Audit middleware configuration
  - [x] 3.1 Analyze src/middleware.ts
    - Verify middleware exports auth correctly
    - Check matcher configuration covers all routes
    - Verify no Prisma usage in edge runtime
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.2 Write property test for route protection
    - **Property 2: Route Protection Correctness**
    - **Validates: Requirements 2.2, 2.4, 3.1, 3.2, 3.3, 6.1, 6.2**
    - **SECURITY FIX**: Fixed critical bug in auth.config.ts where "/" in publicPaths caused ALL routes to be public (every path starts with "/")

- [ ] 4. Checkpoint - Review auth and middleware findings
  - Ensure all auth issues are documented
  - Ask the user if questions arise about auth configuration

- [ ] 5. Audit RBAC implementation
  - [ ] 5.1 Verify public route access
    - Check /, /products/**, /quote, /guest-quote, /newsletter, /contact, /auth/** are public
    - Document any routes that should be public but are protected
    - _Requirements: 3.1_

  - [ ] 5.2 Verify user route protection
    - Check /account and /checkout require authentication
    - Verify both ADMIN and CUSTOMER roles can access
    - _Requirements: 3.2_

  - [ ] 5.3 Verify admin route protection
    - Check /admin/** requires ADMIN role
    - Look for any RBAC bypass vulnerabilities
    - Check for client stores used as auth source of truth
    - _Requirements: 3.3, 3.4, 3.5_

- [ ] 6. Audit Prisma schema and types
  - [ ] 6.1 Analyze prisma/schema.prisma
    - Verify all models have correct relations
    - Check indexes are defined where needed
    - Verify nullable fields for anonymous tracking (userId optional on tracking models)
    - _Requirements: 4.1, 4.3_

  - [ ] 6.2 Check type alignment
    - Compare Prisma models to TypeScript types in src/lib/types/
    - Look for field name mismatches (formType vs type, isRead vs read)
    - Check enum alignment between Prisma and TypeScript
    - _Requirements: 4.2, 4.5_

  - [ ] 6.3 Verify PrismaClient configuration
    - Check src/lib/prisma.ts for correct initialization
    - Verify Node runtime configuration (not edge)
    - _Requirements: 4.4_

  - [ ] 6.4 Write property test for schema alignment
    - **Property 3: Prisma Schema Alignment**
    - **Validates: Requirements 4.1, 4.2, 4.5**

- [ ] 7. Checkpoint - Review Prisma findings
  - Ensure all schema issues are documented with recommended changes
  - Ask the user if questions arise about schema design

- [ ] 8. Audit tracking functions
  - [ ] 8.1 Analyze src/app/admin/_actions/tracking.ts
    - Document each function's input shape
    - Verify Prisma models touched by each function
    - Create tracking function audit table
    - _Requirements: 5.1, 5.3, 5.5_

  - [ ] 8.2 Check tracking function usage across codebase
    - Search for calls to each tracking function
    - Verify parameter shapes match function signatures
    - Document any mismatches with corrected signatures
    - _Requirements: 5.2, 5.4_

  - [ ] 8.3 Write property test for tracking parameters
    - **Property 4: Tracking Function Parameter Correctness**
    - **Validates: Requirements 5.2, 5.4**

  - [ ] 8.4 Write property test for tracking Prisma writes
    - **Property 5: Tracking Function Prisma Write Correctness**
    - **Validates: Requirements 5.3**

- [ ] 9. Audit routing structure
  - [ ] 9.1 Analyze src/app/** directory structure
    - Map all routes to intended access levels
    - Verify each route has correct protection
    - _Requirements: 6.1, 6.2_

  - [ ] 9.2 Check layout guards
    - Verify admin layouts have auth checks
    - Verify user layouts have auth checks
    - Document any missing guards
    - _Requirements: 6.3, 6.4, 6.5_

  - [ ] 9.3 Write property test for layout guards
    - **Property 6: Layout Guard Placement**
    - **Validates: Requirements 6.3**

- [ ] 10. Audit user dashboard
  - [ ] 10.1 Analyze src/app/account/page.tsx
    - Verify auth guard implementation
    - Check data fetching via getUserData()
    - Verify all tabs display correct data
    - _Requirements: 6.1, 6.2_

  - [ ] 10.2 Check user dashboard data flow
    - Verify quotes, cart items, notifications are fetched correctly
    - Check Prisma queries match expected data
    - _Requirements: 7.1_

  - [ ] 10.3 Write property test for user dashboard data
    - **Property 8: User Dashboard Data Consistency**
    - **Validates: Requirements 6.1, 6.2**

- [ ] 11. Audit admin dashboard
  - [ ] 11.1 Analyze src/app/admin/page.tsx
    - Check data flow from API to UI
    - Verify stats are correctly calculated
    - Document any missing wiring
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 11.2 Check admin API routes
    - Verify /api/admin/stats exists and works
    - Check Prisma queries are correct
    - _Requirements: 7.4, 7.5_

  - [ ] 11.3 Write property test for admin data flow
    - **Property 7: Admin Data Flow Completeness**
    - **Validates: Requirements 7.1, 7.4**

- [ ] 12. Audit form submissions
  - [ ] 12.1 Analyze form submission flow
    - Trace trackFormSubmission() usage
    - Verify FormSubmission, AnalyticsEvent, AdminNotification creation
    - Check form validation schemas
    - _Requirements: 5.3, 7.1_

  - [ ] 12.2 Write property test for form submission tracking
    - **Property 9: Form Submission Tracking Completeness**
    - **Validates: Requirements 5.3, 7.1**

- [ ] 13. Audit order dashboard component
  - [ ] 13.1 Analyze src/components/order-dashboard.tsx
    - Verify data source (/api/admin/orders)
    - Check stats calculation
    - Note that "orders" are actually Quotes
    - _Requirements: 7.1, 7.2_

- [ ] 14. Checkpoint - Review all findings
  - Ensure all sections of BACKEND_AUDIT_SUMMARY.md are complete
  - Ask the user if questions arise about any findings

- [ ] 15. Generate action plan
  - [ ] 15.1 Create Phase 1 tasks (Make it build & run)
    - List Prisma client initialization fixes
    - List auth config and middleware alignment tasks
    - Define acceptance criteria
    - _Requirements: 8.5, 8.6_

  - [ ] 15.2 Create Phase 2 tasks (Align models & tracking)
    - List Prisma/TS mismatch fixes
    - List tracking function contract standardization tasks
    - Define acceptance criteria
    - _Requirements: 8.5, 8.6_

  - [ ] 15.3 Create Phase 3 tasks (Harden auth & admin)
    - List RBAC solidification tasks
    - List admin route protection tasks
    - Define acceptance criteria
    - _Requirements: 8.5, 8.6_

- [ ] 16. Finalize audit report
  - [ ] 16.1 Write overview section
    - Summarize overall codebase health
    - List tech stack versions
    - Highlight high-level risks
    - _Requirements: 8.1_

  - [ ] 16.2 Add code fix snippets
    - Ensure all issues have before/after code snippets
    - Add recommended schema.prisma changes
    - Add corrected function signatures
    - _Requirements: 8.2, 8.3, 8.4_

- [ ] 17. Final checkpoint - Complete audit
  - Ensure BACKEND_AUDIT_SUMMARY.md is complete and actionable
  - Ask the user to review the final report

## Notes

- All tasks are required for comprehensive audit with property tests
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and user feedback
- The audit produces a single BACKEND_AUDIT_SUMMARY.md file as output
- Property tests use fast-check library for TypeScript
