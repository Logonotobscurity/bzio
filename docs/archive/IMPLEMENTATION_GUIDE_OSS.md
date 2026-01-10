# BZION OSS Transformation - Implementation Guide

## Quick Start

### For Developers (5 minutes setup)

```bash
# 1. Install dependencies
npm install --save-dev \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint \
  eslint-config-next \
  eslint-config-prettier \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  prettier \
  husky \
  lint-staged

# 2. Setup husky hooks
npx husky install

# 3. Add npm scripts to package.json (see below)

# 4. Test locally
npm run lint
npm run type-check
npm run build
```

### package.json Scripts to Add

Add these to your `package.json` under `"scripts"`:

```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "validate": "npm run type-check && npm run lint",
    "prepare": "husky install"
  }
}
```

---

## What's Included

### ✅ Configuration Files Created

1. **`.eslintrc.json`** - ESLint configuration
   - Enforces Next.js best practices
   - TypeScript strict mode rules
   - React hooks rules
   - Security checks

2. **`.eslintignore`** - Files to ignore during linting
   - node_modules, .next, build artifacts
   - Config files, generated files

3. **`tsconfig.json`** - Updated with strict TypeScript
   - `strict: true` (already was)
   - `noUnusedLocals: true`
   - `noUnusedParameters: true`
   - `noImplicitReturns: true`
   - `skipLibCheck: false` (was `true`)

4. **`next.config.js`** - Removed ignore flags
   - ❌ Removed `typescript.ignoreBuildErrors`
   - ❌ Removed `eslint.ignoreDuringBuilds`
   - ✅ Builds FAIL on TypeScript/ESLint errors

5. **`.husky/pre-commit`** - Pre-commit hook
   - Runs ESLint on staged files
   - Runs TypeScript compiler
   - Blocks commits on errors

6. **`.github/workflows/lint-and-type-check.yml`** - CI/CD pipeline
   - Tests on Node 18.x and 20.x
   - Blocks PR merge on errors
   - Creates detailed reports

---

## Common Errors & Fixes

### Error 1: "Expected a return type"
**Message**: `@typescript-eslint/explicit-function-return-types`

**Fix**: Add return type to functions
```typescript
// ❌ Before
export const getData = async () => {
  return { data: 'value' };
};

// ✅ After
export const getData = async (): Promise<{ data: string }> => {
  return { data: 'value' };
};
```

### Error 2: "Unexpected any type"
**Message**: `@typescript-eslint/no-explicit-any`

**Fix**: Use proper type instead of `any`
```typescript
// ❌ Before
const processData = (data: any) => { ... };

// ✅ After
interface DataType {
  id: string;
  name: string;
}
const processData = (data: DataType) => { ... };
```

### Error 3: "Unused variable"
**Message**: `@typescript-eslint/no-unused-vars`

**Fix**: Remove unused variable or prefix with underscore
```typescript
// ❌ Before
const { used, unused } = data;

// ✅ After
const { used, _unused } = data;
// Or simply don't destructure it
const { used } = data;
```

### Error 4: "Missing dependency in useEffect"
**Message**: `react-hooks/exhaustive-deps`

**Fix**: Add to dependency array or use useCallback
```typescript
// ❌ Before
useEffect(() => {
  fetchData(userId);
}, []); // userId not in dependencies!

// ✅ After
useEffect(() => {
  fetchData(userId);
}, [userId]); // Added to dependencies
```

### Error 5: "Unreachable code"
**Message**: `no-fallthrough-case-in-switch`

**Fix**: Add break or return in switch cases
```typescript
// ❌ Before
switch(status) {
  case 'loading':
    console.log('Loading...');
  case 'done':
    console.log('Done');
}

// ✅ After
switch(status) {
  case 'loading':
    console.log('Loading...');
    break;
  case 'done':
    console.log('Done');
    break;
}
```

---

## Auto-Fix Commands

