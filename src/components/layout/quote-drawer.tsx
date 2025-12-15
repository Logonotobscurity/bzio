'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuoteStore } from "@/stores/quoteStore";
import { Trash2, Plus, Minus, ShoppingBag, Package } from "lucide-react";
import Link from "next/link";
import { AnimatedDiv } from "@/components/animated-div";

export const QuoteDrawer = () => {
  const { items, isOpen, setOpen, removeProduct, updateQuantity } = useQuoteStore();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleQuantityChange = (productId: string | number, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    } else {
      removeProduct(productId);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg p-0">
        <SheetHeader className="p-4 sm:p-6 border-b">
          <SheetTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
            Request for Quote ({itemCount})
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-grow">
          <div className="p-4 sm:p-6">
            {items.length === 0 ? (
              <div className="text-center py-10">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-sm text-gray-500">Your quote request is empty.</p>
                <Button variant="outline" className="mt-4" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <AnimatedDiv key={item.id} className="flex items-center justify-between py-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-sm sm:text-base">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.brand}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button size="icon" variant="outline" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>
                            <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                          <Input
                            type="number"
                            className="w-14 h-7 sm:h-8 text-center px-0"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10) || 1)}
                            min="1"
                          />
                          <Button size="icon" variant="outline" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>
                            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeProduct(item.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </AnimatedDiv>
                ))}
              </ul>
            )}
          </div>
        </ScrollArea>

        {items.length > 0 && (
          <SheetFooter className="p-4 sm:p-6 border-t bg-gray-50">
            <div className="w-full space-y-3">
              <p className="text-sm text-center text-gray-600">Ready to get our best offer?</p>
              <Link href="/checkout" passHref>
                <Button size="lg" className="w-full" onClick={() => setOpen(false)}>
                  Proceed to Request Quote
                </Button>
              </Link>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};
