
import { createClient } from 'redis';

// Create a global variable to hold the Redis client instance
let redisClient: ReturnType<typeof createClient> | null = null;

// Create an async function to initialize and connect the Redis client
const initializeRedis = async () => {
  if (redisClient) {
    return redisClient;
  }

  const client = createClient({
    url: 'redis://localhost:6379' // Replace with your Redis URL
  });

  client.on('error', (err: unknown) => console.log('Redis Client Error', err));

  await client.connect();
  redisClient = client;
  return redisClient;
};

export const getCache = async (key: string): Promise<string | null> => {
  const client = await initializeRedis();
  if (!client) return null;
  const value = await client.get(key);
  if (value === null) return null;
  if (typeof value === 'string') return value;
  // Handle Buffer case
  return value.toString();
};

export const setCache = async (key: string, value: string, options?: Record<string, unknown>): Promise<string | null> => {
  const client = await initializeRedis();
  if (!client) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await client.set(key, value, options as any);
  if (result === null) return null;
  if (typeof result === 'string') return result;
  return result.toString();
};
