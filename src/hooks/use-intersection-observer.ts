"use client"

import { useEffect, useRef, useState, RefObject } from 'react'

export interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export interface UseIntersectionObserverReturn {
  ref: RefObject<HTMLDivElement | null>
  isVisible: boolean
  isIntersecting: boolean
  entry?: IntersectionObserverEntry
}

/**
 * useIntersectionObserver Hook
 * Detects when an element comes into view using the Intersection Observer API
 * Useful for lazy loading, infinite scroll, and scroll-triggered animations
 * 
 * @param options - Configuration options for IntersectionObserver
 * @returns Object containing ref to attach to element, isVisible state, and entry data
 * 
 * @example
 * const { ref, isVisible } = useIntersectionObserver({ threshold: 0.5 })
 * return <div ref={ref}>{isVisible && <Image src="..." />}</div>
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const frozenRef = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        setIsIntersecting(true)
        
        if (options.freezeOnceVisible) {
          frozenRef.current = true
        }
      } else if (!options.freezeOnceVisible) {
        setIsIntersecting(false)
      }
      
      setEntry(entry)
    }, {
      threshold: options.threshold ?? 0,
      root: options.root ?? null,
      rootMargin: options.rootMargin ?? '0px',
    })

    const currentElement = ref.current
    if (currentElement) {
      observer.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
      observer.disconnect()
    }
  }, [options.threshold, options.root, options.rootMargin, options.freezeOnceVisible])

  return {
    ref,
    isVisible,
    isIntersecting,
    entry,
  }
}
