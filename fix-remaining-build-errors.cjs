const fs = require('fs');
const path = require('path');

console.log('Fixing remaining build errors...\n');

// List of all files that need getServerSession replaced with auth
const apiFiles = [
  'src/lib/auth/server.ts',
  'src/lib/auth-utils.ts',
  'src/app/api/user/profile/route.ts',
  'src/app/api/user/cart/route.ts',
  'src/app/api/user/send-email/route.ts',
  'src/app/api/user/addresses/[id]/route.ts',
  'src/app/api/user/addresses/route.ts',
  'src/app/api/user/cart/items/route.ts',
  'src/app/api/quote-requests/route.ts',
  'src/app/api/user/activities/route.ts',
  'src/app/api/user/cart/items/[id]/route.ts',
  'src/app/api/admin/quote-messages/route.ts',
  'src/app/api/admin/orders/route.ts',
  'src/app/api/admin/export/route.ts',
  'src/app/api/admin/dashboard-data/route.ts',
  'src/app/api/admin/db-diagnostics/route.ts',
  'src/app/api/admin/errors/route.ts',
  'src/app/api/admin/dashboard-data-fallback/route.ts',
  'src/app/api/admin/customers/[id]/quotes/route.ts',
  'src/app/api/admin/customers/[id]/route.ts',
];

let successCount = 0;

// Fix getServerSession imports
apiFiles.forEach(file => {
  try {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace import
    content = content.replace(
      /import { getServerSession } from ['"]next-auth['"];?/g,
      'import { auth } from "@/lib/auth";'
    );
    
    // Replace function calls
    content = content.replace(/getServerSession\(\)/g, 'auth()');
    content = content.replace(/await getServerSession\(\)/g, 'await auth()');
    content = content.replace(/const session = getServerSession\(\)/g, 'const session = auth()');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed getServerSession in ${file}`);
      successCount++;
    }
  } catch (error) {
    console.error(`❌ Error in ${file}:`, error.message);
  }
});

// Fix password redeclaration errors
const passwordFixes = [
  {
    file: 'src/app/api/admin/setup/route.ts',
    search: /const password = await bcrypt\.hash\(password, 10\);/g,
    replace: 'const hashedPassword = await bcrypt.hash(password, 10);',
    replaceUsage: /password: password,/g,
    replaceWith: 'password: hashedPassword,',
  },
  {
    file: 'src/app/api/admin/users/route.ts',
    search: /const password = await bcrypt\.hash\(password, 10\);/g,
    replace: 'const hashedPassword = await bcrypt.hash(password, 10);',
    replaceUsage: /password: password,/g,
    replaceWith: 'password: hashedPassword,',
  },
  {
    file: 'src/app/api/auth/register/route.ts',
    search: /const password = await bcrypt\.hash\(password, 10\);/g,
    replace: 'const hashedPassword = await bcrypt.hash(password, 10);',
    replaceUsage: /password: password,/g,
    replaceWith: 'password: hashedPassword,',
  },
  {
    file: 'src/app/api/auth/reset-password/route.ts',
    search: /const password = await bcrypt\.hash\(password, 10\);/g,
    replace: 'const hashedPassword = await bcrypt.hash(password, 10);',
    replaceUsage: /password: hashedPassword/g,
    replaceWith: 'password: hashedPassword',
  },
];

passwordFixes.forEach(fix => {
  try {
    const filePath = path.join(process.cwd(), fix.file);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${fix.file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    content = content.replace(fix.search, fix.replace);
    if (fix.replaceUsage) {
      content = content.replace(fix.replaceUsage, fix.replaceWith);
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed password redeclaration in ${fix.file}`);
      successCount++;
    }
  } catch (error) {
    console.error(`❌ Error in ${fix.file}:`, error.message);
  }
});

console.log(`\n✅ Successfully applied ${successCount} fixes`);
console.log('\nRemaining manual fixes needed:');
console.log('1. Install @prisma/adapter-pg: npm install @prisma/adapter-pg');
console.log('2. Remove addQuoteMessage import from QuotesClient.tsx');
console.log('3. Fix proxy.ts to use NextAuth v5 middleware pattern');
