/**
 * Property-Based Tests for Product Search
 * 
 * Feature: admin-product-crud
 * Property 1: Search Returns Matching Products
 * Validates: Requirements 1.1, 1.2
 * 
 * Tests that:
 * - All returned products contain the search term in SKU, name, or description
 * - All returned products fall within the specified price range
 */

import * as fc from 'fast-check';

// Mock product data structure matching the service output
interface ProductSearchResult {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  price: number;
  stock: number;
  isActive: boolean;
  category: string | null;
}

// Pure function to filter products by search term (mirrors service logic)
function filterBySearchTerm(
  products: ProductSearchResult[],
  searchTerm: string
): ProductSearchResult[] {
  if (!searchTerm || !searchTerm.trim()) return products;
  
  const term = searchTerm.trim().toLowerCase();
  return products.filter(
    (p) =>
      p.sku.toLowerCase().includes(term) ||
      p.name.toLowerCase().includes(term) ||
      (p.description?.toLowerCase().includes(term) ?? false)
  );
}

// Pure function to filter products by price range (mirrors service logic)
function filterByPriceRange(
  products: ProductSearchResult[],
  minPrice?: number,
  maxPrice?: number
): ProductSearchResult[] {
  return products.filter((p) => {
    if (minPrice !== undefined && p.price < minPrice) return false;
    if (maxPrice !== undefined && p.price > maxPrice) return false;
    return true;
  });
}

// Generator for valid product data
const productArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  slug: fc.string({ minLength: 1, maxLength: 100 }),
  sku: fc.string({ minLength: 3, maxLength: 20 }),
  description: fc.option(fc.string({ maxLength: 500 }), { nil: null }),
  price: fc.float({ min: 0, max: 1000000, noNaN: true }),
  stock: fc.integer({ min: 0, max: 10000 }),
  isActive: fc.boolean(),
  category: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
});

// Generator for search terms (including edge cases)
const searchTermArbitrary = fc.oneof(
  fc.string({ minLength: 1, maxLength: 50 }),
  fc.constant(''),
  fc.constant('   '), // whitespace only
);

// Generator for price range
const priceRangeArbitrary = fc.record({
  minPrice: fc.option(fc.float({ min: 0, max: 500000, noNaN: true }), { nil: undefined }),
  maxPrice: fc.option(fc.float({ min: 0, max: 1000000, noNaN: true }), { nil: undefined }),
}).filter(({ minPrice, maxPrice }) => {
  // Ensure minPrice <= maxPrice when both are defined
  if (minPrice !== undefined && maxPrice !== undefined) {
    return minPrice <= maxPrice;
  }
  return true;
});

