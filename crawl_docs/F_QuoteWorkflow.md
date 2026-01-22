# Section F: Quote Request (RFQ) Workflow

### 1. Concepts
- **Quote Cart:** Users can add multiple products to a "cart" and then submit them all as a single Quote Request (RFQ).
- **Direct RFQ:** Single-product RFQs are also supported via forms.

### 2. Submission Data
- **Fields Captured:** Email, Name, Phone, Company, Delivery Address/Message, and Line Items (Product + Quantity).
- **Model:** Header table (`quotes`) with relation to multiple line items (`quote_lines`).

### 3. Pipeline & Statuses
- **Pipeline:** DRAFT -> PENDING -> NEGOTIATING -> ACCEPTED -> REJECTED -> EXPIRED.
- **Idempotency:** Submission routes use unique references (often timestamp-based) to prevent accidental double-posting.

### 4. Visibility & Notifications
- **Access:** Users can view their own quote history in `/account`. Admins view all quotes in `/admin`.
- **Notifications:**
    - **Email:** Confirmation emails to customers and alert emails to admins (Resend).
    - **Dashboard:** Unread notification indicators for admins (`crm_notifications`).
    - **WhatsApp:** Automated redirection/link generation for quick communication.
