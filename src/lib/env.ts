import { z } from 'zod';

/**
 * Environment variable schema for production readiness
 * Ensures all required variables are present and correctly formatted
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Authentication
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1),

  // Monitoring & Monitoring API
  MONITORING_API_KEY: z.string().min(1).optional(),

  // App
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

/**
 * Validated environment variables
 */
const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error('❌ Invalid environment variables:', envParsed.error.format());

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Invalid environment variables. Fix them before running in production.');
  }
}

export const env = envParsed.success ? envParsed.data : process.env as unknown as z.infer<typeof envSchema>;
