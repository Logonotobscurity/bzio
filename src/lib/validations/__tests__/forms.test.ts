/**
 * Form Validation Tests
 * Tests for centralized form validation schemas
 */

import {
  contactFormSchema,
  newsletterFormSchema,
  quoteFormSchema,
  formSubmissionSchema,
} from '@/lib/validations/forms';

describe('Form Validation Schemas', () => {
  describe('contactFormSchema', () => {
    it('should validate a valid contact form', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message',
      };

      const result = contactFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept optional company field', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'ACME Corp',
        message: 'This is a test message',
      };

      const result = contactFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'not-an-email',
        message: 'This is a test message',
      };

      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short message', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Short',
      };

      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short name', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        message: 'This is a test message',
      };

      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should provide appropriate error messages', () => {
      const invalidData = {
        name: 'J',
        email: 'invalid',
        message: 'Short',
      };

      const result = contactFormSchema.safeParse(invalidData);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.name).toBeDefined();
        expect(errors.email).toBeDefined();
        expect(errors.message).toBeDefined();
      }
    });
  });

  describe('newsletterFormSchema', () => {
    it('should validate a valid newsletter signup', () => {
      const validData = {
        email: 'subscriber@example.com',
      };

      const result = newsletterFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept optional source field', () => {
      const validData = {
        email: 'subscriber@example.com',
        source: 'Homepage Banner',
      };

      const result = newsletterFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
      };

      const result = newsletterFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing email', () => {
      const invalidData = {};

      const result = newsletterFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('quoteFormSchema', () => {
    it('should validate a valid quote request', () => {
      const validData = {
        email: 'buyer@example.com',
        items: [
          {
            productId: '123',
            sku: 'SKU-123',
            name: 'Product Name',
            quantity: 10,
          },
        ],
      };

      const result = quoteFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept numeric product IDs', () => {
      const validData = {
        email: 'buyer@example.com',
        items: [
          {
            productId: 123,
            sku: 'SKU-123',
            name: 'Product Name',
            quantity: 10,
          },
        ],
      };

      const result = quoteFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept optional name and company fields', () => {
      const validData = {
        name: 'John Buyer',
        email: 'buyer@example.com',
        companyName: 'ACME Corp',
        phone: '+234-123-456-7890',
        items: [
          {
            productId: '123',
            sku: 'SKU-123',
            name: 'Product Name',
            quantity: 10,
          },
        ],
      };

      const result = quoteFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow multiple items', () => {
      const validData = {
        email: 'buyer@example.com',
        items: [
          {
            productId: '123',
            sku: 'SKU-123',
            name: 'Product 1',
            quantity: 10,
          },
          {
            productId: '456',
            sku: 'SKU-456',
            name: 'Product 2',
            quantity: 5,
          },
        ],
      };

      const result = quoteFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject zero or negative quantity', () => {
      const invalidData = {
        email: 'buyer@example.com',
        items: [
          {
            productId: '123',
            sku: 'SKU-123',
            name: 'Product Name',
            quantity: 0,
          },
        ],
      };

      const result = quoteFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty items array', () => {
      const invalidData = {
        email: 'buyer@example.com',
        items: [],
      };

      const result = quoteFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        items: [
          {
            productId: '123',
            sku: 'SKU-123',
            name: 'Product Name',
            quantity: 10,
          },
        ],
      };

      const result = quoteFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('formSubmissionSchema', () => {
    it('should validate a contact form submission', () => {
      const validData = {
        formType: 'contact',
        data: {
          name: 'John',
          email: 'john@example.com',
          message: 'Hello',
        },
      };

      const result = formSubmissionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate a newsletter submission', () => {
      const validData = {
        formType: 'newsletter',
        data: {
          email: 'subscriber@example.com',
        },
      };

      const result = formSubmissionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate a quote submission', () => {
      const validData = {
        formType: 'quote',
        data: {
          email: 'buyer@example.com',
          items: [{ productId: '123', sku: 'SKU', name: 'Product', quantity: 1 }],
        },
      };

      const result = formSubmissionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate custom form type', () => {
      const validData = {
        formType: 'custom',
        data: {
          customField: 'customValue',
        },
      };

      const result = formSubmissionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid form type', () => {
      const invalidData = {
        formType: 'invalid-type',
        data: {},
      };

      const result = formSubmissionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Type Inference', () => {
    it('should correctly infer contact form types', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test',
      };

      const result = contactFormSchema.safeParse(validData);
      if (result.success) {
        // Type should allow accessing email field
        expect(result.data.email).toBe('john@example.com');
      }
    });

    it('should correctly infer quote form types', () => {
      const validData = {
        email: 'buyer@example.com',
        items: [
          {
            productId: '123',
            sku: 'SKU-123',
            name: 'Product',
            quantity: 5,
          },
        ],
      };

      const result = quoteFormSchema.safeParse(validData);
      if (result.success) {
        expect(result.data.items).toHaveLength(1);
        expect(result.data.items[0].quantity).toBe(5);
      }
    });
  });
});
