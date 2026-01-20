/**
 * Property-Based Tests for Product CRUD Round-Trip
 * 
 * Feature: admin-product-crud
 * Property 2: Product CRUD Round-Trip Consistency
 * Validates: Requirements 2.1, 4.1
 * 
 * Tests that:
 * - Creating a product then reading it back returns equivalent data
 * - Updating a product then reading it back returns the updated values
 */

import * as fc from 'fast-check';

// ============================================================================
// Types matching the product service
// ============================================================================

interface ProductCreateInput {
  sku: string;
  name: string;
  slug?: string;
  description?: string;
  detailedDescription?: string;
  price: number;
  stockQuantity: number;
  unit?: string;
  brandId: number;
  categoryId: number;
  imageUrl?: string;
  images?: string[];
  tags?: string[];
  specifications?: Record<string, unknown>;
  isActive?: boolean;
  isFeatured?: boolean;
}

interface ProductUpdateInput extends Partial<ProductCreateInput> {
  id: number;
}

interface ProductReadResult {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  detailedDescription: string | null;
  price: number;
  stockQuantity: number;
  unit: string;
  brandId: number;
  categoryId: number;
  imageUrl: string | null;
  images: string[];
  tags: string[];
  specifications: Record<string, unknown> | null;
  isActive: boolean;
  isFeatured: boolean;
}

// ============================================================================
// Pure functions simulating CRUD operations (mirrors service logic)
// ============================================================================

/**
 * Simulates product creation - generates a product from input
 */
function createProduct(
  input: ProductCreateInput,
  existingSkus: Set<string>,
  existingSlugs: Set<string>
): { success: boolean; product?: ProductReadResult; error?: string } {
  // Validate required fields
  if (!input.sku || !input.sku.trim()) {
    return { success: false, error: 'SKU is required' };
  }
  if (!input.name || !input.name.trim()) {
    return { success: false, error: 'Name is required' };
  }
  if (input.price === undefined || input.price === null || input.price < 0) {
    return { success: false, error: 'Price is required and must be non-negative' };
  }
  if (!input.categoryId) {
    return { success: false, error: 'Category ID is required' };
  }
  if (!input.brandId) {
    return { success: false, error: 'Brand ID is required' };
  }

  // Check for duplicate SKU
  if (existingSkus.has(input.sku.trim())) {
    return { success: false, error: 'SKU already exists' };
  }

  // Generate slug if not provided
  let slug = input.slug || generateSlug(input.name);
  
  // Handle duplicate slug by appending timestamp
  if (existingSlugs.has(slug)) {
    slug = `${slug}-${Date.now()}`;
  }

  const product: ProductReadResult = {
    id: Math.floor(Math.random() * 1000000) + 1,
    sku: input.sku.trim(),
    name: input.name.trim(),
    slug,
    description: input.description || null,
    detailedDescription: input.detailedDescription || null,
    price: input.price,
    stockQuantity: input.stockQuantity ?? 0,
    unit: input.unit || 'Unit',
    brandId: input.brandId,
    categoryId: input.categoryId,
    imageUrl: input.imageUrl || null,
    images: input.images || [],
    tags: input.tags || [],
    specifications: input.specifications || null,
    isActive: input.isActive ?? true,
    isFeatured: input.isFeatured ?? false,
  };

  return { success: true, product };
}

/**
 * Simulates product update - applies partial updates to existing product
 */
function updateProduct(
  existing: ProductReadResult,
  input: Partial<ProductCreateInput>,
  existingSkus: Set<string>
): { success: boolean; product?: ProductReadResult; error?: string } {
  // If SKU is being updated, check for duplicates
  if (input.sku && input.sku !== existing.sku) {
    if (existingSkus.has(input.sku.trim())) {
      return { success: false, error: 'SKU already exists' };
    }
  }

  // Generate new slug if name is updated
  let newSlug = existing.slug;
  if (input.name && !input.slug) {
    newSlug = generateSlug(input.name);
  } else if (input.slug) {
    newSlug = input.slug;
  }

  const updated: ProductReadResult = {
    ...existing,
    sku: input.sku?.trim() ?? existing.sku,
    name: input.name?.trim() ?? existing.name,
    slug: newSlug,
    description: input.description !== undefined ? input.description || null : existing.description,
    detailedDescription: input.detailedDescription !== undefined ? input.detailedDescription || null : existing.detailedDescription,
    price: input.price ?? existing.price,
    stockQuantity: input.stockQuantity ?? existing.stockQuantity,
    unit: input.unit ?? existing.unit,
    brandId: input.brandId ?? existing.brandId,
    categoryId: input.categoryId ?? existing.categoryId,
    imageUrl: input.imageUrl !== undefined ? input.imageUrl || null : existing.imageUrl,
    images: input.images ?? existing.images,
    tags: input.tags ?? existing.tags,
    specifications: input.specifications !== undefined ? input.specifications || null : existing.specifications,
    isActive: input.isActive ?? existing.isActive,
    isFeatured: input.isFeatured ?? existing.isFeatured,
  };

  return { success: true, product: updated };
}

/**
 * Generate slug from product name (mirrors service logic)
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Compare two products for equivalence (ignoring auto-generated fields)
 */
