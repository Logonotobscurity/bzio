-- Create QuoteMessage table for quote-specific communication
CREATE TABLE IF NOT EXISTS "QuoteMessage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "quoteId" TEXT NOT NULL,
  "senderId" INTEGER,
  "senderEmail" TEXT NOT NULL,
  "senderName" TEXT,
  "senderRole" TEXT NOT NULL DEFAULT 'customer', -- 'customer' or 'admin'
  "message" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "attachmentUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuoteMessage_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE
);

-- Create indexes for message queries
CREATE INDEX IF NOT EXISTS "QuoteMessage_quoteId_idx" ON "QuoteMessage"("quoteId");
CREATE INDEX IF NOT EXISTS "QuoteMessage_createdAt_idx" ON "QuoteMessage"("createdAt");
CREATE INDEX IF NOT EXISTS "QuoteMessage_isRead_idx" ON "QuoteMessage"("isRead");