Many issues can be fixed automatically:

```bash
# Auto-fix ESLint issues
npm run lint:fix

# Then manually fix remaining TypeScript issues
npm run type-check

# Validate everything passes
npm run validate
```

---

## Running Quality Checks

### Local Development
```bash
# Check everything
npm run validate

# Check only ESLint
npm run lint

# Auto-fix ESLint
npm run lint:fix

# Check TypeScript
npm run type-check

# Full build test
npm run build
```

### Pre-Commit (Automatic)
When you run `git commit`:
1. ESLint automatically runs
2. TypeScript compiler runs
3. If errors found, commit is **BLOCKED**
4. Fix errors and try again

### CI/CD (GitHub Actions)
When you push or create PR:
1. GitHub Actions runs lint check
2. GitHub Actions runs type check
3. GitHub Actions runs build
4. PR **cannot be merged** if checks fail

---

## Gradual Adoption (If Needed)

If you have many errors, you can enable rules gradually:

1. **Week 1**: Enable warnings only
   - Update `.eslintrc.json`: Change `"error"` to `"warn"`
   - Focus on understanding issues

2. **Week 2**: Fix critical issues
   - Target TypeScript errors first
   - Then ESLint security rules

3. **Week 3**: Enforce everything
   - Switch warnings back to errors
   - No more suppressions

---

## Disabling Rules (Emergency Only)

If a rule is too strict, you can disable it temporarily:

### Per-Line
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = JSON.parse(jsonString);
```

### Per-File
```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
// ... rest of file with rule disabled
```

### Globally
Edit `.eslintrc.json` and set rule to `"off"`:
```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "off"
  }
}
```

⚠️ **Avoid global disabling** - prefer fixing the code!

---

## Monitoring & Reporting

### GitHub Actions Reports
- Each PR shows ESLint/TypeScript results
- Detailed error messages in PR comments
- Build artifacts saved for 7 days

### Local Validation
```bash
# Generate JSON report
npx eslint src --format=json > report.json

# View in editor
code report.json
```

---

## Troubleshooting

### Issue: Pre-commit hook not running
**Solution**: 
```bash
npm run prepare  # Re-install husky
chmod +x .husky/pre-commit  # Make executable (Mac/Linux)
```

### Issue: "Cannot find module" errors
**Solution**:
```bash
npm install  # Reinstall dependencies
rm -rf node_modules/.cache  # Clear cache
npm run validate
```

### Issue: Type errors in .tsx files
**Solution**: Ensure files are named `.tsx` not `.ts` for JSX

### Issue: "Missing React import"
**Solution**: Add `import React from 'react'` at top of file (or remove if not used)

---

## Next Steps

1. **Install dependencies** (5 min)
   ```bash
   npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-next eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks prettier husky
   ```

2. **Run setup** (2 min)
   ```bash
   npx husky install
   npm run prepare
   ```

3. **Fix errors** (Variable time)
   ```bash
   npm run lint:fix  # Auto-fix ESLint
   npm run type-check  # Check TypeScript
   npm run build  # Full build test
   ```

4. **Commit & Push** (Automatic validation)
   ```bash
   git add .
   git commit -m "feat: setup production-grade linting"
   git push
   ```

---

## Success Indicators ✅

- ✅ `npm run validate` passes locally
- ✅ `npm run build` succeeds
- ✅ `git commit` succeeds without errors
- ✅ GitHub Actions all checks pass
- ✅ PR can be merged

---

## Questions?

Refer to:
- **ESLint Rules**: https://eslint.org/docs/rules/
- **TypeScript ESLint**: https://typescript-eslint.io/rules/
- **Next.js Linting**: https://nextjs.org/docs/basic-features/eslint
- **Husky Documentation**: https://typicode.github.io/husky/

---

**Status**: ✅ Ready for Implementation  
**Version**: 1.0  
**Last Updated**: December 5, 2025
