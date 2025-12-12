
"use client";

import { useState, useEffect } from 'react';
import { useQuoteStore } from '@/lib/store/quote';
import { Button } from '@/components/ui/button';
import { SuccessNotification } from '@/components/success-notification';
import { Product } from '@/lib/schema';

interface AddToQuoteButtonProps {
  product: Product;
}

export const AddToQuoteButton = ({ product }: AddToQuoteButtonProps) => {
  const { addProduct, items } = useQuoteStore();
  const [isAdded, setIsAdded] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const alreadyInQuote = items.some((item) => item.id === product.id);
    setIsAdded(alreadyInQuote);
  }, [items, product.id]);

  const handleAddToQuote = () => {
    addProduct(product, 1);
    setIsAdded(true);
    setShowNotification(true);
  };

  return (
    <>
      <Button onClick={handleAddToQuote} disabled={isAdded} className="w-full min-h-11 h-auto py-2 text-xs sm:text-sm">
        {isAdded ? 'Added to Quote List' : 'Add to Quote List'}
      </Button>
      <SuccessNotification
        isVisible={showNotification}
        message="Added to Quote"
        subMessage={`${product.name} has been added successfully`}
        duration={4000}
        onClose={() => setShowNotification(false)}
      />
    </>
  );
};
