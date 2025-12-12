import data from '@/lib/data/placeholders.json';
import productImages from '@/lib/db/products.json';

export type ImagePlaceholder = {
  id: string;
  imageUrl: string;
  description?: string;
  imageHint?: string;
};

const placeholders: ImagePlaceholder[] = data.placeholderImages;

export const getPlaceholderImage = (productId: string): string => {
  // Check for product-specific image first.
  const productImage = productImages.find(p => p.id === productId);
  if (productImage && productImage.images && productImage.images.length > 0) {
    return productImage.images[0];
  }

  // Then, check for a placeholder with the matching ID.
  const placeholder = placeholders.find(p => p.id === productId);
  if (placeholder) {
    return placeholder.imageUrl;
  }

  // Fallback to a default/hashed placeholder if no specific image or placeholder is found.
  const hash = productId.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const index = Math.abs(hash % placeholders.length);
  return placeholders[index]?.imageUrl || '/images/placeholder.jpg';
};

export const getAllPlaceholders = (): ImagePlaceholder[] => {
  return placeholders;
};

export const findImage = (id: string): ImagePlaceholder => {
  const placeholder = placeholders.find(p => p.id === id);
  if (placeholder) {
    return placeholder;
  }
  
  // Fallback
  const hash = id.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const index = Math.abs(hash % placeholders.length);
  return placeholders[index] || { id, imageUrl: '/images/placeholder.jpg', description: 'Placeholder image', imageHint: 'placeholder' };
};
