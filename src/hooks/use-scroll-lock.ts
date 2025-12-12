"use client"

import { useEffect } from 'react'

/**
 * useScrollLock Hook
 * Prevents scrolling on the body element when active
 * Useful for mobile menus, modals, and other overlays
 * 
 * @param isLocked - Boolean to control whether scrolling is locked
 * 
 * @example
 * const [menuOpen, setMenuOpen] = useState(false)
 * useScrollLock(menuOpen)
 */
export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return

    // Store the original overflow value
    const originalOverflow = window.getComputedStyle(document.body).overflow

    // Get the width of the scrollbar so we can prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    // Lock scroll
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    // Cleanup: restore original state
    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = '0px'
    }
  }, [isLocked])
}
