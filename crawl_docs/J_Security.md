# Section J: Security Checklist

### 1. IDOR Risks
- **Assessment:** Moderate. While role-based access is strict, some user-specific routes (like fetching personal quotes) must ensure the `userId` in the query matches the authenticated user.
- **Remediation:** Standardized the use of `session.user.id` instead of request parameters for user-owned resource queries.

### 2. Mutation Safety
- **Checks:** Server-side checks are present in all Route Handlers and Server Actions. Role validation (`ADMIN`) is performed before any catalog or administrative mutation.

### 3. Session & Tokens
- **Cookies:** NextAuth uses secure, HttpOnly, and SameSite cookies.
- **CSRF:** Inherit protection from NextAuth's CSRF handling.
- **Secrets:** All sensitive keys (Resend, Database, Auth Secret) are stored in `.env` and are not committed to source control.

### 4. File Uploads
- **Current State:** Limited direct file upload logic found in API routes. Images are typically handled as URLs or via specialized cloud provider integrations.

### 5. Input Validation
- **Zod:** Heavily used throughout the API layer to sanitize and validate incoming payloads before processing.
