const fs = require('fs');
const path = require('path');

function walk(dir) {
  const list = [];
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      list.push(...walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      list.push(file);
    }
  }
  return list;
}

const repoRoot = path.resolve(__dirname, '..');
const src = path.join(repoRoot, 'src');
const files = walk(src);
let changed = 0;
for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  // Match both single and double quotes
  const re = /import\s+\{\s*auth\s*\}\s+from\s+["']@\/lib\/auth["'];/g;
  const matches = content.match(re);
  if (matches && matches.length > 1) {
    // Remove all occurrences and insert a single import at the top
    content = content.replace(re, '');
    content = `import { auth } from '@/lib/auth';\n${content}`;
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed duplicates in', f);
    changed++;
  }
}
console.log('Done. Files changed:', changed);
