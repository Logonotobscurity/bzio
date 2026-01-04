#!/usr/bin/env node

/**
 * Admin Setup Script - Create/Replace Admin User
 * Wrapper that loads environment and calls the TypeScript implementation
 */

import { spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// Helper to load .env
function loadEnv() {
  const envPath = join(process.cwd(), '.env');
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const equalsIndex = trimmed.indexOf('=');
        if (equalsIndex > -1) {
          const key = trimmed.substring(0, equalsIndex).trim();
          let value = trimmed.substring(equalsIndex + 1).trim();
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
    console.log('✅ Loaded environment from .env');
    return true;
  }
  console.log('⚠️  .env file not found');
  return false;
}

// Load environment
loadEnv();

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

// Use tsx directly
console.log('🔄 Starting admin setup...\n');

const tsxPath = join(process.cwd(), 'node_modules', '.bin', 'tsx');
const proc = spawn(tsxPath, ['scripts/setup-admin-impl.ts'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: process.env,
});

proc.on('close', (code) => {
  process.exit(code || 0);
});

proc.on('error', (err) => {
  console.error('❌ Failed to run setup:', err.message);
  process.exit(1);
});

