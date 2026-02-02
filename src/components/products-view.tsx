
'use client';
import { useState, useEffect } from 'react';
import { getAllProducts, getBrandStats, getBrands, getCategories } from '@/services/productService';
import { ProductCard } from '@/components/product-card';
import { BrandCard } from '@/components/ui/brand-card';
import { SimplifiedCategoryCard } from '@/components/ui/simplified-category-card'; // Import the new card
import { Section, SectionTitle, SectionHeading, SectionDescription } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Product, Brand, Category } from '@/lib/schema';
import FeaturedContent from '@/components/ui/featured-content';

interface ProductsViewProps {
  title?: string;
}

const PRODUCTS_PER_PAGE = 12;

export default function ProductsView({ title = 'All Products' }: ProductsViewProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [brandStats, setBrandStats] = useState<Record<string, { productCount: number; categoryCount: number }>>({});
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [products, brandStatsData, brandData, categoryData] = await Promise.all([
        getAllProducts(),
        getBrandStats(),
        getBrands(),
        getCategories(),
      ]);
      setAllProducts(products || []);
      setBrandStats(brandStatsData || {});
      setBrands(brandData || []);
      setCategories(categoryData || []);
    };
    fetchData();
  }, []);

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Calculate pagination for products
  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const paginatedProducts = allProducts.slice(startIndex, endIndex);

  // Generate page numbers for pagination display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <>
      <Section id="all-products" className="section-padding-md">
          <SectionHeading className="text-center">
              <SectionTitle>{title}</SectionTitle>
              <SectionDescription>Browse our extensive catalog of quality products.</SectionDescription>
          </SectionHeading>

          <div className="flex justify-center py-4 gap-2 flex-wrap">
              <Button onClick={() => handleFilterClick('all')} variant={activeFilter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs sm:text-sm">All</Button>
              <Button onClick={() => handleFilterClick('brand')} variant={activeFilter === 'brand' ? 'default' : 'outline'} size="sm" className="text-xs sm:text-sm">Shop by Brand</Button>
              <Button onClick={() => handleFilterClick('category')} variant={activeFilter === 'category' ? 'default' : 'outline'} size="sm" className="text-xs sm:text-sm">Shop by Category</Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-fluid-sm">
              {activeFilter === 'all' && paginatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
              ))}
              {activeFilter === 'brand' && brands.map(brand => {
                  const stats = brandStats[brand.name] || { productCount: 0, categoryCount: 0 };
                  return <BrandCard key={String(brand.id)} brand={{...brand, imageUrl: brand.imageUrl || undefined, productCount: stats.productCount}} variant="minimal" />;
              })}
              {activeFilter === 'category' && categories.map(category => (
                  <SimplifiedCategoryCard key={category.id} category={category} />
              ))}
          </div>

          {/* View All Buttons for Brand and Category Tabs */}
          {activeFilter === 'brand' && (
            <div className="mt-12 flex justify-center">
              <Button asChild size="lg" variant="secondary">
                <a href="/products/brands">View All Brands</a>
              </Button>
            </div>
          )}

          {activeFilter === 'category' && (
            <div className="mt-12 flex justify-center">
              <Button asChild size="lg" variant="secondary">
                <a href="/products/categories">View All Categories</a>
              </Button>
            </div>
          )}

          {/* Pagination Controls - Only show for products view */}
          {activeFilter === 'all' && totalPages > 1 && (
            <div className="mt-12">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>

                  {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          isActive={currentPage === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page as number);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
      </Section>
      <FeaturedContent />
    </>
  );
}
