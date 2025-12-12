"use client"

import Image, { ImageProps } from "next/image"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string
  alt: string
  lazyLoad?: boolean
  responsive?: {
    mobile: string
    tablet: string
    desktop: string
  }
  aspectRatio?: 'square' | 'video' | '3:2' | '16:9' | 'custom'
  customAspectRatio?: string
  containerClassName?: string
}

const aspectRatios = {
  square: 'aspect-square',
  video: 'aspect-video',
  '3:2': 'aspect-[3/2]',
  '16:9': 'aspect-[16/9]',
  custom: '',
}

/**
 * OptimizedImage Component
 * Handles lazy loading, responsive images, proper dimensions, and lazy loading
 * Prevents layout shift with aspect ratio containers
 * 
 * @example
 * <OptimizedImage
 *   src="/products/item.jpg"
 *   alt="Product name"
 *   lazyLoad={true}
 *   width={400}
 *   height={300}
 *   aspectRatio="3:2"
 * />
 */
export function OptimizedImage({
  src,
  alt,
  lazyLoad = true,
  width,
  height,
  aspectRatio = 'custom',
  customAspectRatio,
  containerClassName,
  priority = false,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const { ref: intersectionRef, isVisible } = useIntersectionObserver({
    threshold: 0.01,
    freezeOnceVisible: true,
  })

  // Determine if we should load the image
  const shouldLoad = !lazyLoad || isVisible || priority

  const aspectRatioClass = aspectRatio === 'custom' 
    ? (customAspectRatio ? `aspect-[${customAspectRatio}]` : '')
    : aspectRatios[aspectRatio as keyof typeof aspectRatios]

  return (
    <div
      ref={intersectionRef}
      className={cn(
        'relative overflow-hidden',
        aspectRatioClass && aspectRatioClass,
        containerClassName
      )}
    >
      {shouldLoad && (
        <>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            loading={lazyLoad && !priority ? 'lazy' : 'eager'}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
              className
            )}
            onLoadingComplete={() => setIsLoaded(true)}
            {...props}
          />
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
        </>
      )}
    </div>
  )
}

/**
 * Picture component with responsive images
 * Supports multiple image sources for different screen sizes
 */
export function ResponsiveImage({
  sources,
  alt,
  fallback,
  lazyLoad = true,
  className,
  containerClassName,
}: {
  sources: {
    media: string
    srcSet: string
    sizes: string
  }[]
  alt: string
  fallback: string
  lazyLoad?: boolean
  className?: string
  containerClassName?: string
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const { ref: intersectionRef, isVisible } = useIntersectionObserver({
    threshold: 0.01,
    freezeOnceVisible: true,
  })

  const shouldLoad = !lazyLoad || isVisible

  return (
    <div ref={intersectionRef} className={cn('relative overflow-hidden', containerClassName)}>
      {shouldLoad && (
        <>
          <picture className={className}>
            {sources.map((source, idx) => (
              <source
                key={idx}
                media={source.media}
                srcSet={source.srcSet}
                sizes={source.sizes}
              />
            ))}
            <img
              src={fallback}
              alt={alt}
              loading={lazyLoad ? 'lazy' : 'eager'}
              className={cn(
                'w-full h-full object-cover transition-opacity duration-300',
                isLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setIsLoaded(true)}
            />
          </picture>
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
        </>
      )}
    </div>
  )
}
