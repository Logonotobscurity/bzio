#!/usr/bin/env node

/**
 * Fix broken syntax from updatedAt additions
 */

import fs from 'fs';

const BROKEN_FILES = [
  'scripts/check-admin.ts',
  'src/app/account/_actions/settings.ts', 
  'src/app/admin/_actions/users.ts',
  'src/app/api/admin/activities/route.ts'
];

function fixBrokenSyntax(content) {
  let fixed = content;
  
  // Remove broken updatedAt additions
  fixed = fixed.replace(/,\s*updatedAt:\s*new\s*Date\(\)\s*}/g, '}');
  fixed = fixed.replace(/{\s*,\s*updatedAt:\s*new\s*Date\(\)\s*}/g, '{}');
  
  return fixed;
}

function main() {
  console.log('🔧 Fixing broken syntax...\n');
  
  for (const filePath of BROKEN_FILES) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fixed = fixBrokenSyntax(content);
        
        if (fixed !== content) {
          fs.writeFileSync(filePath, fixed, 'utf8');
          console.log(`✅ Fixed: ${filePath}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
  }
  
  console.log('\n🎉 Syntax fixes complete!');
}

main();