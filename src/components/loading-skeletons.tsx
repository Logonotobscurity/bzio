"use client"

import { cn } from "@/lib/utils"

export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden bg-white">
      {/* Image Skeleton */}
      <div className="w-full aspect-square bg-gray-200 animate-pulse" />
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6" />
        </div>
        
        {/* Price */}
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        
        {/* Button */}
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function BrandCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden bg-white">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
      </div>
    </div>
  )
}

export function BrandGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <BrandCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function TextSkeleton({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-3 bg-gray-200 rounded animate-pulse",
            i === lines - 1 && "w-4/5"
          )}
        />
      ))}
    </div>
  )
}

export function HeaderSkeleton() {
  return (
    <div className="w-full h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4">
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
      <div className="flex-1" />
      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
      <TextSkeleton lines={3} />
      <div className="h-10 bg-gray-200 rounded animate-pulse" />
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="flex-1 h-10 bg-gray-200 rounded animate-pulse"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="w-full h-[400px] bg-gray-200 animate-pulse rounded-lg" />
  )
}