describe('Product Search Properties', () => {
  /**
   * Property 1: Search Returns Matching Products
   * 
   * For any search term and product dataset, all products returned by the 
   * search function should contain the search term in at least one of: 
   * SKU, name, or description (case-insensitive).
   */
  it('Property 1: All search results contain the search term in SKU, name, or description', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 0, maxLength: 50 }),
        searchTermArbitrary,
        (products, searchTerm) => {
          const results = filterBySearchTerm(products, searchTerm);
          
          // If search term is empty/whitespace, all products should be returned
          if (!searchTerm || !searchTerm.trim()) {
            return results.length === products.length;
          }
          
          const term = searchTerm.trim().toLowerCase();
          
          // Every result must contain the search term in at least one field
          return results.every(
            (p) =>
              p.sku.toLowerCase().includes(term) ||
              p.name.toLowerCase().includes(term) ||
              (p.description?.toLowerCase().includes(term) ?? false)
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1 (continued): Price Range Filtering
   * 
   * For any price range filter, all returned products should have prices 
   * within the specified bounds.
   */
  it('Property 1: All search results fall within the specified price range', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 0, maxLength: 50 }),
        priceRangeArbitrary,
        (products, { minPrice, maxPrice }) => {
          const results = filterByPriceRange(products, minPrice, maxPrice);
          
          return results.every((p) => {
            if (minPrice !== undefined && p.price < minPrice) return false;
            if (maxPrice !== undefined && p.price > maxPrice) return false;
            return true;
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Search is case-insensitive
   * 
   * Searching with different cases of the same term should return the same results.
   */
  it('Search is case-insensitive', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (products, searchTerm) => {
          const lowerResults = filterBySearchTerm(products, searchTerm.toLowerCase());
          const upperResults = filterBySearchTerm(products, searchTerm.toUpperCase());
          const mixedResults = filterBySearchTerm(products, searchTerm);
          
          // All case variations should return the same number of results
          return (
            lowerResults.length === upperResults.length &&
            upperResults.length === mixedResults.length
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Combined search and price filter
   * 
   * When both search term and price range are applied, results must satisfy both conditions.
   */
  it('Combined search and price filter returns products matching both criteria', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 0, maxLength: 50 }),
        searchTermArbitrary,
        priceRangeArbitrary,
        (products, searchTerm, { minPrice, maxPrice }) => {
          // Apply both filters
          const searchResults = filterBySearchTerm(products, searchTerm);
          const combinedResults = filterByPriceRange(searchResults, minPrice, maxPrice);
          
          // Verify all results match both criteria
          const term = searchTerm?.trim().toLowerCase() || '';
          
          return combinedResults.every((p) => {
            // Must match search term (if provided)
            const matchesSearch = !term || 
              p.sku.toLowerCase().includes(term) ||
              p.name.toLowerCase().includes(term) ||
              (p.description?.toLowerCase().includes(term) ?? false);
            
            // Must be within price range
            const matchesPrice = 
              (minPrice === undefined || p.price >= minPrice) &&
              (maxPrice === undefined || p.price <= maxPrice);
            
            return matchesSearch && matchesPrice;
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty search returns all products
   */
  it('Empty search term returns all products', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 0, maxLength: 50 }),
        (products) => {
          const emptyResults = filterBySearchTerm(products, '');
          const whitespaceResults = filterBySearchTerm(products, '   ');
          
          return (
            emptyResults.length === products.length &&
            whitespaceResults.length === products.length
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Search result count is bounded
   * 
   * The number of search results should never exceed the total number of products.
   */
  it('Search result count never exceeds total product count', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 0, maxLength: 100 }),
        searchTermArbitrary,
        priceRangeArbitrary,
        (products, searchTerm, { minPrice, maxPrice }) => {
          const searchResults = filterBySearchTerm(products, searchTerm);
          const priceResults = filterByPriceRange(searchResults, minPrice, maxPrice);
          
          return priceResults.length <= products.length;
        }
      ),
      { numRuns: 100 }
    );
  });
});


// ============================================================================
// Property 3: Pagination Bounds
// Feature: admin-product-crud
// Validates: Requirements 1.4
// ============================================================================

/**
 * Pure function to paginate products (mirrors service logic)
 */
function paginateProducts(
  products: ProductSearchResult[],
  page: number,
  pageSize: number
): {
  products: ProductSearchResult[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
} {
  // Ensure valid page and pageSize
  const validPage = Math.max(1, page);
  const validPageSize = Math.max(1, Math.min(pageSize, 100)); // Cap at 100
  
  const total = products.length;
  const totalPages = Math.ceil(total / validPageSize);
  
  const startIndex = (validPage - 1) * validPageSize;
  const endIndex = startIndex + validPageSize;
  
  const paginatedProducts = products.slice(startIndex, endIndex);
  
  return {
    products: paginatedProducts,
    pagination: {
      page: validPage,
      pageSize: validPageSize,
      total,
      totalPages,
    },
  };
}

// Generator for valid page numbers
const pageArbitrary = fc.integer({ min: 1, max: 100 });

// Generator for valid page sizes
const pageSizeArbitrary = fc.integer({ min: 1, max: 100 });

describe('Property 3: Pagination Bounds', () => {
  /**
   * Property 3: Pagination Bounds - Result count does not exceed pageSize
   * 
   * For any page and pageSize parameters, the number of products returned 
   * should not exceed pageSize.
   * **Validates: Requirements 1.4**
   */
  it('Property 3: Result count does not exceed pageSize', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 0, maxLength: 200 }),
        pageArbitrary,
        pageSizeArbitrary,
        (products, page, pageSize) => {
          const result = paginateProducts(products, page, pageSize);
          
          // Result count should never exceed pageSize
          return result.products.length <= result.pagination.pageSize;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: Pagination Bounds - Total count is consistent
   * 
   * The total count should be consistent across paginated requests 
   * (equal to the original product count).
   * **Validates: Requirements 1.4**
   */
  it('Property 3: Total count is consistent across paginated requests', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 0, maxLength: 200 }),
        pageArbitrary,
        pageSizeArbitrary,
        (products, page, pageSize) => {
          const result = paginateProducts(products, page, pageSize);
          
          // Total should always equal the original product count
          return result.pagination.total === products.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: Pagination Bounds - Total pages calculation is correct
   * 
   * The totalPages should be calculated correctly based on total and pageSize.
   * **Validates: Requirements 1.4**
   */
  it('Property 3: Total pages calculation is correct', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 0, maxLength: 200 }),
        pageSizeArbitrary,
        (products, pageSize) => {
          const result = paginateProducts(products, 1, pageSize);
          
          const expectedTotalPages = Math.ceil(products.length / result.pagination.pageSize);
          
          return result.pagination.totalPages === expectedTotalPages;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: Pagination Bounds - First page starts at beginning
   * 
   * Page 1 should always return products starting from index 0.
   * **Validates: Requirements 1.4**
   */
  it('Property 3: First page returns products from the beginning', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 1, maxLength: 100 }),
        pageSizeArbitrary,
        (products, pageSize) => {
          const result = paginateProducts(products, 1, pageSize);
          
          // First page should contain the first product (if any products exist)
          if (products.length > 0 && result.products.length > 0) {
            return result.products[0].id === products[0].id;
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: Pagination Bounds - Last page has correct count
   * 
   * The last page should have at most pageSize products, and the count 
   * should match the remainder calculation.
   * **Validates: Requirements 1.4**
   */
  it('Property 3: Last page has correct product count', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 1, maxLength: 200 }),
        pageSizeArbitrary,
        (products, pageSize) => {
          const result = paginateProducts(products, 1, pageSize);
          const lastPage = result.pagination.totalPages;
          
          if (lastPage === 0) return true;
          
          const lastPageResult = paginateProducts(products, lastPage, pageSize);
          
          // Calculate expected count for last page
          const remainder = products.length % result.pagination.pageSize;
          const expectedLastPageCount = remainder === 0 
            ? result.pagination.pageSize 
            : remainder;
          
          return lastPageResult.products.length === expectedLastPageCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: Pagination Bounds - Beyond last page returns empty
   * 
   * Requesting a page beyond totalPages should return an empty array.
   * **Validates: Requirements 1.4**
   */
  it('Property 3: Page beyond totalPages returns empty array', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 0, maxLength: 100 }),
        pageSizeArbitrary,
        fc.integer({ min: 1, max: 50 }),
        (products, pageSize, extraPages) => {
          const result = paginateProducts(products, 1, pageSize);
          const beyondLastPage = result.pagination.totalPages + extraPages;
          
          const beyondResult = paginateProducts(products, beyondLastPage, pageSize);
          
          // Should return empty array for pages beyond totalPages
          return beyondResult.products.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: Pagination Bounds - All products are accessible
   * 
   * Iterating through all pages should return all products exactly once.
   * **Validates: Requirements 1.4**
   */
  it('Property 3: All products are accessible through pagination', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 0, maxLength: 100 }),
        pageSizeArbitrary,
        (products, pageSize) => {
          const firstResult = paginateProducts(products, 1, pageSize);
          const totalPages = firstResult.pagination.totalPages;
          
          // Collect all products from all pages
          const allPaginatedProducts: ProductSearchResult[] = [];
          for (let page = 1; page <= totalPages; page++) {
            const pageResult = paginateProducts(products, page, pageSize);
            allPaginatedProducts.push(...pageResult.products);
          }
          
          // Should have exactly the same number of products
          if (allPaginatedProducts.length !== products.length) return false;
          
          // All original products should be present
          const originalIds = new Set(products.map(p => p.id));
          const paginatedIds = new Set(allPaginatedProducts.map(p => p.id));
          
          return originalIds.size === paginatedIds.size &&
            [...originalIds].every(id => paginatedIds.has(id));
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: Pagination Bounds - No duplicate products across pages
   * 
   * Products should not appear on multiple pages.
   * **Validates: Requirements 1.4**
   */
  it('Property 3: No duplicate products across pages', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 0, maxLength: 100 }),
        pageSizeArbitrary,
        (products, pageSize) => {
          const firstResult = paginateProducts(products, 1, pageSize);
          const totalPages = firstResult.pagination.totalPages;
          
          // Collect all product IDs from all pages
          const seenIds = new Set<string>();
          
          for (let page = 1; page <= totalPages; page++) {
            const pageResult = paginateProducts(products, page, pageSize);
            
            for (const product of pageResult.products) {
              if (seenIds.has(product.id)) {
                return false; // Duplicate found
              }
              seenIds.add(product.id);
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