function productsAreEquivalent(
  input: ProductCreateInput,
  result: ProductReadResult
): boolean {
  // Core fields must match
  if (input.sku.trim() !== result.sku) return false;
  if (input.name.trim() !== result.name) return false;
  if (input.price !== result.price) return false;
  if (input.brandId !== result.brandId) return false;
  if (input.categoryId !== result.categoryId) return false;
  
  // Optional fields with defaults
  if ((input.stockQuantity ?? 0) !== result.stockQuantity) return false;
  if ((input.unit || 'Unit') !== result.unit) return false;
  if ((input.isActive ?? true) !== result.isActive) return false;
  if ((input.isFeatured ?? false) !== result.isFeatured) return false;
  
  // Nullable fields
  if ((input.description || null) !== result.description) return false;
  if ((input.detailedDescription || null) !== result.detailedDescription) return false;
  if ((input.imageUrl || null) !== result.imageUrl) return false;
  
  // Array fields
  const inputImages = input.images || [];
  const inputTags = input.tags || [];
  if (inputImages.length !== result.images.length) return false;
  if (inputTags.length !== result.tags.length) return false;
  if (!inputImages.every((img, i) => img === result.images[i])) return false;
  if (!inputTags.every((tag, i) => tag === result.tags[i])) return false;
  
  // Slug should be derived from name if not provided
  if (input.slug) {
    if (input.slug !== result.slug) return false;
  } else {
    const expectedSlug = generateSlug(input.name);
    // Slug might have timestamp appended for uniqueness
    if (!result.slug.startsWith(expectedSlug)) return false;
  }
  
  return true;
}

// ============================================================================
// Arbitraries (generators)
// ============================================================================

// Generator for valid SKU (alphanumeric, 3-20 chars)
const skuArbitrary = fc.stringMatching(/^[A-Z0-9]{3,20}$/);

// Generator for valid product name
const productNameArbitrary = fc.string({ minLength: 1, maxLength: 100 })
  .filter(s => s.trim().length > 0);

