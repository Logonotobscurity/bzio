'use client';

import { useQuoteStore } from "@/lib/store/quote";
import { ShoppingBag } from "lucide-react";
import { Button } from "../ui/button";

export const QuoteListIcon = () => {
    const { items, toggleDrawer } = useQuoteStore();
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Button
            variant="ghost"
            className="relative"
            onClick={toggleDrawer}
            aria-label="Quote list"
        >
            <ShoppingBag className="h-6 w-6" />
            {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">
                    {itemCount}
                </span>
            )}
        </Button>
    );
};
