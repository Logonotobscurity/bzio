import {
  fetchProducts,
  fetchCategories,
  fetchBrands,
  fetchQuoteRequests,
  fetchFormSubmissions,
  createQuoteRequest,
  submitContactForm,
  subscribeNewsletter,
} from '../hooks';

// Mock axios
jest.mock('axios');
import axios from 'axios';

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('React Query API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchProducts', () => {
    it('should fetch products with default pagination', async () => {
      const mockProducts = {
        products: [{ id: '1', name: 'Product 1', price: 100 }],
        totalPages: 1,
      };

      mockAxios.get.mockResolvedValue({ data: mockProducts });

      const result = await fetchProducts();

      expect(mockAxios.get).toHaveBeenCalledWith('/api/products', {
        params: { page: 1, limit: 18 },
      });
      expect(result).toEqual(mockProducts);
    });

    it('should fetch products with custom pagination', async () => {
      const mockProducts = { products: [], totalPages: 5 };
      mockAxios.get.mockResolvedValue({ data: mockProducts });

      await fetchProducts(3, 25);

      expect(mockAxios.get).toHaveBeenCalledWith('/api/products', {
        params: { page: 3, limit: 25 },
      });
    });

    it('should handle fetch errors', async () => {
      const error = new Error('Network error');
      mockAxios.get.mockRejectedValue(error);

      await expect(fetchProducts()).rejects.toThrow('Network error');
    });
  });

  describe('fetchCategories', () => {
    it('should fetch all categories', async () => {
      const mockCategories = [
        { id: '1', name: 'Electronics', slug: 'electronics' },
        { id: '2', name: 'Books', slug: 'books' },
      ];

      mockAxios.get.mockResolvedValue({ data: mockCategories });

      const result = await fetchCategories();

      expect(mockAxios.get).toHaveBeenCalledWith('/api/categories');
      expect(result).toEqual(mockCategories);
    });

    it('should handle empty categories', async () => {
      mockAxios.get.mockResolvedValue({ data: [] });

      const result = await fetchCategories();

      expect(result).toEqual([]);
    });
  });

  describe('fetchBrands', () => {
    it('should fetch all brands', async () => {
      const mockBrands = [
        { id: '1', name: 'Brand A', logo: 'https://example.com/logo.png' },
        { id: '2', name: 'Brand B', logo: 'https://example.com/logo2.png' },
      ];

      mockAxios.get.mockResolvedValue({ data: mockBrands });

      const result = await fetchBrands();

      expect(mockAxios.get).toHaveBeenCalledWith('/api/brands');
      expect(result).toEqual(mockBrands);
    });
  });

  describe('fetchQuoteRequests', () => {
    it('should fetch all quote requests', async () => {
      const mockQuotes = [
        {
          id: '1',
          productId: '1',
          quantity: 100,
          companyName: 'ABC Corp',
          status: "PENDING",
        },
      ];

      mockAxios.get.mockResolvedValue({ data: mockQuotes });

      const result = await fetchQuoteRequests();

      expect(mockAxios.get).toHaveBeenCalledWith('/api/quote-requests');
      expect(result).toEqual(mockQuotes);
    });
  });

  describe('fetchFormSubmissions', () => {
    it('should fetch all form submissions', async () => {
      const mockForms = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Test message',
        },
      ];

      mockAxios.get.mockResolvedValue({ data: mockForms });

      const result = await fetchFormSubmissions();

      expect(mockAxios.get).toHaveBeenCalledWith('/api/forms');
      expect(result).toEqual(mockForms);
    });
  });

  describe('createQuoteRequest', () => {
    it('should create a new quote request', async () => {
      const quoteData = {
        productId: '1',
        quantity: 50,
        companyName: 'Test Corp',
        email: 'test@example.com',
      };
      const mockResponse = { id: '1', ...quoteData, status: "PENDING" };

      mockAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await createQuoteRequest(quoteData);

      expect(mockAxios.post).toHaveBeenCalledWith('/api/quote-requests', quoteData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle creation errors', async () => {
      const error = new Error('Validation failed');
      mockAxios.post.mockRejectedValue(error);

      await expect(createQuoteRequest({})).rejects.toThrow('Validation failed');
    });
  });

  describe('submitContactForm', () => {
    it('should submit a contact form', async () => {
      const formData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '1234567890',
        message: 'Contact message',
      };
      const mockResponse = { id: '1', ...formData, createdAt: new Date().toISOString() };

      mockAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await submitContactForm(formData);

      expect(mockAxios.post).toHaveBeenCalledWith('/api/forms', formData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('subscribeNewsletter', () => {
    it('should subscribe to newsletter', async () => {
      const email = 'subscriber@example.com';
      const mockResponse = { id: '1', email, subscribedAt: new Date().toISOString() };

      mockAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await subscribeNewsletter(email);

      expect(mockAxios.post).toHaveBeenCalledWith('/api/newsletter-subscribe', { email });
      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid email', async () => {
      const error = new Error('Invalid email');
      mockAxios.post.mockRejectedValue(error);

      await expect(subscribeNewsletter('invalid')).rejects.toThrow('Invalid email');
    });
  });

  describe('Error handling', () => {
    it('should preserve error messages from server', async () => {
      const serverError = {
        response: {
          status: 400,
          data: { message: 'Bad request' },
        },
      };

      mockAxios.get.mockRejectedValue(serverError);

      try {
        await fetchProducts();
      } catch (error) {
        expect((error as any).response.status).toBe(400);
      }
    });

    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Request timeout');
      mockAxios.get.mockRejectedValue(timeoutError);

      await expect(fetchProducts()).rejects.toThrow('Request timeout');
    });
  });
});
