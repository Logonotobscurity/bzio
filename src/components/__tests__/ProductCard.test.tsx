import { render, screen } from '@testing-library/react';
import ProductCard from '@/components/product-card';

describe('ProductCard', () => {
  const product = {
    product_slug: 'test-product',
    product_name: 'Test Product',
    brand_name: 'Test Brand',
    bzion_wholesale_price_ngn: 100,
    market_retail_price_ngn: 120,
    image_url: '/test-image.jpg',
  };

  it('renders product information', () => {
    render(<ProductCard product={product} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
    expect(screen.getByText('₦100')).toBeInTheDocument();
  });
});
