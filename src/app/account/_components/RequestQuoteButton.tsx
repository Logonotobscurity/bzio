'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useQuoteStore } from '@/stores/quoteStore';
import { Plus, ShoppingCart, Loader2 } from 'lucide-react';

interface RequestQuoteButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  label?: string;
  emptyCartLabel?: string;
}

export function RequestQuoteButton({
  variant = 'default',
  size = 'default',
  className = '',
  showIcon = true,
  label = 'Request Quote',
  emptyCartLabel = 'Request Your First Quote',
}: RequestQuoteButtonProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const items = useQuoteStore((state) => state.items);
  const hasItems = items.length > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    setIsNavigating(true);
    
    if (hasItems) {
      // User has items in cart - go to checkout
      router.push('/checkout');
    } else {
      // No items - go to products page to browse
      router.push('/products');
    }
  };

  // Show loading state while hydrating to prevent flash
  if (!mounted) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        {showIcon && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Loading...
      </Button>
    );
  }

  const buttonLabel = hasItems ? label : emptyCartLabel;
  const Icon = hasItems ? ShoppingCart : Plus;

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={isNavigating}
    >
      {isNavigating ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : showIcon ? (
        <Icon className="h-4 w-4 mr-2" />
      ) : null}
      {isNavigating ? 'Redirecting...' : buttonLabel}
    </Button>
  );
}

export default RequestQuoteButton;
