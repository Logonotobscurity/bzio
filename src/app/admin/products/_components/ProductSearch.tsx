'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';

export interface ProductFilters {
  search: string;
  minPrice?: number;
  maxPrice?: number;
  status: 'active' | 'inactive' | 'all';
  stock: 'in-stock' | 'low-stock' | 'out-of-stock' | 'all';
  category?: string;
}

interface ProductSearchProps {
  onFiltersChange: (filters: ProductFilters) => void;
  initialFilters?: Partial<ProductFilters>;
  categories?: { id: number; name: string }[];
}

const DEBOUNCE_MS = 300;

export default function ProductSearch({ 
  onFiltersChange, 
  initialFilters,
  categories = [],
}: ProductSearchProps) {
  const [search, setSearch] = useState(initialFilters?.search || '');
  const [minPrice, setMinPrice] = useState(initialFilters?.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters?.maxPrice?.toString() || '');
  const [status, setStatus] = useState<'active' | 'inactive' | 'all'>(initialFilters?.status || 'all');
  const [stock, setStock] = useState<'in-stock' | 'low-stock' | 'out-of-stock' | 'all'>(initialFilters?.stock || 'all');
  const [category, setCategory] = useState(initialFilters?.category || 'all');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounced search callback
  const emitFilters = useCallback(() => {
    const filters: ProductFilters = {
      search: search.trim(),
      status,
      stock,
      ...(minPrice && { minPrice: parseFloat(minPrice) }),
      ...(maxPrice && { maxPrice: parseFloat(maxPrice) }),
      ...(category && category !== 'all' && { category }),
    };
    onFiltersChange(filters);
  }, [search, minPrice, maxPrice, status, stock, category, onFiltersChange]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      emitFilters();
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search, emitFilters]);

  // Immediate update for select filters
  useEffect(() => {
    emitFilters();
  }, [status, stock, category, minPrice, maxPrice, emitFilters]);

  const handleClearFilters = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setStatus('all');
    setStock('all');
    setCategory('all');
  };

  const hasActiveFilters = search || minPrice || maxPrice || status !== 'all' || stock !== 'all' || category !== 'all';

  return (
    <div className="space-y-4">
      {/* Main search row */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by SKU, name, or description..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-10" 
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={stock} onValueChange={(v) => setStock(v as typeof stock)}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="in-stock">In Stock</SelectItem>
            <SelectItem value="low-stock">Low Stock</SelectItem>
            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>

        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </div>

      {/* Advanced filters */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="minPrice">Min Price (₦)</Label>
              <Input 
                id="minPrice"
                type="number" 
                placeholder="0" 
                value={minPrice} 
                onChange={(e) => setMinPrice(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxPrice">Max Price (₦)</Label>
              <Input 
                id="maxPrice"
                type="number" 
                placeholder="No limit" 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(e.target.value)} 
              />
            </div>

            {categories.length > 0 && (
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-end">
              {hasActiveFilters && (
                <Button variant="ghost" onClick={handleClearFilters} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
