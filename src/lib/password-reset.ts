/**
 * Shared in-memory token store for password resets
 * In production, this should be replaced with a database model (e.g., PasswordResetToken)
 * or a Redis-based store for distributed environments.
 */

export interface TokenData {
  userId: number;
  email: string;
  expiresAt: Date;
}

// Singleton token store
export const tokenStore = new Map<string, TokenData>();

/**
 * Periodically clean up expired tokens
 */
export function cleanExpiredTokens() {
  const now = new Date();
  for (const [key, value] of tokenStore.entries()) {
    if (value.expiresAt < now) {
      tokenStore.delete(key);
    }
  }
}
