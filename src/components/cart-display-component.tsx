'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, ShoppingCart, Loader, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  images: Array<{ url: string }>;
}

interface CartItem {
  id: string;
  productId: number;
  quantity: number;
  unitPrice: number | null;
  product: Product;
}

interface Cart {
  cartId: string;
  items: CartItem[];
  itemCount: number;
  total: number;
}

export default function CartDisplayComponent() {
  const { data: session } = useSession();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchCart();
    }
  }, [session]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/cart/items');
      if (response.ok) {
        const data = await response.json();
        setCart(data);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItemId(itemId);
    try {
      const response = await fetch(`/api/user/cart/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        await fetchCart();
        toast.success('Quantity updated');
      } else {
        toast.error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('An error occurred');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/user/cart/items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCart();
        toast.success('Item removed from cart');
      } else {
        toast.error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('An error occurred');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground">
              Start adding products to your quote cart to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <Card className="rounded-xl sm:rounded-2xl">
        <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            Quote Cart <span className="text-sm sm:text-base font-normal text-muted-foreground">({cart.itemCount} items)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full px-4 sm:px-0">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs sm:text-sm">
                    <TableHead className="font-semibold">Product</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">SKU</TableHead>
                    <TableHead className="font-semibold">Price</TableHead>
                    <TableHead className="font-semibold">Qty</TableHead>
                    <TableHead className="font-semibold text-right">Subtotal</TableHead>
                    <TableHead className="font-semibold text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.items.map(item => {
                    const price = item.unitPrice || item.product.price;
                    const subtotal = price * item.quantity;

                    return (
                      <TableRow key={item.id} className="text-xs sm:text-sm">
                        <TableCell className="py-3 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            {item.product.images?.[0]?.url && (
                              <img
                                src={item.product.images[0].url}
                                alt={item.product.name}
                                className="h-8 w-8 sm:h-10 sm:w-10 rounded object-cover flex-shrink-0"
                              />
                            )}
                            <span className="font-medium line-clamp-2">{item.product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm hidden sm:table-cell text-muted-foreground">{item.product.sku}</TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{formatCurrency(price)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={updatingItemId === item.id}
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-xs sm:text-sm"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const newQty = parseInt(e.target.value) || 1;
                                handleQuantityChange(item.id, newQty);
                              }}
                              className="h-7 w-10 sm:h-8 sm:w-12 text-center text-xs sm:text-sm"
                              disabled={updatingItemId === item.id}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={updatingItemId === item.id}
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-xs sm:text-sm"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-right whitespace-nowrap">{formatCurrency(subtotal)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 h-7 sm:h-8 w-7 sm:w-8 p-0"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={updatingItemId === item.id}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 flex flex-col sm:flex-row justify-end">
            <Card className="w-full sm:w-80 rounded-lg sm:rounded-xl">
              <CardContent className="pt-4 sm:pt-6 space-y-2 sm:space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cart.total)}</span>
                </div>
                <div className="border-t pt-2 sm:pt-3">
                  <div className="flex justify-between font-bold text-sm sm:text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(cart.total)}</span>
                  </div>
                </div>
                <Button className="w-full mt-3 sm:mt-4 text-sm sm:text-base">
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
