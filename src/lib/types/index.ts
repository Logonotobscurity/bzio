
/**
 * Central type exports
 * 
 * All application types are re-exported from here for easy access
 * Import from: @/lib/types or @/lib/types/{domain|api|store}
 */

// Domain types (Database entities)
export * from './domain';

// API types (Request/Response DTOs)
export * from './api';

// Store types (State management)
export * from './store';

// Email-specific types
export interface ISendEmailOptions {
    to: string;
    subject: string;
    react: React.ReactElement;
    from?: string;
  }
  