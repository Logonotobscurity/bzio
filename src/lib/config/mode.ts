/**
 * Data Mode Configuration
 * 
 * Manages the operational mode of the application:
 * - dynamic: Uses PostgreSQL database for all data operations
 * - static: Uses in-memory static data for training/demo purposes
 * 
 * This module provides type-safe access to the current mode and
 * ensures mode validation at startup.
 */

/**
 * Valid data modes for the application
 */
export type DataMode = 'dynamic' | 'static';

/**
 * Mode configuration interface
 */
export interface ModeConfig {
  /** Current operational mode */
  mode: DataMode;
  /** True if in dynamic (database) mode */
  isDynamic: boolean;
  /** True if in static (in-memory) mode */
  isStatic: boolean;
}

/**
 * Current mode state (mutable for testing purposes)
 */
let currentMode: DataMode;

/**
 * Initialize mode from environment variable
 */
function initializeMode(): DataMode {
  const envMode = process.env.DATA_MODE || process.env.NEXT_PUBLIC_DATA_MODE || 'dynamic';
  
  // Validate mode value
  if (envMode !== 'dynamic' && envMode !== 'static') {
    throw new Error(
      `Invalid DATA_MODE: "${envMode}". Must be either "dynamic" or "static".`
    );
  }
  
  return envMode as DataMode;
}

// Initialize mode on module load
currentMode = initializeMode();

/**
 * Get the current data mode configuration
 * 
 * @returns ModeConfig object with current mode and convenience flags
 * 
 * @example
 * ```typescript
 * const config = getDataMode();
 * if (config.isDynamic) {
 *   // Use database
 * } else {
 *   // Use static data
 * }
 * ```
 */
export function getDataMode(): ModeConfig {
  return {
    mode: currentMode,
    isDynamic: currentMode === 'dynamic',
    isStatic: currentMode === 'static',
  };
}

/**
 * Set the data mode (primarily for testing)
 * 
 * @param mode - The mode to set ('dynamic' or 'static')
 * @throws Error if mode is invalid
 * 
 * @example
 * ```typescript
 * // In tests
 * setDataMode('static');
 * // ... test static mode behavior
 * setDataMode('dynamic');
 * ```
 */
export function setDataMode(mode: DataMode): void {
  if (mode !== 'dynamic' && mode !== 'static') {
    throw new Error(
      `Invalid mode: "${mode}". Must be either "dynamic" or "static".`
    );
  }
  currentMode = mode;
}

/**
 * Check if currently in dynamic mode
 * 
 * @returns true if in dynamic mode
 */
export function isDynamicMode(): boolean {
  return currentMode === 'dynamic';
}

/**
 * Check if currently in static mode
 * 
 * @returns true if in static mode
 */
export function isStaticMode(): boolean {
  return currentMode === 'static';
}
