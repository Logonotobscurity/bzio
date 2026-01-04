/**
 * Base Repository
 * 
 * Abstract base class for all repositories
 * Provides common CRUD operations and patterns
 */

import { prisma } from '@/lib/db';

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  /**
   * Find all records
   */
  abstract findAll(): Promise<T[]>;

  /**
   * Find by ID
   */
  abstract findById(id: string | number): Promise<T | null>;

  /**
   * Create a new record
   */
  abstract create(data: CreateInput): Promise<T>;

  /**
   * Update a record
   */
  abstract update(id: string | number, data: UpdateInput): Promise<T>;

  /**
   * Delete a record
   */
  abstract delete(id: string | number): Promise<boolean>;

  /**
   * Count records matching criteria
   */
  abstract count(where?: Record<string, unknown>): Promise<number>;

  /**
   * Protected helper to handle database errors
   */
  protected handleError(error: unknown, context: string): never {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Repository Error - ${context}]`, message);
    throw error;
  }
}

export { prisma };
