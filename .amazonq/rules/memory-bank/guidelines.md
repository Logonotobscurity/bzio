# Development Guidelines

## Code Quality Standards

### File Structure and Organization
- **Client Components**: Mark with `'use client'` directive at the top of files requiring browser APIs or React hooks
- **Import Order**: External packages → Next.js imports → Local components → Hooks → Services/Utils → Types → Constants
- **File Naming**: kebab-case for files (e.g., `use-form.ts`, `success-notification.tsx`, `product-service.ts`)
- **Component Files**: Use `.tsx` extension for React components, `.ts` for utilities and services

### TypeScript Standards
- **Strict Mode**: All strict TypeScript flags enabled (strictNullChecks, noUnusedLocals, noUnusedParameters, noImplicitReturns)
- **Type Definitions**: Explicit interfaces for all props, function parameters, and return types
- **Type Exports**: Export interfaces and types alongside implementation for reusability
- **Generic Types**: Use generics for reusable hooks and utilities (e.g., `useForm<T extends FormValues>`)
- **Avoid Any**: Never use `any` type; use `unknown` or proper type definitions

### Code Formatting
- **Indentation**: 2 spaces (consistent across all files)
- **Semicolons**: Required at end of statements
- **Quotes**: Single quotes for strings, double quotes for JSX attributes
- **Line Length**: Keep lines under 120 characters where practical
- **Trailing Commas**: Use in multi-line objects and arrays

