/**
 * Services Module - Public API
 *
 * This file exports all service classes that handle business logic.
 * Services wrap repositories and contain application-specific logic.
 *
 * Architecture:
 * API Routes/Server Actions → Services → Repositories → Database
 *
 * Usage in API Routes:
 * ```typescript
 * import { formService, leadService } from '@/services';
 *
 * export async function POST(request: Request) {
 *   const data = await request.json();
 *   const result = await formService.submitForm(data);
 *   return Response.json(result);
 * }
 * ```
 *
 * Usage in Server Actions:
 * ```typescript
 * 'use server';
 *
 * import { newsletterService } from '@/services';
 *
 * export async function subscribeNewsletter(email: string) {
 *   return await newsletterService.subscribe({ email });
 * }
 * ```
 */

// Form Service
export { FormService, formService } from './form.service';

// Newsletter Service
export { NewsletterService, newsletterService } from './newsletter.service';

// Notification Service
export { AdminNotificationService, adminNotificationService } from './admin-notification.service';

// Quote Message Service
export { QuoteMessageService, quoteMessageService } from './quote-message.service';

// Lead Service
export { LeadService, leadService } from './lead.service';

// Quote Service
export { QuoteService, quoteService } from './quote.service';

// Error Logging Service
export { ErrorLoggingService, errorLoggingService } from './error-logging.service';

/**
 * Export all services as a namespace for bulk imports
 *
 * Usage:
 * ```typescript
 * import * as services from '@/services';
 *
 * const form = await services.formService.submitForm(data);
 * const lead = await services.leadService.createLead(data);
 * ```
 */
export * from './form.service';
export * from './newsletter.service';
export * from './admin-notification.service';
export * from './quote-message.service';
export * from './lead.service';
export * from './quote.service';
export * from './error-logging.service';
