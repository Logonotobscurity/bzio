// Export React Query client configuration
export { makeQueryClient, getQueryClient } from './client';

// Export all hooks and types
export type {
  Product,
  Brand,
  Category,
  QuoteRequest,
  FormSubmission,
  NewsletterSubscription,
} from './hooks';

export {
  // Query hooks
  useProducts,
  useCategories,
  useBrands,
  useQuoteRequests,
  useFormSubmissions,
  useNewsletterSubscriptions,
  // Mutation hooks
  useCreateQuoteRequest,
  useSubmitContactForm,
  useSubscribeNewsletter,
  // Utility hooks
  useInvalidateQuery,
  // API functions
  fetchProducts,
  fetchCategories,
  fetchBrands,
  fetchQuoteRequests,
  fetchFormSubmissions,
  createQuoteRequest,
  submitContactForm,
  subscribeNewsletter,
} from './hooks';
