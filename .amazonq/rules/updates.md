# Development Rules & Standards for bzionu Project

## 1. NEXT.JS & TYPESCRIPT STANDARDS

### Route Handlers (Next.js 16+)
- **ALWAYS** use async `params` for dynamic routes
  ```typescript
  // ✅ CORRECT
  export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // Use id, not params.id
  }
  
  // ❌ WRONG
  export async function GET(req: Request, { params }: { params: { id: string } }) {
    const customerId = parseInt(params.id); // Will fail in Next.js 16
  }
  ```

### Session & Authentication
- **ALWAYS** properly type session objects from NextAuth
  ```typescript
  const session = await getServerSession();
  if (!session?.user?.id) return unauthorized();
  
  // Type-safe ID conversion
  const userId = typeof session.user.id === 'string' 
    ? parseInt(session.user.id, 10) 
    : session.user.id;
  ```

### Error Handling in API Routes
- Wrap all async operations in try-catch blocks
- Return proper HTTP status codes (400, 401, 404, 500)
- Log errors to console with descriptive labels
  ```typescript
  export async function GET(req: Request) {
    try {
      const session = await getServerSession();
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      // ... operation
      return NextResponse.json(data);
    } catch (error) {
      console.error('[ENDPOINT_NAME_GET]', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
  ```

---

## 2. DEPENDENCIES & IMPORTS

### Package Installation
- **ALWAYS check package.json FIRST** before using any external library
- If a package is missing, INSTALL IT immediately
  ```bash
  npm install package-name
  ```
- Never assume a package exists just because it's imported in code

### Critical Packages for This Project
- `sonner` - Toast notifications (must be installed)
- `next-auth` - Authentication
- `@prisma/client` - Database ORM
- All UI components from `@/components/ui/*`

### Import Organization
```typescript
// 1. External imports
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

// 2. UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 3. Icons
import { Loader, Plus, Trash2 } from 'lucide-react';

// 4. Toast notifications
import { toast } from 'sonner';

// 5. Custom utilities
import { USER_ROLES } from '@/lib/auth-constants';
```

---

## 3. DATABASE & PRISMA

### Schema Updates
- **ALWAYS update the Prisma schema** in `prisma/schema.prisma`
- After schema changes, run:
  ```bash
  npx prisma migrate dev --name description
  npx prisma generate
  ```
- **VERIFY** that Cart and CartItem models are in schema with proper relationships

### Prisma Usage
- Use `prisma from '@/lib/prisma'` for single shared instance
- Include proper relationships in select queries
- Always include relationships when needed for API responses

---

## 4. REPOSITORY PATTERN

### Adding New Repositories
- Create repository file: `src/repositories/[entity].repository.ts`
- **ALWAYS export the class AND the instance**:
  ```typescript
  export class YourRepository extends BaseRepository<...> {
    // implementation
  }
  
  export const yourRepository = new YourRepository();
  ```

- **ALWAYS add exports to `src/repositories/index.ts`**:
  ```typescript
  export { yourRepository, YourRepository } from './[entity].repository';
  ```

### Common Mistake
- Missing exports → Build errors: "Export doesn't exist in target module"
- Check `index.ts` has ALL repositories exported

---

## 5. API ENDPOINTS & DATA FLOW

### CRUD Operations Pattern
```typescript
// GET - Fetch data
export async function GET(req: Request) {
  // Validate auth
  // Query database
  // Return NextResponse.json(data)
}

// POST - Create data
export async function POST(req: Request) {
  // Validate auth
  // Parse request body
  // Validate inputs
  // Create in database
  // Return NextResponse.json(data, { status: 201 })
}

// PUT - Update data
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Validate auth & ownership
  // Update in database
  // Return NextResponse.json(updated)
}

// DELETE - Remove data
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Validate auth & ownership
  // Delete from database
  // Return NextResponse.json({ success: true })
}
```

### User Data Scoping
- **ALWAYS** verify user owns the data they're accessing
- Check `session.user.id` matches the resource owner
- Prevent unauthorized access with proper queries and WHERE clauses

---

## 6. COMPONENT DEVELOPMENT

### Client Components
- **ALWAYS** use `'use client'` directive at top
- Handle loading states with Loader component
- Use toast notifications for user feedback

