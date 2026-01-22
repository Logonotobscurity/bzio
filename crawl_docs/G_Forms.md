# Section G: Forms

### 1. Form Types
- **RFQ Forms:** Specialized forms for requesting product quotes.
- **Generic Forms:** Contact forms, newsletter subscriptions.
- **Form Submission Model:** Data is stored in `form_submissions` as structured JSON blobs in the `data` column.

### 2. Validation & Security
- **Validation:** Zod schemas are the standard for both client-side and server-side validation.
- **Protection:** Rate limiting is implemented on sensitive submission routes (e.g., `/api/forms/submit`).

### 3. Admin Tools
- **Review:** Admins can view and respond to form submissions via the Admin Dashboard.
- **CRM Integration:** Form submissions often trigger the creation of a `lead` record in the CRM logic.
