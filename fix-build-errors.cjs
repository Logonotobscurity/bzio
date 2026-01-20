const fs = require('fs');
const path = require('path');

console.log('Starting comprehensive build error fixes...\n');

const fixes = [
  // Fix 1: Replace getServerSession with auth from @/lib/auth
  {
    file: 'src/app/admin/layout.tsx',
    search: /import { getServerSession } from "next-auth";/g,
    replace: 'import { auth } from "@/lib/auth";',
    description: 'Replace getServerSession with auth in admin layout'
  },
  {
    file: 'src/app/admin/layout.tsx',
    search: /const session = await getServerSession\(\);/g,
    replace: 'const session = await auth();',
    description: 'Replace getServerSession() call with auth()'
  },
  
  // Fix 2: Replace cachedQuery with getCachedQuery
  {
    file: 'src/app/account/_actions/dashboard.ts',
    search: /import { cachedQuery, CACHE_TTL } from '@\/lib\/cache';/g,
    replace: "import { getCachedQuery, CACHE_TTL } from '@/lib/cache';",
    description: 'Fix cachedQuery import in dashboard actions'
  },
  {
    file: 'src/app/account/_actions/dashboard.ts',
    search: /cachedQuery\(/g,
    replace: 'getCachedQuery(',
    description: 'Replace cachedQuery calls with getCachedQuery'
  },
  
  {
    file: 'src/app/admin/_services/analytics.service.ts',
    search: /import { cachedQuery, CACHE_TTL } from '@\/lib\/cache';/g,
    replace: "import { getCachedQuery, CACHE_TTL } from '@/lib/cache';",
    description: 'Fix cachedQuery import in analytics service'
  },
  {
    file: 'src/app/admin/_services/analytics.service.ts',
    search: /cachedQuery\(/g,
    replace: 'getCachedQuery(',
    description: 'Replace cachedQuery calls'
  },
  
  {
    file: 'src/app/admin/_services/product.service.ts',
    search: /import { cachedQuery, CACHE_TTL, CACHE_KEYS, invalidateCacheByPrefix } from '@\/lib\/cache';/g,
    replace: "import { getCachedQuery, CACHE_TTL, CACHE_KEYS, invalidateDashboardCache } from '@/lib/cache';",
    description: 'Fix cache imports in product service'
  },
  {
    file: 'src/app/admin/_services/product.service.ts',
    search: /cachedQuery\(/g,
    replace: 'getCachedQuery(',
    description: 'Replace cachedQuery calls'
  },
  {
    file: 'src/app/admin/_services/product.service.ts',
    search: /invalidateCacheByPrefix\(/g,
    replace: 'invalidateDashboardCache(',
    description: 'Replace invalidateCacheByPrefix calls'
  },
  
  {
    file: 'src/app/admin/_services/quote.service.ts',
    search: /import { cachedQuery, CACHE_TTL, CACHE_KEYS, invalidateCacheByPrefix } from '@\/lib\/cache';/g,
    replace: "import { getCachedQuery, CACHE_TTL, CACHE_KEYS, invalidateDashboardCache } from '@/lib/cache';",
    description: 'Fix cache imports in quote service'
  },
  {
    file: 'src/app/admin/_services/quote.service.ts',
    search: /cachedQuery\(/g,
    replace: 'getCachedQuery(',
    description: 'Replace cachedQuery calls'
  },
  {
    file: 'src/app/admin/_services/quote.service.ts',
    search: /invalidateCacheByPrefix\(/g,
    replace: 'invalidateDashboardCache(',
    description: 'Replace invalidateCacheByPrefix calls'
  },
  
  {
    file: 'src/app/admin/_services/user.service.ts',
    search: /import { cachedQuery, CACHE_TTL, CACHE_KEYS, invalidateCacheByPrefix } from '@\/lib\/cache';/g,
    replace: "import { getCachedQuery, CACHE_TTL, CACHE_KEYS, invalidateDashboardCache } from '@/lib/cache';",
    description: 'Fix cache imports in user service'
  },
  {
    file: 'src/app/admin/_services/user.service.ts',
    search: /cachedQuery\(/g,
    replace: 'getCachedQuery(',
    description: 'Replace cachedQuery calls'
  },
  {
    file: 'src/app/admin/_services/user.service.ts',
    search: /invalidateCacheByPrefix\(/g,
    replace: 'invalidateDashboardCache(',
    description: 'Replace invalidateCacheByPrefix calls'
  },
  
  // Fix 3: Replace invalidateCache with invalidateDashboardCache
  {
    file: 'src/app/account/_actions/settings.ts',
    search: /import { invalidateCache } from '@\/lib\/cache';/g,
    replace: "import { invalidateDashboardCache } from '@/lib/cache';",
    description: 'Fix invalidateCache import in settings'
  },
  {
    file: 'src/app/account/_actions/settings.ts',
    search: /invalidateCache\(/g,
    replace: 'invalidateDashboardCache(',
    description: 'Replace invalidateCache calls'
  },
  
  {
    file: 'src/app/admin/_actions/users.ts',
    search: /import { invalidateCache, CACHE_KEYS } from '@\/lib\/cache';/g,
    replace: "import { invalidateDashboardCache, CACHE_KEYS } from '@/lib/cache';",
    description: 'Fix invalidateCache import in users actions'
  },
  {
    file: 'src/app/admin/_actions/users.ts',
    search: /invalidateCache\(/g,
    replace: 'invalidateDashboardCache(',
    description: 'Replace invalidateCache calls'
  },
  
  // Fix 4: Make validateProductInput async
  {
    file: 'src/app/admin/_services/product.service.ts',
    search: /export function validateProductInput/g,
    replace: 'export async function validateProductInput',
    description: 'Make validateProductInput async'
  },
];

let successCount = 0;
let errorCount = 0;

fixes.forEach(fix => {
  try {
    const filePath = path.join(process.cwd(), fix.file);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${fix.file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    content = content.replace(fix.search, fix.replace);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${fix.description}`);
      successCount++;
    } else {
      console.log(`ℹ️  No changes needed: ${fix.description}`);
    }
  } catch (error) {
    console.error(`❌ Error in ${fix.file}:`, error.message);
    errorCount++;
  }
});

console.log(`\n✅ Successfully applied ${successCount} fixes`);
if (errorCount > 0) {
  console.log(`❌ ${errorCount} errors occurred`);
}
