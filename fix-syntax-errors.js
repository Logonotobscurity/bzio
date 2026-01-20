#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔧 Fixing syntax errors caused by automated fixes...');

let totalChanges = 0;

// eslint-disable-next-line no-unused-vars
function findFiles(dir, extensions = ['.ts', '.tsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        results = results.concat(findFiles(filePath, extensions));
      }
    } else {
      if (extensions.some(ext => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

function fixSyntaxErrors(filePath, content) {
  let modified = content;
  let changes = 0;

  // Fix broken object properties (remove empty properties)
  modified = modified.replace(/,\s*,/g, ',');
  modified = modified.replace(/{\s*,/g, '{');
  modified = modified.replace(/,\s*}/g, '}');
  
  // Fix broken function calls and object literals
  modified = modified.replace(/\(\s*,/g, '(');
  modified = modified.replace(/,\s*\)/g, ')');
  
  // Fix broken array literals
  modified = modified.replace(/\[\s*,/g, '[');
  modified = modified.replace(/,\s*\]/g, ']');
  
  // Fix broken import statements
  modified = modified.replace(/import\s*{\s*,/g, 'import {');
  modified = modified.replace(/,\s*}\s*from/g, '} from');
  
  // Fix broken type annotations
  modified = modified.replace(/:\s*,/g, ': any,');
  modified = modified.replace(/:\s*}/g, ': any}');
  
  // Fix broken JSX attributes
  modified = modified.replace(/=\s*,/g, '=""');
  modified = modified.replace(/=\s*>/g, '="">');
  
  if (modified !== content) {
    changes = 1;
  }

  return { content: modified, changes };
}

// Process files with syntax errors
const problematicFiles = [
  'src/app/about/page.tsx',
  'src/app/account/_actions/dashboard.ts',
  'src/app/account/_actions/settings.ts',
  'src/app/account/_types/dashboard.ts',
  'src/app/account/page.tsx',
  'src/app/admin/_actions/activities.ts',
  'src/app/admin/_components/DashboardFilters.tsx',
  'src/app/admin/AdminDashboardClient.tsx',
  'src/app/api/admin/customers/data/route.ts',
  'src/app/api/admin/customers/route.ts',
  'src/app/api/admin/db-diagnostics/route.ts',
  'src/app/api/admin/errors/route.ts',
  'src/app/api/diagnostics/database/route.ts',
  'src/app/api/monitoring/metrics/route.ts',
  'src/careers/page.tsx',
  'src/companies/[slug]/page.tsx',
  'src/companies/page.tsx',
  'src/compliance/page.tsx',
  'src/customers/page.tsx',
  'src/news/page.tsx',
  'src/products/brand/[slug]/page.tsx',
  'src/products/brands/page.tsx',
  'src/products/categories/page.tsx',
  'src/products/category/[slug]/page.tsx',
  'src/components/layout/header.tsx',
  'src/components/quote-request-form.tsx',
  'src/components/sections/about/CompanyStats.tsx',
  'src/components/ui/password-strength-meter.tsx',
  'src/lib/activity-service.ts',
  'src/lib/auth-role-utils.ts',
  'src/lib/auth-utils.ts',
  'src/lib/auth/config.ts',
  'src/lib/auth/constants.ts',
  'src/lib/performance-monitor.ts',
  'src/lib/schema.ts',
  'src/lib/store/activity.ts',
  'src/lib/types/domain.ts',
  'src/lib/types/store.ts',
  'src/lib/utils/error-logger.ts',
  'src/lib/web-vitals.ts',
  'src/services/enrichmentService.ts',
  'src/services/errorLoggingService.ts',
  'src/services/form.service.ts',
  'src/stores/activity.ts'
];

console.log(`📁 Processing ${problematicFiles.length} files with syntax errors...`);

problematicFiles.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const result = fixSyntaxErrors(filePath, content);
      
      if (result.changes > 0) {
        fs.writeFileSync(filePath, result.content);
        console.log(`✅ ${filePath}: Fixed syntax errors`);
        totalChanges += result.changes;
      }
    }
  } catch (error) {
    console.error(`❌ ${filePath}: ${error.message}`);
  }
});

console.log(`\n🎉 Fixed syntax errors in ${totalChanges} files`);