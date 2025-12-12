"use client"

import { useState, useEffect, useCallback } from 'react'

export interface ScrollPosition {
  x: number
  y: number
}

/**
 * useScrollPosition Hook
 * Tracks the current scroll position of the window or a specific element
 * Useful for implementing scroll-based effects and tracking scroll behavior
 * 
 * @param element - Optional DOM element to track (defaults to window)
 * @param options - Configuration options
 * @returns Current scroll position {x, y}
 * 
 * @example
 * const { x, y } = useScrollPosition()
 * const { x, y } = useScrollPosition(elementRef.current, { throttle: 100 })
 */
export function useScrollPosition(
  element?: HTMLElement | null,
  options?: {
    throttle?: number
  }
): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({ x: 0, y: 0 })
  const throttle = options?.throttle ?? 0

  const handleScroll = useCallback(() => {
    if (element) {
      setPosition({
        x: element.scrollLeft,
        y: element.scrollTop,
      })
    } else {
      setPosition({
        x: window.scrollX,
        y: window.scrollY,
      })
    }
  }, [element])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    const throttledScroll = () => {
      if (throttle > 0) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(handleScroll, throttle)
      } else {
        handleScroll()
      }
    }

    const target = element || window
    target.addEventListener('scroll', throttledScroll)

    // Set initial position
    handleScroll()

    return () => {
      target.removeEventListener('scroll', throttledScroll)
      if (throttle > 0) {
        clearTimeout(timeoutId)
      }
    }
  }, [element, handleScroll, throttle])

  return position
}
