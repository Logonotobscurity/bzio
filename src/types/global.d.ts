// Global type declarations for the application

/**
 * Application configuration type
 * Contains API endpoints, environment info, and feature flags
 */
type AppConfig = {
  apiUrl: string;
  environment: 'development' | 'production' | 'test';
  version: string;
  features: Record<string, boolean>;
};

/**
 * Global Window interface extensions
 */
declare global {
  interface Window {
    __MY_APP_CONFIG__?: AppConfig;
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      API_URL: string;
      DATABASE_URL: string;
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;
      NEXT_PUBLIC_API_URL?: string;
    }
  }
}

export {};
