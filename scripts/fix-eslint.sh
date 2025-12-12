#!/bin/bash

echo "🔧 Fixing ESLint warnings automatically..."

# Fix unused variables (remove or prefix with _)
npx eslint . --fix

# For cases where auto-fix doesn't work, manual fixes needed
echo "⚠️  Manual fixes required for:"
echo "  - Replace 'any' types with proper types"
echo "  - Remove truly unused variables"
echo "  - Add type definitions"

echo "✅ Auto-fixable issues resolved!"
echo "📝 Run 'npm run lint' to see remaining issues"