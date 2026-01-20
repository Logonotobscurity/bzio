#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔧 Applying targeted TypeScript error fixes...');

let totalChanges = 0;

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

function applyTargetedFixes(filePath, content) {
  let modified = content;
  let changes = 0;

  // 1. Fix NextAuth imports (most critical)
  if (modified.includes('next-auth/next')) {
    modified = modified.replace(/from\s*['"]next-auth\/next['"]/g, 'from "next-auth"');
    changes++;
  }

  // 2. Fix specific Prisma model name issues (only the clear ones)
  const modelReplacements = [
    { from: /prisma\.adminNotification\b/g, to: 'prisma.admin_notifications' },
    { from: /prisma\.formSubmission\b/g, to: 'prisma.form_submissions' },
    { from: /prisma\.newsletterSubscriber\b/g, to: 'prisma.newsletter_subscribers' },
    { from: /prisma\.cartItem\b/g, to: 'prisma.cart_items' },
    { from: /prisma\.errorLog\b/g, to: 'prisma.error_logs' },
    { from: /prisma\.crmNotification\b/g, to: 'prisma.notifications' },
    { from: /prisma\.userActivity\b/g, to: 'prisma.user_activities' },
    { from: /prisma\.negotiationMessage\b/g, to: 'prisma.quote_messages' }
  ];

  modelReplacements.forEach(replacement => {
    if (replacement.from.test(modified)) {
      modified = modified.replace(replacement.from, replacement.to);
      changes++;
    }
  });

  // 3. Fix enum values (only exact matches)
  const enumReplacements = [
    { from: /status:\s*['"]draft['"]/g, to: 'status: "DRAFT"' },
    { from: /status:\s*['"]pending['"]/g, to: 'status: "PENDING"' },
    { from: /===\s*['"]admin['"]/g, to: '=== "ADMIN"' },
    { from: /!==\s*['"]admin['"]/g, to: '!== "ADMIN"' },
    { from: /role:\s*['"]admin['"]/g, to: 'role: "ADMIN"' }
  ];

  enumReplacements.forEach(replacement => {
    if (replacement.from.test(modified)) {
      modified = modified.replace(replacement.from, replacement.to);
      changes++;
    }
  });

  // 4. Fix hashedPassword field name
  if (modified.includes('hashedPassword')) {
    modified = modified.replace(/hashedPassword/g, 'password');
    changes++;
  }

  // 5. Fix ID type conversions (only in specific contexts)
  if (modified.includes('params.id') && !modified.includes('parseInt(params.id)')) {
    modified = modified.replace(/id:\s*params\.id(?!\w)/g, 'id: parseInt(params.id)');
    changes++;
  }

  // 6. Fix auth module imports
  if (modified.includes("'~/auth'") || modified.includes('"~/auth"')) {
    modified = modified.replace(/['"]~\/auth['"]/g, '"@/lib/auth"');
    changes++;
  }

  return { content: modified, changes };
}

// Process all TypeScript files
const files = findFiles('./src');
console.log(`📁 Processing ${files.length} files...`);

files.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = applyTargetedFixes(filePath, content);
    
    if (result.changes > 0) {
      fs.writeFileSync(filePath, result.content);
      console.log(`✅ ${filePath}: ${result.changes} fixes`);
      totalChanges += result.changes;
    }
  } catch (error) {
    console.error(`❌ ${filePath}: ${error.message}`);
  }
});

console.log(`\n🎉 Applied ${totalChanges} targeted fixes`);