sions');
console.log('- Missing import additions');
console.log('- Auth module path fixes');
console.log('- Missing updatedAt field additions');

console.log('\n🔍 Run "npm run type-check" to verify remaining issues');;
const { execSync } = require('child_process');

try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client regenerated successfully');
} catch (error) {
  console.error('❌ Failed to regenerate Prisma client:', error.message);
}

console.log('\n📊 Summary of fixes applied:');
console.log('- NextAuth import fixes');
console.log('- Prisma type import corrections');
console.log('- Enum value standardization');
console.log('- Field name corrections');
console.log('- ID type conver');
    const result = applyFixes(filePath, content);
    
    if (result.changes > 0) {
      fs.writeFileSync(filePath, result.content);
      console.log(`✅ ${filePath}: ${result.changes} fixes applied`);
      totalChanges += result.changes;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Completed! Applied ${totalChanges} total fixes across all files`);

// Regenerate Prisma client
console.log('\n🔄 Regenerating Prisma client...')ntent.includes('updatedAt') && !dataContent.includes('createdAt')) {
      const newDataContent = dataContent + ',\n    updatedAt: new Date()';
      changes++;
      return match.replace(dataContent, newDataContent);
    }
    return match;
  });

  return { content: modified, changes };
}

// Process all TypeScript files
const files = findFiles('./src');
console.log(`📁 Found ${files.length} TypeScript files to process`);

files.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8ified = `import { ActivityType } from '@prisma/client';\n${modified}`;
    changes++;
  }

  // 10. Fix auth module imports
  if (modified.includes("'~/auth'") || modified.includes('"~/auth"')) {
    modified = modified.replace(/['"]~\/auth['"]/g, '"@/lib/auth"');
    changes++;
  }

  // 11. Fix missing updatedAt in create operations
  const createOperationPattern = /\.create\(\s*{\s*data:\s*{([^}]+)}\s*}\s*\)/g;
  modified = modified.replace(createOperationPattern, (match, dataContent) => {
    if (!dataCo.includes('UserRole.') && !modified.includes('import') && !modified.includes('UserRole')) {
    modified = `import { UserRole } from '@prisma/client';\n${modified}`;
    changes++;
  }

  if (modified.includes('QuoteStatus.') && !modified.includes('import') && !modified.includes('QuoteStatus')) {
    modified = `import { QuoteStatus } from '@prisma/client';\n${modified}`;
    changes++;
  }

  if (modified.includes('ActivityType.') && !modified.includes('import') && !modified.includes('ActivityType')) {
    modch(fix => {
    if (fix.from.test(modified)) {
      modified = modified.replace(fix.from, fix.to);
      changes++;
    }
  });

  // 8. Fix activity type enums
  const activityTypeFixes = [
    { from: /'cart_add'/g, to: 'ActivityType.CART_ADD' },
    { from: /'cart_remove'/g, to: 'ActivityType.CART_REMOVE' }
  ];

  activityTypeFixes.forEach(fix => {
    if (fix.from.test(modified)) {
      modified = modified.replace(fix.from, fix.to);
      changes++;
    }
  });

  // 9. Fix missing imports
  if (modified= lines[i]) {
            lines[i] = newLine;
            changes++;
          }
        }
      });
    }
  }
  modified = lines.join('\n');

  // 7. Fix ID type mismatches (string vs number)
  const idFixes = [
    // Convert string IDs to numbers where needed
    { from: /id:\s*params\.id/g, to: 'id: parseInt(params.id)' },
    { from: /userId:\s*session\.user\.id/g, to: 'userId: parseInt(session.user.id)' },
    { from: /quoteId:\s*params\.quoteId/g, to: 'quoteId: parseInt(params.quoteId)' }
  ];

  idFixes.forEaeFixes = [
    { from: /brand:/g, to: 'brands:' },
    { from: /category:/g, to: 'categories:' },
    { from: /user:/g, to: 'users:' }
  ];

  // Apply include fixes only in include/select contexts
  const lines = modified.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('include:') || lines[i].includes('select:')) {
      includeFixes.forEach(fix => {
        if (fix.from.test(lines[i])) {
          const newLine = lines[i].replace(fix.from, fix.to);
          if (newLine != Fix lines field (use quote_lines instead)
    { from: /lines:/g, to: 'quote_lines:' },
    // Fix label field in addresses (remove if not in schema)
    { from: /,?\s*label:\s*[^,}]+/g, to: '' },
    // Fix senderRole field (remove if not in schema)
    { from: /,?\s*senderRole:\s*[^,}]+/g, to: '' }
  ];

  fieldFixes.forEach(fix => {
    if (fix.from.test(modified)) {
      modified = modified.replace(fix.from, fix.to);
      changes++;
    }
  });

  // 6. Fix include/select object properties
  const includ^,}]+/g, to: '' },
    // Fix isNewUser field (remove if not in schema)
    { from: /,?\s*isNewUser:\s*[^,}]+/g, to: '' },
    // Fix lastLogin field (remove if not in schema)
    { from: /,?\s*lastLogin:\s*[^,}]+/g, to: '' },
    // Fix sessionId field (remove if not in schema)
    { from: /,?\s*sessionId:\s*[^,}]+/g, to: '' },
    // Fix timestamp field (use createdAt instead)
    { from: /timestamp:/g, to: 'createdAt:' },
    // Fix read field (use isRead instead)
    { from: /read:/g, to: 'isRead:' },
    //"]/g, to: 'role === UserRole.ADMIN' },
    { from: /role\s*!==\s*['"]admin['"]/g, to: 'role !== UserRole.ADMIN' }
  ];

  enumFixes.forEach(fix => {
    if (fix.from.test(modified)) {
      modified = modified.replace(fix.from, fix.to);
      changes++;
    }
  });

  // 5. Fix missing fields in Prisma operations
  const fieldFixes = [
    // Fix hashedPassword -> password
    { from: /hashedPassword/g, to: 'password' },
    // Fix companyName field (remove if not in schema)
    { from: /,?\s*companyName:\s*[reInput' },
    { from: /NegotiationMessageCreateWithoutQuoteInput/g, to: 'quote_messagesCreateWithoutQuotesInput' }
  ];

  getPayloadFixes.forEach(fix => {
    if (fix.from.test(modified)) {
      modified = modified.replace(fix.from, fix.to);
      changes++;
    }
  });

  // 4. Fix enum values
  const enumFixes = [
    { from: /'draft'/g, to: 'QuoteStatus.DRAFT' },
    { from: /'pending'/g, to: 'QuoteStatus.PENDING' },
    { from: /'admin'/g, to: 'UserRole.ADMIN' },
    { from: /role\s*===\s*['"]admin['oadFixes = [
    { from: /AdminNotificationGetPayload/g, to: 'admin_notificationsGetPayload' },
    { from: /AnalyticsEventGetPayload/g, to: 'analytics_eventsGetPayload' },
    { from: /FormSubmissionGetPayload/g, to: 'form_submissionsGetPayload' },
    { from: /LeadGetPayload/g, to: 'leadsGetPayload' },
    { from: /NewsletterSubscriberGetPayload/g, to: 'newsletter_subscribersGetPayload' },
    { from: /QuoteMessageGetPayload/g, to: 'quote_messagesGetPayload' },
    { from: /ProductWhereInput/g, to: 'productsWheuote_messages', context: 'import.*@prisma/client' }
  ];

  prismaTypeFixes.forEach(fix => {
    const lines = modified.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('@prisma/client') && fix.from.test(lines[i])) {
        const newLine = lines[i].replace(fix.from, fix.to);
        if (newLine !== lines[i]) {
          lines[i] = newLine;
          changes++;
        }
      }
    }
    modified = lines.join('\n');
  });

  // 3. Fix Prisma GetPayload types
  const getPaylddresses', context: 'import.*@prisma/client' },
    { from: /\bBrand\b/g, to: 'brands', context: 'import.*@prisma/client' },
    { from: /\bUser\b/g, to: 'users', context: 'import.*@prisma/client' },
    { from: /\bNotification\b/g, to: 'notifications', context: 'import.*@prisma/client' },
    { from: /\bProductView\b/g, to: 'product_views', context: 'import.*@prisma/client' },
    { from: /\bSearchQuery\b/g, to: 'search_queries', context: 'import.*@prisma/client' },
    { from: /\bNegotiationMessage\b/g, to: 'qimport { withAuth } from "next-auth/middleware"'
    },
    {
      pattern: /import\s*{\s*NextRequestWithAuth\s*}\s*from\s*['"]next-auth\/middleware['"]/g,
      replacement: 'import type { NextRequestWithAuth } from "next-auth/middleware"'
    }
  ];

  nextAuthFixes.forEach(fix => {
    if (fix.pattern.test(modified)) {
      modified = modified.replace(fix.pattern, fix.replacement);
      changes++;
    }
  });

  // 2. Fix Prisma type imports
  const prismaTypeFixes = [
    { from: /\bAddress\b/g, to: 'andsWith(ext))) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

function applyFixes(filePath, content) {
  let modified = content;
  let changes = 0;

  // 1. Fix NextAuth imports (critical)
  const nextAuthFixes = [
    {
      pattern: /import\s*{\s*getServerSession\s*}\s*from\s*['"]next-auth\/next['"]/g,
      replacement: 'import { getServerSession } from "next-auth"'
    },
    {
      pattern: /import\s*{\s*withAuth\s*}\s*from\s*['"]next-auth\/middleware['"]/g,
      replacement: 'ror fixes...');

// Track changes
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
      if (extensions.some(ext => file.e#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting comprehensive TypeScript er