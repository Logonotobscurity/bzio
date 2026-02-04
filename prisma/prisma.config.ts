import { defineConfig } from '@prisma/sdk';

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
