#!/usr/bin/env node

/**
 * Fix only Prisma model names - no other changes
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Prisma model name mappings (schema name -> incorrect code usage)
const PRISMA_MODEL_FIXES = {
  'addresses': ['address'],
  'brands': ['brand'],
  'categories': ['category'],
  'companies': ['company'],
  'products': ['product'],
  'notifications': ['notification'],
  'quotes': ['quote'],
  'users': ['user'],
  'analytics_events': ['analyticsEvent'],
  'quote_messages': ['quoteMessage'],
  'product_views': ['productView'],
  'search_queries': ['searchQuery']
};

function findTSFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(item)) {
          traverse(fullPath);
        }
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function fixPrismaModelNames(content) {
  let fixed = content;
  
  // Fix prisma.modelName.method() calls ONLY
  for (const [correctName, incorrectNames] of Object.entries(PRISMA_MODEL_FIXES)) {
    for (const incorrectName of incorrectNames) {
      const regex = new RegExp(`prisma\\.${incorrectName}\\.`, 'g');
      fixed = fixed.replace(regex, `prisma.${correctName}.`);
    }
  }
  
  return fixed;
}

function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixed = content;
    
    // Apply only Prisma model name fixes
    fixed = fixPrismaModelNames(fixed);
    
    // Only write if content changed
    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch {
    console.error(`❌ Error fixing ${filePath}`);
    return false;
  }
}

function main() {
  console.log('🔧 Fixing Prisma model names only...\n');
  
  const srcDir = path.join(process.cwd(), 'src');
  const scriptsDir = path.join(process.cwd(), 'scripts');
  const prismaDir = path.join(process.cwd(), 'prisma');
  
  const allFiles = [
    ...findTSFiles(srcDir),
    ...findTSFiles(scriptsDir),
    ...findTSFiles(prismaDir)
  ];
  
  console.log(`📁 Processing ${allFiles.length} TypeScript files\n`);
  
  let fixedCount = 0;
  
  for (const file of allFiles) {
    if (fixFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed ${fixedCount} files\n`);
  
  // Regenerate Prisma client
  console.log('🔄 Regenerating Prisma client...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client regenerated successfully\n');
  } catch {
    console.error('❌ Failed to regenerate Prisma client');
  }
  
  // Run type check to see remaining errors
  console.log('🔍 Running type check to verify fixes...');
  try {
    execSync('npm run typecheck', { stdio: 'inherit' });
    console.log('✅ All TypeScript errors fixed!');
  } catch {
    console.log('⚠️  Some TypeScript errors remain. Check output above.');
  }
}

// Run the fixes
main();

export { fixFile, findTSFiles };