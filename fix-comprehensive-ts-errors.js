#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔧 Starting comprehensive TypeScript error fixes...');

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

function applyFixes(filePath, content) {
  let modified = content;
  let changes = 0;

  // 1. Fix NextAuth imports
  if (modified.includes('next-auth/next')) {
    modified = modified.replace(/from\s*['"]next-auth\/next['"]/g, 'from "next-auth"');
    changes++;
  }

  // 2. Fix Prisma model names in queries
  const modelFixes = [
    { from: /\.adminNotification\./g, to: '.admin_notifications.' },
    { from: /\.formSubmission\./g, to: '.form_submissions.' },
    { from: /\.newsletterSubscriber\./g, to: '.newsletter_subscribers.' },
    { from: /\.cartItem\./g, to: '.cart_items.' },
    { from: /\.errorLog\./g, to: '.error_logs.' },
    { from: /\.negotiationMessage\./g, to: '.quote_messages.' },
    { from: /\.userActivity\./g, to: '.user_activities.' },
    { from: /\.crmNotification\./g, to: '.notifications.' },
    { from: /\.quoteEvent\./g, to: '.quote_events.' }
  ];

  modelFixes.forEach(fix => {
    if (fix.from.test(modified)) {
      modified = modified.replace(fix.from, fix.to);
      changes++;
    }
  });

  // 3. Fix enum values
  const enumFixes = [
    { from: /:\s*['"]draft['"]/g, to: ': "DRAFT"' },
    { from: /:\s*['"]pending['"]/g, to: ': "PENDING"' },
    { from: /===\s*['"]admin['"]/g, to: '=== "ADMIN"' },
    { from: /!==\s*['"]admin['"]/g, to: '!== "ADMIN"' }
  ];

  enumFixes.forEach(fix => {
    if (fix.from.test(modified)) {
      modified = modified.replace(fix.from, fix.to);
      changes++;
    }
  });

  // 4. Fix field names
  modified = modified.replace(/hashedPassword/g, 'password');
  modified = modified.replace(/\blines:/g, 'quote_lines:');
  modified = modified.replace(/\bread:/g, 'isRead:');
  
  // Remove non-existent fields
  modified = modified.replace(/,?\s*companyName:\s*[^,}]+/g, '');
  modified = modified.replace(/,?\s*sessionId:\s*[^,}]+/g, '');
  modified = modified.replace(/,?\s*timestamp:\s*[^,}]+/g, '');
  modified = modified.replace(/,?\s*senderRole:\s*[^,}]+/g, '');
  modified = modified.replace(/,?\s*label:\s*[^,}]+/g, '');
  
  if (modified !== content) {
    changes++;
  }

  // 5. Fix ID conversions
  modified = modified.replace(/id:\s*params\.id(?!\w)/g, 'id: parseInt(params.id)');
  modified = modified.replace(/userId:\s*session\.user\.id(?!\w)/g, 'userId: parseInt(session.user.id)');
  
  // 6. Fix include/select properties
  const includePattern = /(include|select):\s*{[^}]*}/g;
  modified = modified.replace(includePattern, (match) => {
    return match
      .replace(/\bbrand:/g, 'brands:')
      .replace(/\bcategory:/g, 'categories:')
      .replace(/\buser:/g, 'users:');
  });

  return { content: modified, changes };
}

// Process files
const files = findFiles('./src');
console.log(`📁 Processing ${files.length} files...`);

files.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = applyFixes(filePath, content);
    
    if (result.changes > 0) {
      fs.writeFileSync(filePath, result.content);
      console.log(`✅ ${filePath}: ${result.changes} fixes`);
      totalChanges += result.changes;
    }
  } catch (error) {
    console.error(`❌ ${filePath}: ${error.message}`);
  }
});

console.log(`\n🎉 Applied ${totalChanges} total fixes`);