// Generator for valid slug
const slugArbitrary = fc.stringMatching(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .filter(s => s.length >= 1 && s.length <= 100);

// Generator for valid price (positive decimal)
// Use Math.fround to ensure 32-bit float compatibility
const priceArbitrary = fc.float({ min: Math.fround(0.01), max: Math.fround(999999), noNaN: true })
  .map(p => Math.round(p * 100) / 100); // Round to 2 decimal places

// Generator for stock quantity
const stockArbitrary = fc.integer({ min: 0, max: 100000 });

// Generator for valid IDs (positive integers)
const idArbitrary = fc.integer({ min: 1, max: 1000 });

// Generator for optional string
const optionalStringArbitrary = fc.option(
  fc.string({ minLength: 1, maxLength: 500 }),
  { nil: undefined }
);

// Generator for optional URL
const optionalUrlArbitrary = fc.option(
  fc.webUrl(),
  { nil: undefined }
);

// Generator for string array
const stringArrayArbitrary = fc.array(
  fc.string({ minLength: 1, maxLength: 50 }),
  { minLength: 0, maxLength: 5 }
);

// Generator for valid product create input
const productCreateInputArbitrary = fc.record({
  sku: skuArbitrary,
  name: productNameArbitrary,
  slug: fc.option(slugArbitrary, { nil: undefined }),
  description: optionalStringArbitrary,
  detailedDescription: optionalStringArbitrary,
  price: priceArbitrary,
  stockQuantity: stockArbitrary,
  unit: fc.option(fc.constantFrom('Unit', 'Kg', 'Liter', 'Pack', 'Box'), { nil: undefined }),
  brandId: idArbitrary,
  categoryId: idArbitrary,
  imageUrl: optionalUrlArbitrary,
  images: fc.option(stringArrayArbitrary, { nil: undefined }),
  tags: fc.option(stringArrayArbitrary, { nil: undefined }),
  isActive: fc.option(fc.boolean(), { nil: undefined }),
  isFeatured: fc.option(fc.boolean(), { nil: undefined }),
});

// Generator for partial product update input
const productUpdateInputArbitrary = fc.record({
  sku: fc.option(skuArbitrary, { nil: undefined }),
  name: fc.option(productNameArbitrary, { nil: undefined }),
  slug: fc.option(slugArbitrary, { nil: undefined }),
  description: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  price: fc.option(priceArbitrary, { nil: undefined }),
  stockQuantity: fc.option(stockArbitrary, { nil: undefined }),
  unit: fc.option(fc.constantFrom('Unit', 'Kg', 'Liter', 'Pack', 'Box'), { nil: undefined }),
  brandId: fc.option(idArbitrary, { nil: undefined }),
  categoryId: fc.option(idArbitrary, { nil: undefined }),
  isActive: fc.option(fc.boolean(), { nil: undefined }),
  isFeatured: fc.option(fc.boolean(), { nil: undefined }),
});

// ============================================================================
// Property Tests
// ============================================================================

describe('Product CRUD Round-Trip Properties', () => {
  /**
   * Property 2: Product CRUD Round-Trip Consistency (Create)
   * 
   * For any valid product data, creating a product then reading it back 
   * should return equivalent data.
   */
  it('Property 2: Create then read returns equivalent product data', () => {
    fc.assert(
      fc.property(
        productCreateInputArbitrary,
        (input) => {
          const existingSkus = new Set<string>();
          const existingSlugs = new Set<string>();
          
          const result = createProduct(input, existingSkus, existingSlugs);
          
          // Creation should succeed for valid input
          if (!result.success || !result.product) {
            // If creation failed, it should be due to validation
            return result.error !== undefined;
          }
          
          // The created product should be equivalent to the input
          return productsAreEquivalent(input, result.product);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Product CRUD Round-Trip Consistency (Update)
   * 
   * For any valid update to an existing product, updating then reading 
   * should return the updated values.
   */
  it('Property 2: Update then read returns updated product data', () => {
    fc.assert(
      fc.property(
        productCreateInputArbitrary,
        productUpdateInputArbitrary,
        (createInput, updateInput) => {
          const existingSkus = new Set<string>();
          const existingSlugs = new Set<string>();
          
          // First create a product
          const createResult = createProduct(createInput, existingSkus, existingSlugs);
          if (!createResult.success || !createResult.product) {
            return true; // Skip if creation failed
          }
          
          // Add the created SKU to existing set
          existingSkus.add(createResult.product.sku);
          
          // Now update the product
          const updateResult = updateProduct(createResult.product, updateInput, existingSkus);
          
          if (!updateResult.success || !updateResult.product) {
            // Update can fail if SKU conflicts
            return updateResult.error !== undefined;
          }
          
          const updated = updateResult.product;
          
          // Verify each updated field matches the input
          if (updateInput.sku !== undefined) {
            if (updated.sku !== updateInput.sku.trim()) return false;
          }
          if (updateInput.name !== undefined) {
            if (updated.name !== updateInput.name.trim()) return false;
          }
          if (updateInput.price !== undefined) {
            if (updated.price !== updateInput.price) return false;
          }
          if (updateInput.stockQuantity !== undefined) {
            if (updated.stockQuantity !== updateInput.stockQuantity) return false;
          }
          if (updateInput.unit !== undefined) {
            if (updated.unit !== updateInput.unit) return false;
          }
          if (updateInput.brandId !== undefined) {
            if (updated.brandId !== updateInput.brandId) return false;
          }
          if (updateInput.categoryId !== undefined) {
            if (updated.categoryId !== updateInput.categoryId) return false;
          }
          if (updateInput.isActive !== undefined) {
            if (updated.isActive !== updateInput.isActive) return false;
          }
          if (updateInput.isFeatured !== undefined) {
            if (updated.isFeatured !== updateInput.isFeatured) return false;
          }
          
          // Fields not in update should remain unchanged
          if (updateInput.sku === undefined) {
            if (updated.sku !== createResult.product.sku) return false;
          }
          if (updateInput.price === undefined) {
            if (updated.price !== createResult.product.price) return false;
          }
          if (updateInput.brandId === undefined) {
            if (updated.brandId !== createResult.product.brandId) return false;
          }
          if (updateInput.categoryId === undefined) {
            if (updated.categoryId !== createResult.product.categoryId) return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: ID is preserved through updates
   * 
   * Updating a product should not change its ID.
   */
  it('Product ID is preserved through updates', () => {
    fc.assert(
      fc.property(
        productCreateInputArbitrary,
        productUpdateInputArbitrary,
        (createInput, updateInput) => {
          const existingSkus = new Set<string>();
          const existingSlugs = new Set<string>();
          
          const createResult = createProduct(createInput, existingSkus, existingSlugs);
          if (!createResult.success || !createResult.product) {
            return true;
          }
          
          existingSkus.add(createResult.product.sku);
          
          const updateResult = updateProduct(createResult.product, updateInput, existingSkus);
          if (!updateResult.success || !updateResult.product) {
            return true;
          }
          
          // ID should remain the same
          return updateResult.product.id === createResult.product.id;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Duplicate SKU is rejected on create
   * 
   * Creating a product with an existing SKU should fail.
   */
  it('Duplicate SKU is rejected on create', () => {
    fc.assert(
      fc.property(
        productCreateInputArbitrary,
        (input) => {
          const existingSkus = new Set<string>([input.sku.trim()]);
          const existingSlugs = new Set<string>();
          
          const result = createProduct(input, existingSkus, existingSlugs);
          
          // Should fail with SKU already exists error
          return !result.success && result.error === 'SKU already exists';
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Duplicate SKU is rejected on update
   * 
   * Updating a product to use an existing SKU should fail.
   */
  it('Duplicate SKU is rejected on update', () => {
    fc.assert(
      fc.property(
        productCreateInputArbitrary,
        skuArbitrary,
        (createInput, conflictingSku) => {
          const existingSkus = new Set<string>();
          const existingSlugs = new Set<string>();
          
          // Create the product
          const createResult = createProduct(createInput, existingSkus, existingSlugs);
          if (!createResult.success || !createResult.product) {
            return true;
          }
          
          // Add both the created SKU and a conflicting SKU
          existingSkus.add(createResult.product.sku);
          existingSkus.add(conflictingSku);
          
          // Try to update to the conflicting SKU
          if (conflictingSku === createResult.product.sku) {
            return true; // Skip if same SKU
          }
          
          const updateResult = updateProduct(
            createResult.product,
            { sku: conflictingSku },
            existingSkus
          );
          
          // Should fail with SKU already exists error
          return !updateResult.success && updateResult.error === 'SKU already exists';
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Default values are applied correctly
   * 
   * When optional fields are not provided, defaults should be applied.
   */
  it('Default values are applied correctly on create', () => {
    fc.assert(
      fc.property(
        skuArbitrary,
        productNameArbitrary,
        priceArbitrary,
        idArbitrary,
        idArbitrary,
        (sku, name, price, brandId, categoryId) => {
          const minimalInput: ProductCreateInput = {
            sku,
            name,
            price,
            brandId,
            categoryId,
            stockQuantity: 0,
          };
          
          const result = createProduct(minimalInput, new Set(), new Set());
          
          if (!result.success || !result.product) {
            return true;
          }
          
          const product = result.product;
          
          // Check defaults
          return (
            product.stockQuantity === 0 &&
            product.unit === 'Unit' &&
            product.isActive === true &&
            product.isFeatured === false &&
            product.description === null &&
            product.detailedDescription === null &&
            product.imageUrl === null &&
            product.images.length === 0 &&
            product.tags.length === 0
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Slug is generated from name when not provided
   * 
   * If slug is not provided, it should be derived from the product name.
   */
  it('Slug is generated from name when not provided', () => {
    fc.assert(
      fc.property(
        productCreateInputArbitrary.map(input => ({ ...input, slug: undefined })),
        (input) => {
          const result = createProduct(input, new Set(), new Set());
          
          if (!result.success || !result.product) {
            return true;
          }
          
          const expectedSlug = generateSlug(input.name);
          
          // Slug should start with the expected value (might have timestamp appended)
          return result.product.slug.startsWith(expectedSlug);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 4: Required Field Validation
// Feature: admin-product-crud
// Validates: Requirements 2.2
// ============================================================================

/**
 * Validation function that mirrors the service's validateProductInput logic
 * For any product creation attempt missing required fields, the service should reject with an error
 */
function validateProductInput(input: Partial<ProductCreateInput>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!input.sku || typeof input.sku !== 'string' || !input.sku.trim()) {
    errors.push('SKU is required');
  }
  if (!input.name || typeof input.name !== 'string' || !input.name.trim()) {
    errors.push('Name is required');
  }
  if (input.price === undefined || input.price === null || typeof input.price !== 'number' || input.price < 0) {
    errors.push('Price is required and must be a non-negative number');
  }
  if (!input.categoryId || typeof input.categoryId !== 'number') {
    errors.push('Category ID is required');
  }
  if (!input.brandId || typeof input.brandId !== 'number') {
    errors.push('Brand ID is required');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Simulates product creation with validation (mirrors service logic)
 */
function createProductWithValidation(
  input: Partial<ProductCreateInput>
): { success: boolean; product?: ProductReadResult; error?: string } {
  // Validate required fields first
  const validation = validateProductInput(input);
  if (!validation.valid) {
    return { success: false, error: validation.errors.join(', ') };
  }

  // If validation passes, proceed with creation
  const fullInput = input as ProductCreateInput;
  
  const product: ProductReadResult = {
    id: Math.floor(Math.random() * 1000000) + 1,
    sku: fullInput.sku.trim(),
    name: fullInput.name.trim(),
    slug: fullInput.slug || generateSlug(fullInput.name),
    description: fullInput.description || null,
    detailedDescription: fullInput.detailedDescription || null,
    price: fullInput.price,
    stockQuantity: fullInput.stockQuantity ?? 0,
    unit: fullInput.unit || 'Unit',
    brandId: fullInput.brandId,
    categoryId: fullInput.categoryId,
    imageUrl: fullInput.imageUrl || null,
    images: fullInput.images || [],
    tags: fullInput.tags || [],
    specifications: fullInput.specifications || null,
    isActive: fullInput.isActive ?? true,
    isFeatured: fullInput.isFeatured ?? false,
  };

  return { success: true, product };
}

describe('Property 4: Required Field Validation', () => {
  /**
   * Property 4: Required Field Validation - Missing SKU
   * 
   * For any product creation attempt missing SKU, the Product_Service should reject with an error.
   * **Validates: Requirements 2.2**
   */
  it('Property 4: Missing SKU is rejected', () => {
    fc.assert(
      fc.property(
        productNameArbitrary,
        priceArbitrary,
        idArbitrary,
        idArbitrary,
        stockArbitrary,
        (name, price, brandId, categoryId, stockQuantity) => {
          // Create input without SKU
          const inputWithoutSku: Partial<ProductCreateInput> = {
            name,
            price,
            brandId,
            categoryId,
            stockQuantity,
          };
          
          const result = createProductWithValidation(inputWithoutSku);
          
          // Should fail with SKU required error
          return !result.success && result.error !== undefined && result.error.includes('SKU is required');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4: Required Field Validation - Empty SKU
   * 
   * For any product creation attempt with empty/whitespace SKU, the Product_Service should reject.
   * **Validates: Requirements 2.2**
   */
  it('Property 4: Empty or whitespace SKU is rejected', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', '   ', '\t', '\n', '  \t  '),
        productNameArbitrary,
        priceArbitrary,
        idArbitrary,
        idArbitrary,
        (emptySku, name, price, brandId, categoryId) => {
          const inputWithEmptySku: Partial<ProductCreateInput> = {
            sku: emptySku,
            name,
            price,
            brandId,
            categoryId,
            stockQuantity: 0,
          };
          
          const result = createProductWithValidation(inputWithEmptySku);
          
          // Should fail with SKU required error
          return !result.success && result.error !== undefined && result.error.includes('SKU is required');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4: Required Field Validation - Missing Name
   * 
   * For any product creation attempt missing name, the Product_Service should reject with an error.
   * **Validates: Requirements 2.2**
   */
  it('Property 4: Missing name is rejected', () => {
    fc.assert(
      fc.property(
        skuArbitrary,
        priceArbitrary,
        idArbitrary,
        idArbitrary,
        stockArbitrary,
        (sku, price, brandId, categoryId, stockQuantity) => {
          // Create input without name
          const inputWithoutName: Partial<ProductCreateInput> = {
            sku,
            price,
            brandId,
            categoryId,
            stockQuantity,
          };
          
          const result = createProductWithValidation(inputWithoutName);
          
          // Should fail with name required error
          return !result.success && result.error !== undefined && result.error.includes('Name is required');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4: Required Field Validation - Empty Name
   * 
   * For any product creation attempt with empty/whitespace name, the Product_Service should reject.
   * **Validates: Requirements 2.2**
   */
  it('Property 4: Empty or whitespace name is rejected', () => {
    fc.assert(
      fc.property(
        skuArbitrary,
        fc.constantFrom('', '   ', '\t', '\n', '  \t  '),
        priceArbitrary,
        idArbitrary,
        idArbitrary,
        (sku, emptyName, price, brandId, categoryId) => {
          const inputWithEmptyName: Partial<ProductCreateInput> = {
            sku,
            name: emptyName,
            price,
            brandId,
            categoryId,
            stockQuantity: 0,
          };
          
          const result = createProductWithValidation(inputWithEmptyName);
          
          // Should fail with name required error
          return !result.success && result.error !== undefined && result.error.includes('Name is required');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4: Required Field Validation - Missing Price
   * 
   * For any product creation attempt missing price, the Product_Service should reject with an error.
   * **Validates: Requirements 2.2**
   */
  it('Property 4: Missing price is rejected', () => {
    fc.assert(
      fc.property(
        skuArbitrary,
        productNameArbitrary,
        idArbitrary,
        idArbitrary,
        stockArbitrary,
        (sku, name, brandId, categoryId, stockQuantity) => {
          // Create input without price
          const inputWithoutPrice: Partial<ProductCreateInput> = {
            sku,
            name,
            brandId,
            categoryId,
            stockQuantity,
          };
          
          const result = createProductWithValidation(inputWithoutPrice);
          
          // Should fail with price required error
          return !result.success && result.error !== undefined && result.error.includes('Price is required');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4: Required Field Validation - Negative Price
   * 
   * For any product creation attempt with negative price, the Product_Service should reject.
   * **Validates: Requirements 2.2**
   */
  it('Property 4: Negative price is rejected', () => {
    fc.assert(
      fc.property(
        skuArbitrary,
        productNameArbitrary,
        fc.float({ min: Math.fround(-999999), max: Math.fround(-0.01), noNaN: true }),
        idArbitrary,
        idArbitrary,
        (sku, name, negativePrice, brandId, categoryId) => {
          const inputWithNegativePrice: Partial<ProductCreateInput> = {
            sku,
            name,
            price: negativePrice,
            brandId,
            categoryId,
            stockQuantity: 0,
          };
          
          const result = createProductWithValidation(inputWithNegativePrice);
          
          // Should fail with price validation error
          return !result.success && result.error !== undefined && result.error.includes('Price is required');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4: Required Field Validation - Missing Category ID
   * 
   * For any product creation attempt missing categoryId, the Product_Service should reject with an error.
   * **Validates: Requirements 2.2**
   */
  it('Property 4: Missing categoryId is rejected', () => {
    fc.assert(
      fc.property(
        skuArbitrary,
        productNameArbitrary,
        priceArbitrary,
        idArbitrary,
        stockArbitrary,
        (sku, name, price, brandId, stockQuantity) => {
          // Create input without categoryId
          const inputWithoutCategoryId: Partial<ProductCreateInput> = {
            sku,
            name,
            price,
            brandId,
            stockQuantity,
          };
          
          const result = createProductWithValidation(inputWithoutCategoryId);
          
          // Should fail with categoryId required error
          return !result.success && result.error !== undefined && result.error.includes('Category ID is required');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4: Required Field Validation - Missing Brand ID
   * 
   * For any product creation attempt missing brandId, the Product_Service should reject with an error.
   * **Validates: Requirements 2.2**
   */
  it('Property 4: Missing brandId is rejected', () => {
    fc.assert(
      fc.property(
        skuArbitrary,
        productNameArbitrary,
        priceArbitrary,
        idArbitrary,
        stockArbitrary,
        (sku, name, price, categoryId, stockQuantity) => {
          // Create input without brandId
          const inputWithoutBrandId: Partial<ProductCreateInput> = {
            sku,
            name,
            price,
            categoryId,
            stockQuantity,
          };
          
          const result = createProductWithValidation(inputWithoutBrandId);
          
          // Should fail with brandId required error
          return !result.success && result.error !== undefined && result.error.includes('Brand ID is required');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4: Required Field Validation - Multiple Missing Fields
   * 
   * For any product creation attempt missing multiple required fields, all errors should be reported.
   * **Validates: Requirements 2.2**
   */
  it('Property 4: Multiple missing fields are all reported', () => {
    fc.assert(
      fc.property(
        fc.record({
          hasSku: fc.boolean(),
          hasName: fc.boolean(),
          hasPrice: fc.boolean(),
          hasCategoryId: fc.boolean(),
          hasBrandId: fc.boolean(),
        }).filter(flags => {
          // At least one field must be missing
          return !flags.hasSku || !flags.hasName || !flags.hasPrice || !flags.hasCategoryId || !flags.hasBrandId;
        }),
        skuArbitrary,
        productNameArbitrary,
        priceArbitrary,
        idArbitrary,
        idArbitrary,
        (flags, sku, name, price, categoryId, brandId) => {
          const input: Partial<ProductCreateInput> = {
            stockQuantity: 0,
          };
          
          if (flags.hasSku) input.sku = sku;
          if (flags.hasName) input.name = name;
          if (flags.hasPrice) input.price = price;
          if (flags.hasCategoryId) input.categoryId = categoryId;
          if (flags.hasBrandId) input.brandId = brandId;
          
          const result = createProductWithValidation(input);
          
          // Should fail
          if (result.success) return false;
          
          // Count expected errors
          let expectedErrorCount = 0;
          if (!flags.hasSku) expectedErrorCount++;
          if (!flags.hasName) expectedErrorCount++;
          if (!flags.hasPrice) expectedErrorCount++;
          if (!flags.hasCategoryId) expectedErrorCount++;
          if (!flags.hasBrandId) expectedErrorCount++;
          
          // Verify error message contains all expected errors
          const errorParts = result.error?.split(', ') || [];
          return errorParts.length === expectedErrorCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4: Required Field Validation - Valid Input Passes
   * 
   * For any product creation attempt with all required fields, validation should pass.
   * **Validates: Requirements 2.2**
   */
  it('Property 4: Valid input with all required fields passes validation', () => {
    fc.assert(
      fc.property(
        productCreateInputArbitrary,
        (input) => {
          const result = createProductWithValidation(input);
          
          // Should succeed for valid input
          return result.success && result.product !== undefined;
        }
      ),
      { numRuns: 100 }
    );
  });
});


// ============================================================================
// Property 5: Admin/Public Data Consistency
// Feature: admin-product-crud
// Validates: Requirements 3.4, 4.3
// ============================================================================

/**
 * Simulates admin service product read (mirrors admin product.service.ts)
 */
interface AdminProductResult {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  imageUrl: string | null;
  images: string[];
  price: number;
  stock: number;
  unit: string | null;
  isActive: boolean;
  isFeatured: boolean;
  category: string | null;
  categoryId: number | null;
  brand: string | null;
  brandId: number | null;
  views: number;
  quotes: number;
  createdAt: Date;
}

/**
 * Simulates public service product read (mirrors productService.ts)
 */
interface PublicProductResult {
  id: number;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  brandId: number;
  category: string;
  categorySlug: string;
  description?: string;
  detailedDescription?: string;
  price: number;
  unit: string;
  inStock: boolean;
  quantity: number;
  images: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  imageUrl: string;
}

/**
 * Simulates a product in the database
 */
interface DatabaseProduct {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  detailedDescription: string | null;
  price: number;
  stockQuantity: number;
  unit: string;
  imageUrl: string | null;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  brandId: number;
  brandName: string;
  brandSlug: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  views: number;
  quotes: number;
  createdAt: Date;
}

/**
 * Transform database product to admin format (mirrors admin service)
 */
function transformToAdminFormat(dbProduct: DatabaseProduct): AdminProductResult {
  return {
    id: dbProduct.id.toString(),
    name: dbProduct.name,
    slug: dbProduct.slug,
    sku: dbProduct.sku,
    description: dbProduct.description,
    imageUrl: dbProduct.imageUrl,
    images: dbProduct.images,
    price: dbProduct.price,
    stock: dbProduct.stockQuantity,
    unit: dbProduct.unit,
    isActive: dbProduct.isActive,
    isFeatured: dbProduct.isFeatured,
    category: dbProduct.categoryName,
    categoryId: dbProduct.categoryId,
    brand: dbProduct.brandName,
    brandId: dbProduct.brandId,
    views: dbProduct.views,
    quotes: dbProduct.quotes,
    createdAt: dbProduct.createdAt,
  };
}

/**
 * Transform database product to public format (mirrors public service)
 */
function transformToPublicFormat(dbProduct: DatabaseProduct): PublicProductResult {
  return {
    id: dbProduct.id,
    sku: dbProduct.sku,
    name: dbProduct.name,
    slug: dbProduct.slug,
    brand: dbProduct.brandName,
    brandId: dbProduct.brandId,
    category: dbProduct.categoryName,
    categorySlug: dbProduct.categorySlug,
    description: dbProduct.description || undefined,
    detailedDescription: dbProduct.detailedDescription || undefined,
    price: dbProduct.price,
    unit: dbProduct.unit,
    inStock: dbProduct.stockQuantity > 0,
    quantity: dbProduct.stockQuantity,
    images: dbProduct.images,
    tags: dbProduct.tags,
    isActive: dbProduct.isActive,
    isFeatured: dbProduct.isFeatured,
    imageUrl: dbProduct.imageUrl || dbProduct.images[0] || '/images/products/placeholder.jpg',
  };
}

/**
 * Compare core product data between admin and public formats
 * Core fields: id, name, price, description, images
 */
function coreDataMatches(admin: AdminProductResult, publicProduct: PublicProductResult): boolean {
  // ID should match (admin uses string, public uses number)
  if (parseInt(admin.id) !== publicProduct.id) return false;
  
  // Name must match exactly
  if (admin.name !== publicProduct.name) return false;
  
  // Price must match
  if (admin.price !== publicProduct.price) return false;
  
  // Description should match (admin uses null, public uses undefined for missing)
  const adminDesc = admin.description || undefined;
  if (adminDesc !== publicProduct.description) return false;
  
  // Images array should match
  if (admin.images.length !== publicProduct.images.length) return false;
  if (!admin.images.every((img, i) => img === publicProduct.images[i])) return false;
  
  // SKU should match
  if (admin.sku !== publicProduct.sku) return false;
  
  // Slug should match
  if (admin.slug !== publicProduct.slug) return false;
  
  return true;
}

// Generator for database product
const databaseProductArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 1000000 }),
  sku: skuArbitrary,
  name: productNameArbitrary,
  slug: slugArbitrary,
  description: fc.option(fc.string({ maxLength: 500 }), { nil: null }),
  detailedDescription: fc.option(fc.string({ maxLength: 1000 }), { nil: null }),
  price: priceArbitrary,
  stockQuantity: stockArbitrary,
  unit: fc.constantFrom('Unit', 'Kg', 'Liter', 'Pack', 'Box'),
  imageUrl: fc.option(fc.webUrl(), { nil: null }),
  images: stringArrayArbitrary,
  isActive: fc.boolean(),
  isFeatured: fc.boolean(),
  tags: stringArrayArbitrary,
  brandId: idArbitrary,
  brandName: fc.string({ minLength: 1, maxLength: 50 }),
  brandSlug: slugArbitrary,
  categoryId: idArbitrary,
  categoryName: fc.string({ minLength: 1, maxLength: 50 }),
  categorySlug: slugArbitrary,
  views: fc.integer({ min: 0, max: 10000 }),
  quotes: fc.integer({ min: 0, max: 1000 }),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
});

describe('Property 5: Admin/Public Data Consistency', () => {
  /**
   * Property 5: Admin/Public Data Consistency
   * 
   * For any product in the database, querying via admin service and public service 
   * should return the same core product data (id, name, price, description, images).
   * 
   * **Validates: Requirements 3.4, 4.3**
   */
  it('Property 5: Admin and public services return consistent core data', () => {
    fc.assert(
      fc.property(
        databaseProductArbitrary,
        (dbProduct) => {
          // Transform to both formats
          const adminResult = transformToAdminFormat(dbProduct);
          const publicResult = transformToPublicFormat(dbProduct);
          
          // Core data should match
          return coreDataMatches(adminResult, publicResult);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: ID consistency between admin and public
   * 
   * The product ID should be the same in both admin and public views.
   */
  it('Property 5: Product ID is consistent between admin and public', () => {
    fc.assert(
      fc.property(
        databaseProductArbitrary,
        (dbProduct) => {
          const adminResult = transformToAdminFormat(dbProduct);
          const publicResult = transformToPublicFormat(dbProduct);
          
          // Admin uses string ID, public uses number ID
          return parseInt(adminResult.id) === publicResult.id;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: Price consistency between admin and public
   * 
   * The product price should be identical in both admin and public views.
   */
  it('Property 5: Product price is consistent between admin and public', () => {
    fc.assert(
      fc.property(
        databaseProductArbitrary,
        (dbProduct) => {
          const adminResult = transformToAdminFormat(dbProduct);
          const publicResult = transformToPublicFormat(dbProduct);
          
          return adminResult.price === publicResult.price;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: Name consistency between admin and public
   * 
   * The product name should be identical in both admin and public views.
   */
  it('Property 5: Product name is consistent between admin and public', () => {
    fc.assert(
      fc.property(
        databaseProductArbitrary,
        (dbProduct) => {
          const adminResult = transformToAdminFormat(dbProduct);
          const publicResult = transformToPublicFormat(dbProduct);
          
          return adminResult.name === publicResult.name;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: Images consistency between admin and public
   * 
   * The product images array should be identical in both admin and public views.
   */
  it('Property 5: Product images are consistent between admin and public', () => {
    fc.assert(
      fc.property(
        databaseProductArbitrary,
        (dbProduct) => {
          const adminResult = transformToAdminFormat(dbProduct);
          const publicResult = transformToPublicFormat(dbProduct);
          
          if (adminResult.images.length !== publicResult.images.length) return false;
          return adminResult.images.every((img, i) => img === publicResult.images[i]);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: Stock quantity consistency
   * 
   * Admin shows stockQuantity as 'stock', public shows it as 'quantity' and derives 'inStock'.
   */
  it('Property 5: Stock quantity is consistent between admin and public', () => {
    fc.assert(
      fc.property(
        databaseProductArbitrary,
        (dbProduct) => {
          const adminResult = transformToAdminFormat(dbProduct);
          const publicResult = transformToPublicFormat(dbProduct);
          
          // Admin 'stock' should equal public 'quantity'
          if (adminResult.stock !== publicResult.quantity) return false;
          
          // Public 'inStock' should be derived correctly
          const expectedInStock = adminResult.stock > 0;
          return publicResult.inStock === expectedInStock;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 6: Delete Visibility
// Feature: admin-product-crud
// Validates: Requirements 5.1, 5.3
// ============================================================================

/**
 * Simulates public product listing (only active products)
 */
function getPublicProductListing(products: DatabaseProduct[]): PublicProductResult[] {
  return products
    .filter(p => p.isActive)
    .map(transformToPublicFormat);
}

/**
 * Simulates soft delete (sets isActive to false)
 */
function softDeleteProduct(product: DatabaseProduct): DatabaseProduct {
  return { ...product, isActive: false };
}

/**
 * Simulates hard delete (removes from array)
 */
function hardDeleteProduct(products: DatabaseProduct[], productId: number): DatabaseProduct[] {
  return products.filter(p => p.id !== productId);
}

describe('Property 6: Delete Visibility', () => {
  /**
   * Property 6: Delete Visibility - Soft Delete
   * 
   * For any product that is soft-deleted (isActive=false), the product should not 
   * appear in public product listings (where isActive=true is applied).
   * 
   * **Validates: Requirements 5.1, 5.3**
   */
  it('Property 6: Soft-deleted products do not appear in public listings', () => {
    fc.assert(
      fc.property(
        fc.array(databaseProductArbitrary, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 0, max: 19 }),
        (products, deleteIndex) => {
          // Ensure we have a valid index
          const actualIndex = deleteIndex % products.length;
          const productToDelete = products[actualIndex];
          
          // Soft delete the product
          const updatedProducts = products.map((p, i) => 
            i === actualIndex ? softDeleteProduct(p) : p
          );
          
          // Get public listing
          const publicListing = getPublicProductListing(updatedProducts);
          
          // The soft-deleted product should not appear in public listing
          const deletedProductInListing = publicListing.find(p => p.id === productToDelete.id);
          return deletedProductInListing === undefined;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: Delete Visibility - Hard Delete
   * 
   * For any product that is hard-deleted, the product should not appear in 
   * public product listings.
   * 
   * **Validates: Requirements 5.1, 5.3**
   */
  it('Property 6: Hard-deleted products do not appear in public listings', () => {
    fc.assert(
      fc.property(
        fc.array(databaseProductArbitrary, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 0, max: 19 }),
        (products, deleteIndex) => {
          // Ensure we have a valid index
          const actualIndex = deleteIndex % products.length;
          const productToDelete = products[actualIndex];
          
          // Hard delete the product
          const updatedProducts = hardDeleteProduct(products, productToDelete.id);
          
          // Get public listing
          const publicListing = getPublicProductListing(updatedProducts);
          
          // The hard-deleted product should not appear in public listing
          const deletedProductInListing = publicListing.find(p => p.id === productToDelete.id);
          return deletedProductInListing === undefined;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: Active products remain visible after other deletions
   * 
   * When a product is deleted, other active products should still be visible.
   */
  it('Property 6: Active products remain visible after other deletions', () => {
    fc.assert(
      fc.property(
        fc.array(databaseProductArbitrary.map(p => ({ ...p, isActive: true })), { minLength: 2, maxLength: 20 }),
        fc.integer({ min: 0, max: 19 }),
        (products, deleteIndex) => {
          // Ensure we have a valid index
          const actualIndex = deleteIndex % products.length;
          
          // Count active products before deletion
          const activeBeforeDeletion = products.filter(p => p.isActive).length;
          
          // Soft delete one product
          const updatedProducts = products.map((p, i) => 
            i === actualIndex ? softDeleteProduct(p) : p
          );
          
          // Get public listing
          const publicListing = getPublicProductListing(updatedProducts);
          
          // Should have one less product in listing
          return publicListing.length === activeBeforeDeletion - 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: Inactive products are never visible in public listings
   * 
   * Products with isActive=false should never appear in public listings,
   * regardless of how they became inactive.
   */
  it('Property 6: Inactive products are never visible in public listings', () => {
    fc.assert(
      fc.property(
        fc.array(databaseProductArbitrary, { minLength: 1, maxLength: 20 }),
        (products) => {
          // Get public listing
          const publicListing = getPublicProductListing(products);
          
          // All products in public listing should be active
          const allActive = publicListing.every(p => p.isActive);
          
          // No inactive products should be in the listing
          const inactiveProducts = products.filter(p => !p.isActive);
          const noInactiveInListing = inactiveProducts.every(
            inactive => !publicListing.find(p => p.id === inactive.id)
          );
          
          return allActive && noInactiveInListing;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: Public listing count matches active product count
   * 
   * The number of products in public listing should equal the number of active products.
   */
  it('Property 6: Public listing count matches active product count', () => {
    fc.assert(
      fc.property(
        fc.array(databaseProductArbitrary, { minLength: 0, maxLength: 20 }),
        (products) => {
          const activeCount = products.filter(p => p.isActive).length;
          const publicListing = getPublicProductListing(products);
          
          return publicListing.length === activeCount;
        }
      ),
      { numRuns: 100 }
    );
  });
});
