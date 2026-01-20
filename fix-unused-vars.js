const fs = require('fs');
const path = require('path');

// Files and their fixes
const fixes = [
  // Category 1: Remove unused imports
  {
    file: 'src/app/account/notifications/NotificationsClient.tsx',
    find: "import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';",
    replace: "import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';"
  },
  {
    file: 'src/app/account/orders/page.tsx',
    find: /import \{([^}]*CardHeader[^}]*)\} from '@\/components\/ui\/card';/,
    replace: (match, imports) => {
      const cleaned = imports.split(',').map(i => i.trim()).filter(i => i !== 'CardHeader').join(', ');
      return `import { ${cleaned} } from '@/components/ui/card';`;
    }
  },
  {
    file: 'src/app/admin/_components/AdminNotifications.tsx',
    find: /import \{([^}]*Card[^}]*)\} from '@\/components\/ui\/card';/,
    replace: (match, imports) => {
      const cleaned = imports.split(',').map(i => i.trim()).filter(i => i !== 'Card').join(', ');
      return `import { ${cleaned} } from '@/components/ui/card';`;
    }
  },
  {
    file: 'src/app/admin/_components/MetricsCards.tsx',
    find: /import \{([^}]*TrendingUp[^}]*)\} from 'lucide-react';/,
    replace: (match, imports) => {
      const cleaned = imports.split(',').map(i => i.trim()).filter(i => i !== 'TrendingUp').join(', ');
      return `import { ${cleaned} } from 'lucide-react';`;
    }
  },
  {
    file: 'src/app/admin/analytics/AnalyticsClient.tsx',
    find: /Legend,/g,
    replace: ''
  },
  {
    file: 'src/app/admin/login/admin-login-content.backup.tsx',
    find: /getRedirectPathByRole,/g,
    replace: ''
  },
  {
    file: 'src/app/admin/login/admin-login-content.tsx',
    find: /USER_ROLES,/g,
    replace: ''
  },
  {
    file: 'src/app/admin/notifications/NotificationsClient.tsx',
    find: /CardHeader,/g,
    replace: ''
  },
  {
    file: 'src/app/admin/page.tsx',
    find: /ActivityEvent,/g,
    replace: ''
  },
  {
    file: 'src/app/admin/products/page.tsx',
    find: /Badge,/g,
    replace: ''
  },
  {
    file: 'src/app/admin/users/UsersClient.tsx',
    find: /Eye, Mail,/g,
    replace: ''
  },
  
  // Category 2: Prefix unused parameters with _
  {
    file: 'src/app/api/admin/crm-sync/route.ts',
    find: 'export async function POST(request: Request)',
    replace: 'export async function POST(_request: Request)'
  },
  {
    file: 'src/app/api/user/addresses/route.ts',
    find: 'export async function POST(req: Request)',
    replace: 'export async function POST(_req: Request)'
  },
  {
    file: 'src/app/api/user/cart/items/route.ts',
    find: 'export async function DELETE(req: Request)',
    replace: 'export async function DELETE(_req: Request)'
  },
  {
    file: 'src/app/api/user/send-email/route.ts',
    find: 'export async function POST(req: Request)',
    replace: 'export async function POST(_req: Request)'
  },
  {
    file: 'src/app/products/category/route.ts',
    find: 'export async function GET(request: Request)',
    replace: 'export async function GET(_request: Request)'
  },
  
  // Category 3: Prefix unused errors with _
  {
    file: 'src/components/forms/contact-form.tsx',
    find: '} catch (error) {',
    replace: '} catch (_error) {'
  },
  {
    file: 'src/components/forms/newsletter-form.tsx',
    find: '} catch (error) {',
    replace: '} catch (_error) {'
  },
  {
    file: 'src/components/guest-quote-form.tsx',
    find: '} catch (error) {',
    replace: '} catch (_error) {'
  },
  {
    file: 'src/lib/auth/jwt-auth.ts',
    find: '} catch (error) {',
    replace: '} catch (_error) {',
    all: true
  },
  {
    file: 'src/lib/store/quote.ts',
    find: '} catch (error) {',
    replace: '} catch (_error) {'
  },
  
  // Remove unused imports
  {
    file: 'src/app/api/forms/route.ts',
    find: "import { NextRequest, NextResponse } from 'next/server';",
    replace: "import { NextRequest } from 'next/server';"
  },
  {
    file: 'src/app/api/admin/setup/route.ts',
    find: /getServerSession,/g,
    replace: ''
  },
  {
    file: 'src/app/login/login-content.tsx',
    find: /AlertCircle, Alert, AlertDescription,/g,
    replace: ''
  },
  {
    file: 'src/app/page.tsx',
    find: /getServerSession, redirect, REDIRECT_PATHS,/g,
    replace: ''
  },
  {
    file: 'src/components/layout/footer.tsx',
    find: /Logo,/g,
    replace: ''
  },
  {
    file: 'src/components/layout/header.tsx',
    find: /USER_ROLES,/g,
    replace: ''
  },
  {
    file: 'src/components/ui/chart-lazy.tsx',
    find: /dynamic,/g,
    replace: ''
  },
  {
    file: 'src/components/cart-display-component.tsx',
    find: /Badge,/g,
    replace: ''
  },
  {
    file: 'src/components/guest-quote-form.tsx',
    find: /Phone,/g,
    replace: ''
  },
  {
    file: 'src/services/enrichmentService.tsx',
    find: "import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';",
    replace: "// Cache imports removed - not currently used"
  },
  {
    file: 'src/services/error-logging.service.ts',
    find: /ErrorLog,/g,
    replace: ''
  },
  {
    file: 'src/services/form.service.ts',
    find: /FormSubmission,/g,
    replace: ''
  },
  {
    file: 'src/services/productService.ts',
    find: /EnrichedBrandData, CategorizedBrandGroup, EnrichedCategoryData,/g,
    replace: ''
  },
  {
    file: 'src/lib/analytics.ts',
    find: /TrackEventOptions,/g,
    replace: ''
  },
  {
    file: 'src/hooks/useWebSocket.ts',
    find: 'ws.onerror = (e) => {',
    replace: 'ws.onerror = (_e) => {'
  },
  {
    file: 'src/lib/websocket-handler.ts',
    find: 'ws.onerror = (e) => {',
    replace: 'ws.onerror = (_e) => {'
  },
  {
    file: 'src/api/forms/submit/route.ts',
    find: /FormSubmissionData,/g,
    replace: ''
  },
];

// Apply fixes
fixes.forEach(fix => {
  const filePath = path.join(process.cwd(), fix.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${fix.file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (typeof fix.find === 'string') {
    if (fix.all) {
      content = content.split(fix.find).join(fix.replace);
    } else {
      content = content.replace(fix.find, fix.replace);
    }
  } else {
    content = content.replace(fix.find, fix.replace);
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed: ${fix.file}`);
});

console.log('\n✨ All fixes applied!');