### Naming Conventions
- **Components**: PascalCase (e.g., `SuccessNotification`, `LoginPage`)
- **Functions/Variables**: camelCase (e.g., `handleSubmit`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE for true constants (e.g., `MAX_RETRIES`)
- **Interfaces**: PascalCase with descriptive names (e.g., `FormErrors`, `ValidationRules`)
- **Boolean Variables**: Prefix with `is`, `has`, `should` (e.g., `isVisible`, `hasError`, `shouldValidate`)
- **Event Handlers**: Prefix with `handle` (e.g., `handleChange`, `handleSubmit`, `handleBlur`)

## Semantic Patterns

### React Component Patterns

#### State Management
```typescript
// Local state with useState
const [isLoading, setIsLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);

// Global state with Zustand stores
const { login } = useAuthStore();
const { toast } = useToast();
```

#### Effect Patterns
```typescript
// Client-side hydration check
const [isClient, setIsClient] = useState(false);
useEffect(() => {
  setIsClient(true);
}, []);

// Cleanup with timers
useEffect(() => {
  if (isVisible && duration > 0) {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }
}, [isVisible, duration, onClose]);
```

#### Event Handler Patterns
```typescript
// Form submission with async/await
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    await login(email, password);
    toast({ title: 'Success', description: 'Welcome back!' });
    router.push('/account');
  } catch (error) {
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'An error occurred',
      variant: 'destructive',
    });
  } finally {
    setIsLoading(false);
  }
};
```

### Custom Hooks Architecture

#### Hook Documentation
- **JSDoc Comments**: Every custom hook includes comprehensive JSDoc with description, parameters, return values, and examples
- **Type Safety**: Hooks use generics for flexibility while maintaining type safety
- **Return Objects**: Return objects with descriptive property names, not arrays

#### Hook Pattern Example
```typescript
/**
 * useForm Hook
 * Provides comprehensive form state management, validation, and error handling
 * 
 * @example
 * const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm({
 *   initialValues: { email: '', password: '' },
 *   validationRules: { email: { required: true, email: true } },
 *   onSubmit: async (values) => { ... }
 * })
 */
export function useForm<T extends FormValues>({ initialValues, onSubmit, validate }: UseFormOptions<T>) {
  // Implementation
  return { values, errors, handleChange, handleSubmit, isSubmitting };
}
```

### Service Layer Patterns

#### Service Function Structure
```typescript
// Async functions with Promise return types
export const getAllProducts = async (): Promise<Product[]> => {
  return repo.all();
};

// Complex data aggregation
export const getCompanies = async (): Promise<CompanyDirectoryData[]> => {
  const [companies, allProducts, allBrands, allCategories] = await Promise.all([
    companyRepo.all(),
    staticRepo.all(),
    brandRepo.all(),
    categoryRepo.all()
  ]);
  
  // Data transformation logic
  return companies.map(company => {
    // Enrichment logic
  });
};
```

#### Repository Pattern
- Services call repositories, never direct database access
- Repositories abstract data source (static files, database, API)
- Services handle business logic and data enrichment

### Error Handling Standards

#### Try-Catch Blocks
```typescript
try {
  await operation();
  // Success handling
} catch (error) {
  // Type-safe error handling
  const errorMessage = error instanceof Error ? error.message : 'Default message';
  // Error reporting
} finally {
  // Cleanup
  setIsLoading(false);
}
```

#### Optional Chaining and Nullish Coalescing
```typescript
// Safe property access
onClose?.();
user?.name ?? 'Guest';

// Array operations
const prices = products.map(p => p.price ?? 0).filter(p => p > 0);
```

### Validation Patterns

#### Built-in Validation Rules
```typescript
validationRules: {
  email: { 
    required: 'Email is required', 
    email: 'Invalid email format' 
  },
  password: { 
    required: true, 
    minLength: { value: 8, message: 'Min 8 characters' } 
  }
}
```

#### Custom Validators
```typescript
validate: (value) => {
  if (!condition) return 'Error message';
  return true;
},
custom: (value, allValues) => {
  // Cross-field validation
  return allValues.password === allValues.confirmPassword || 'Passwords must match';
}
```

## UI/UX Patterns

### Styling Approach
- **Tailwind CSS**: Primary styling method with utility classes
- **CSS-in-JS**: Use `<style jsx>` for component-specific complex styles
- **Class Composition**: Use `clsx` or `cn` utility for conditional classes
- **Responsive Design**: Mobile-first with Tailwind breakpoints (sm:, md:, lg:, xl:)

### Component Composition
```typescript
// Shadcn/ui component usage
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Lucide icons
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
```

### Loading States
```typescript
// Button loading state
<button disabled={isLoading}>
  {isLoading ? (
    <span className="flex items-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      Loading...
    </span>
  ) : (
    'Submit'
  )}
</button>
```

### Accessibility
- **Form Labels**: Always associate labels with inputs using `htmlFor` and `id`
- **ARIA Attributes**: Use when semantic HTML is insufficient
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
- **Focus States**: Visible focus indicators on all interactive elements

## Data Flow Patterns

### State Management Hierarchy
1. **Local State**: Component-specific state with `useState`
2. **Zustand Stores**: Global state (auth, cart, quotes, UI)
3. **Server State**: Data fetching with async/await in services
4. **URL State**: Search params and route parameters

### Data Fetching Pattern
```typescript
// Service layer handles data fetching
const products = await productService.getAllProducts();

// Parallel data fetching
const [products, brands, categories] = await Promise.all([
  productService.getAllProducts(),
  productService.getBrands(),
  productService.getCategories()
]);
```

### Data Transformation
- Services enrich raw data before returning to components
- Use `.map()`, `.filter()`, `.reduce()` for transformations
- Sort data in services, not components
- Calculate derived data in services (e.g., price ranges, counts)

## Performance Patterns

### Memoization
```typescript
// useCallback for event handlers
const handleChange = useCallback((e) => {
  // Handler logic
}, [dependencies]);

// useMemo for expensive calculations (when needed)
const sortedProducts = useMemo(() => 
  products.sort((a, b) => b.price - a.price),
  [products]
);
```

### Conditional Rendering
```typescript
// Early returns for loading/error states
if (!isClient || !isAuthenticated) {
  return null;
}

// Conditional rendering with &&
{isVisible && <Component />}

// Ternary for either/or
{showPassword ? <EyeOff /> : <Eye />}
```

## Testing Considerations

### Test Setup
- Jest with React Testing Library
- jsdom environment for component tests
- Test files in `__tests__` directories or `.test.ts(x)` suffix

### Testable Code Patterns
- Pure functions in utilities
- Separated business logic in services
- Props-based components (avoid tight coupling)
- Dependency injection for services

## Common Idioms

### Array Operations
```typescript
// Unique values
const uniqueCategories = [...new Set(products.map(p => p.category))];

// Filtering and mapping
const prices = products.map(p => p.price ?? 0).filter(p => p > 0);

// Sorting
products.sort((a, b) => b.rating - a.rating);
```

### Object Operations
```typescript
// Spread for immutable updates
setValues(prev => ({ ...prev, [name]: value }));

// Object.entries for iteration
Object.entries(brandCounts).map(([name, count]) => ({ name, count }));

// Record types for dictionaries
const categoryCounts: Record<string, number> = {};
```

### Async Patterns
```typescript
// Promise.all for parallel operations
const [data1, data2] = await Promise.all([fetch1(), fetch2()]);

// Async/await with error handling
try {
  const result = await asyncOperation();
} catch (error) {
  handleError(error);
}
```

## Path Aliases
- Use `@/` prefix for all imports from `src/` directory
- Examples: `@/components/ui/button`, `@/lib/utils`, `@/hooks/use-form`

## Environment and Configuration
- Environment variables in `.env` file
- Type-safe config in `@/lib/config`
- Never commit secrets or API keys
- Use placeholder values in examples

## Documentation Standards
- JSDoc comments for all exported functions and hooks
- Inline comments for complex logic only
- README files for major features
- Type definitions serve as documentation
