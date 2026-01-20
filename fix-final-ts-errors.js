esult.changes > 0) {
        fs.writeFileSync(filePath, result.content);
        console.log(`✅ ${filePath}: ${result.changes} fixes`);
        totalChanges += result.changes;
      }
    }
  } catch (error) {
    console.error(`❌ ${filePath}: ${error.message}`);
  }
});

console.log(`\n🎉 Applied ${totalChanges} final fixes`);s',
  'src/app/account/_actions/settings.ts',
  'src/app/account/_components/UserAccountDetails.tsx',
  'src/app/account/_components/UserStatsCards.tsx',
  'prisma/seed-products.ts',
  'scripts/check-admin.ts',
  'scripts/create-admin.ts'
];

console.log(`📁 Processing ${filesToFix.length} files...`);

filesToFix.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const result = applyFinalFixes(filePath, content);
      
      if (r modified.includes('type: ActivityType')) {
    modified = modified.replace(
      /{\s*id:\s*[^,}]+,\s*type:\s*[^,}]+,\s*description:\s*[^,}]+,\s*metadata:\s*[^}]+\s*}/g,
      (match) => {
        if (!match.includes('timestamp')) {
          return match.replace('}', ', timestamp: new Date() }');
        }
        return match;
      }
    );
    changes++;
  }

  return { content: modified, changes };
}

// Process specific files with remaining errors
const filesToFix = [
  'src/app/account/_actions/dashboard.tme:\s*[^,}]+[^}]*)\s*}/g
  ];

  createPatterns.forEach(pattern => {
    modified = modified.replace(pattern, (match, dataContent) => {
      if (!dataContent.includes('updatedAt') && !dataContent.includes('createdAt')) {
        const newDataContent = dataContent + ',\n    updatedAt: new Date()';
        changes++;
        return match.replace(dataContent, newDataContent);
      }
      return match;
    });
  });

  // Add missing timestamp field to activity items
  if (filePath.includes('dashboard.ts') && {
    modified = modified.replace(/\.company\./g, '.companies.');
    changes++;
  }

  if (modified.includes('.quoteLines')) {
    modified = modified.replace(/\.quoteLines/g, '.quote_lines');
    changes++;
  }

  // Fix Prisma model names
  if (modified.includes('.notificationPreferences')) {
    modified = modified.replace(/\.notificationPreferences/g, '.notification_preferences');
    changes++;
  }

  // Add missing updatedAt fields in create operations
  const createPatterns = [
    /data:\s*{\s*([^}]*namodified.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('include:') || lines[i].includes('select:')) {
      relationFixes.forEach(fix => {
        if (fix.from.test(lines[i])) {
          const newLine = lines[i].replace(fix.from, fix.to);
          if (newLine !== lines[i]) {
            lines[i] = newLine;
            changes++;
          }
        }
      });
    }
  }
  modified = lines.join('\n');

  // Fix property access issues
  if (modified.includes('.company.'))++;
  }

  // Fix cache constant references
  if (modified.includes('CACHE_DURATION.SHORT')) {
    modified = modified.replace(/CACHE_DURATION\.SHORT/g, 'CACHE_DURATION.short');
    changes++;
  }

  // Fix relation field names in include/select
  const relationFixes = [
    { from: /product:/g, to: 'products:' },
    { from: /user:/g, to: 'users:' },
    { from: /brand:/g, to: 'brands:' },
    { from: /category:/g, to: 'categories:' }
  ];

  // Apply relation fixes only in include/select contexts
  const lines = #!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔧 Fixing final TypeScript errors...');

let totalChanges = 0;

function applyFinalFixes(filePath, content) {
  let modified = content;
  let changes = 0;

  // Fix cache import issues
  if (modified.includes('cachedQuery')) {
    modified = modified.replace(/cachedQuery/g, 'getCachedQuery');
    changes++;
  }
  
  if (modified.includes('invalidateCache')) {
    modified = modified.replace(/invalidateCache/g, 'clearCache');
    changes