"use client"

import { useState, useEffect } from 'react'

/**
 * useMediaQuery Hook
 * Detects if a media query matches and returns a boolean
 * Useful for responsive design and feature detection
 * 
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the media query matches
 * 
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)')
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    // Create media query list
    const mediaQueryList = window.matchMedia(query)

    // Set initial value
    setMatches(mediaQueryList.matches)

    // Create listener for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }

    // Add listener
    mediaQueryList.addEventListener('change', handleChange)

    // Cleanup
    return () => {
      mediaQueryList.removeEventListener('change', handleChange)
    }
  }, [query, isClient])

  return matches
}
