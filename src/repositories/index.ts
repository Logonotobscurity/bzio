/**
 * Repository Exports
 * 
 * Central export point for all data repositories
 * Each repository handles data access for a specific domain entity
 */

// Product Catalog Repositories
import * as brandDbRepo from './db/brandRepository';
import * as brandStaticRepo from './static/brandRepository';
import * as categoryDbRepo from './db/categoryRepository';
import * as categoryStaticRepo from './static/categoryRepository';
import * as companyDbRepo from './db/companyRepository';
import * as companyStaticRepo from './static/companyRepository';
import * as productDbRepo from './db/productRepository';
import * as productStaticRepo from './static/productRepository';

// Domain Repositories
export { userRepository, UserRepository } from './user.repository';
export { quoteRepository, QuoteRepository } from './quote.repository';
export { addressRepository, AddressRepository } from './address.repository';
export { notificationRepository, NotificationRepository } from './notification.repository';
export { adminNotificationRepository, AdminNotificationRepository } from './admin-notification.repository';
export { analyticsEventRepository, AnalyticsEventRepository } from './analytics-event.repository';
export { errorLogRepository, ErrorLogRepository } from './error-log.repository';
export { formSubmissionRepository, FormSubmissionRepository } from './form-submission.repository';
export { leadRepository, LeadRepository } from './lead.repository';
export { newsletterSubscriberRepository, NewsletterSubscriberRepository } from './newsletter-subscriber.repository';
export { quoteMessageRepository, QuoteMessageRepository } from './quote-message.repository';

// Base Repository
export { BaseRepository, prisma } from './base.repository';

// Use database if DATABASE_URL is set and USE_DATABASE is true
const useDatabase = process.env.DATABASE_URL && process.env.USE_DATABASE === 'true';

export const brandRepository = useDatabase ? brandDbRepo : brandStaticRepo;
export const categoryRepository = useDatabase ? categoryStaticRepo : categoryDbRepo;
export const companyRepository = useDatabase ? companyStaticRepo : companyDbRepo;
export const productRepository = useDatabase ? productStaticRepo : productDbRepo;