### Form Handling
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    if (response.ok) {
      const data = await response.json();
      toast.success('Success message');
      // Update state or redirect
    } else {
      toast.error('Failed to save');
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('An error occurred');
  } finally {
    setIsLoading(false);
  }
};
```

### UI Libraries Usage
- Tabs, Cards, Buttons from `@/components/ui/*`
- Icons from `lucide-react`
- Form inputs with proper labels
- Loading states with spinners

---

## 7. AUTHENTICATION & AUTHORIZATION

### Admin-Only Endpoints
```typescript
export async function GET(req: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.id || session.user.role !== USER_ROLES.ADMIN) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }
  
  // Admin-only logic
}
```

### User-Owned Data Access
```typescript
const userId = typeof session.user.id === 'string' 
  ? parseInt(session.user.id, 10) 
  : session.user.id;

const data = await prisma.address.findFirst({
  where: { userId, id: parseInt(id) }, // Verify ownership
});
```

---

## 8. BUILD & COMPILATION

### Before Running Build
1. ✅ Check all imports are valid
2. ✅ Verify all packages are installed
3. ✅ Ensure all repository exports exist in index.ts
4. ✅ Check route handler params are async
5. ✅ Verify session typing

### Build Process
```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

### Common Build Errors & Solutions
| Error | Cause | Solution |
|-------|-------|----------|
| `Can't resolve 'package'` | Package not installed | `npm install package` |
| `Export X doesn't exist` | Missing from index.ts | Add export to repositories/index.ts |
| `Type error with params` | Not async Promise | Change to `params: Promise<{...}>` |
| `session.user.id is unknown` | Type mismatch | Use proper type narrowing with typeof checks |

---

## 9. FILE STRUCTURE & NAMING

### Route Handlers
- Location: `src/app/api/[resource]/[action]/route.ts`
- Pattern: `/api/user/profile`, `/api/user/addresses`, `/api/admin/customers`

### Components
- Location: `src/components/[name].tsx`
- Pattern: PascalCase names, default export
- Prefix with feature: `ProfileEditComponent`, `CartDisplayComponent`

### API Response Structure
```typescript
{
  // Success responses
  { data: T, limit?: number, offset?: number, total?: number, hasMore?: boolean }
  
  // Error responses
  { error: string, status: number }
  
  // Single item responses
  { ...item, createdAt, updatedAt }
}
```

---

## 10. TESTING CHECKLIST

Before marking a feature complete:
- ✅ Code builds without errors
- ✅ No TypeScript errors
- ✅ All imports resolve correctly
- ✅ API endpoints tested in browser/Postman
- ✅ Error handling works
- ✅ Toast notifications appear
- ✅ Loading states display properly
- ✅ Authorization checks pass
- ✅ Database operations work
- ✅ No console errors

---

## 11. GIT & VERSIONING

### Commit Messages
```
[FEATURE] Add profile edit component
[FIX] Fix async params in route handlers
[AUDIT] Fix build errors and imports
[REFACTOR] Update session typing
[DOCS] Add development rules
```

### Before Pushing
1. Run `npm run build` successfully
2. Check for console errors
3. Test critical flows
4. Verify no breaking changes

---

## 12. PERFORMANCE & OPTIMIZATION

### Database Queries
- Use `select` to fetch only needed fields
- Include relationships selectively
- Implement pagination for large datasets
- Order results appropriately

### Component Optimization
- Use memo for expensive re-renders
- Implement proper loading states
- Cache API responses when appropriate
- Lazy load heavy components

---

## 13. SECURITY

### Input Validation
- Validate request body shape
- Check required fields
- Sanitize user inputs
- Never trust client data

### Authorization
- Always verify session exists
- Check user role for admin operations
- Verify resource ownership
- Return 401/403 for unauthorized access

### Password & Sensitive Data
- Never log passwords or tokens
- Use hashed passwords (bcrypt)
- Implement rate limiting
- Use secure headers

---

## 14. COMMON MISTAKES TO AVOID

❌ **DON'T:**
- Forget to add `'use client'` in client components
- Use synchronous params in Next.js 16+ route handlers
- Import from packages without installing them
- Leave repositories off the index.ts exports
- Assume session.user.id is always an integer
- Skip error handling in API routes
- Forget to use try-catch blocks
- Return untyped responses from APIs
- Skip authorization checks
- Create hardcoded values in components

✅ **DO:**
- Always await params in route handlers
- Check package.json before using imports
- Export repositories in index.ts
- Handle type conversions explicitly
- Wrap async operations in try-catch
- Return proper HTTP status codes
- Verify user authorization
- Use environment variables for config
- Implement proper error logging
- Use TypeScript for type safety

---

## 15. DEVELOPMENT WORKFLOW

### When Adding a New Feature

1. **Plan Phase**
   - Define data model in Prisma schema
   - Plan API endpoints
   - Design UI components

2. **Backend Phase**
   - Create/update Prisma schema
   - Create repository (if needed)
   - Add repository to index.ts
   - Create API endpoints with proper auth

3. **Frontend Phase**
   - Create UI components
   - Add form handling
   - Implement API calls
   - Add error handling & toasts

4. **Testing Phase**
   - Run `npm run build`
   - Test all endpoints
   - Test UI components
   - Verify error states

5. **Deployment Phase**
   - Run migrations
   - Deploy code
   - Monitor for errors

---

## Summary

**The Golden Rules:**
1. ✅ Always use async params in route handlers
2. ✅ Always install missing packages
3. ✅ Always export repositories in index.ts
4. ✅ Always verify authentication/authorization
5. ✅ Always handle errors with try-catch
6. ✅ Always type session properly
7. ✅ Always run build before committing
8. ✅ Always check imports are valid
