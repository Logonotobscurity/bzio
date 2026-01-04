-- Add performance indexes for dashboard queries

-- User indexes
CREATE INDEX IF NOT EXISTS "users_createdAt_idx" ON "users"("createdAt");
CREATE INDEX IF NOT EXISTS "users_lastLogin_idx" ON "users"("last_login");
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");

-- Quote indexes
CREATE INDEX IF NOT EXISTS "Quote_userId_idx" ON "Quote"("userId");
CREATE INDEX IF NOT EXISTS "Quote_createdAt_idx" ON "Quote"("createdAt");
CREATE INDEX IF NOT EXISTS "Quote_status_idx" ON "Quote"("status");

-- FormSubmission indexes
CREATE INDEX IF NOT EXISTS "FormSubmission_formType_idx" ON "FormSubmission"("formType");
CREATE INDEX IF NOT EXISTS "FormSubmission_submittedAt_idx" ON "FormSubmission"("submittedAt");
CREATE INDEX IF NOT EXISTS "FormSubmission_status_idx" ON "FormSubmission"("status");

-- NewsletterSubscriber indexes
CREATE INDEX IF NOT EXISTS "NewsletterSubscriber_email_idx" ON "NewsletterSubscriber"("email");
CREATE INDEX IF NOT EXISTS "NewsletterSubscriber_status_idx" ON "NewsletterSubscriber"("status");
CREATE INDEX IF NOT EXISTS "NewsletterSubscriber_subscribedAt_idx" ON "NewsletterSubscriber"("subscribedAt");

-- AnalyticsEvent indexes
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_eventType_idx" ON "AnalyticsEvent"("eventType");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_userId_idx" ON "AnalyticsEvent"("userId");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_timestamp_idx" ON "AnalyticsEvent"("timestamp");

-- SystemNotification indexes
CREATE INDEX IF NOT EXISTS "SystemNotification_targetSystem_read_idx" ON "SystemNotification"("targetSystem", "read");
CREATE INDEX IF NOT EXISTS "SystemNotification_createdAt_idx" ON "SystemNotification"("createdAt");
