'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ProductSortOptions() {
  return (
    <div className="flex items-center">
        <label htmlFor="sort" className="text-sm font-medium text-slate-600 mr-2 whitespace-nowrap">Sort by:</label>
        <Select defaultValue="popularity">
            <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="rating">Average rating</SelectItem>
                <SelectItem value="newness">Newness</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
            </SelectContent>
        </Select>
    </div>
  )
}
