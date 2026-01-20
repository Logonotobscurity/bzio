# Implementation Plan: User Dashboard Schema

## Overview

This implementation plan verifies the existing Prisma schema against the User Dashboard and User Settings design requirements. Since the schema is already complete, the tasks focus on verification, documentation, and optional property-based testing to ensure correctness.

## Tasks

- [ ] 1. Verify Schema Structure
  - [ ] 1.1 Verify User model has all required fields (firstName, lastName, phone, lastLogin, emailVerified, isActive)
    - Check prisma/schema.prisma User model
    - Confirm field types match design specifications
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 1.2 Verify Address model structure and enum
    - Confirm AddressType enum has BILLING and SHIPPING values
    - Verify street, city, state, postalCode, country, isDefault fields
    - Verify userId and companyId relations
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [ ] 1.3 Verify Company model fields
    - Confirm name, registrationNumber, taxId, industry, website fields exist
    - Verify User-Company relation via companyId
    - _Requirements: 3.1, 3.2_

  - [ ] 1.4 Verify AnalyticsEvent model structure
    - Confirm eventType (String) and eventData (Json?) fields
    - Verify optional userId relation
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 1.5 Verify NotificationPreferences model
    - Confirm emailNotifications, quoteUpdates, marketingEmails boolean fields
    - Verify unique userId constraint for one-to-one relation
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 2. Verify Database Indexes
  - [ ] 2.1 Verify User model indexes
    - Confirm indexes on role, isActive, createdAt
    - _Requirements: 7.1_

  - [ ] 2.2 Verify AnalyticsEvent model indexes
    - Confirm indexes on eventType, userId, createdAt
    - _Requirements: 4.4, 7.2_

  - [ ] 2.3 Verify Notification model indexes
    - Confirm indexes on userId, isRead, createdAt
    - _Requirements: 7.3_

  - [ ] 2.4 Verify Quote model indexes
    - Confirm indexes on userId, status, createdAt
    - _Requirements: 6.3, 7.4_

- [ ] 3. Checkpoint - Schema Verification Complete
  - Ensure all schema elements verified against design
  - Ask the user if questions arise

- [ ]* 4. Property-Based Tests for Schema Correctness
  - [ ]* 4.1 Write property test for unique default address per type
    - **Property 2: Unique Default Address Per Type**
    - For any User and AddressType, at most one Address should be isDefault=true
    - **Validates: Requirements 2.3**

  - [ ]* 4.2 Write property test for User-Address referential integrity
    - **Property 1: User-Address Ownership Integrity**
    - For any Address with userId, the User must exist
    - **Validates: Requirements 2.4**

  - [ ]* 4.3 Write property test for NotificationPreferences uniqueness
    - **Property 3: NotificationPreferences Uniqueness**
    - For any User, at most one NotificationPreferences record exists
    - **Validates: Requirements 5.4**

  - [ ]* 4.4 Write property test for AnalyticsEvent user association
    - **Property 4: AnalyticsEvent User Association**
    - For any AnalyticsEvent with userId, the User must exist
    - **Validates: Requirements 4.3**

  - [ ]* 4.5 Write property test for Quote-User ownership
    - **Property 5: Quote-User Ownership**
    - For any Quote, the userId must reference an existing User
    - **Validates: Requirements 6.1**

- [ ] 5. Update Activity Type Definitions
  - [ ] 5.1 Update ActivityType in dashboard.ts
    - Add new event types: profile_updated, address_created, address_updated, address_deleted, company_updated, password_changed
    - Update formatActivityDescription() for new event types
    - _Requirements: 4.5_

- [ ] 6. Final Checkpoint
  - Ensure all verifications complete
  - Ensure activity types updated
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The schema is already complete - no migrations required
- Property tests validate database constraints at runtime
- Activity type updates enable proper dashboard display of settings events
