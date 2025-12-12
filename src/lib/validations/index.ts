/**
 * Validators utility module
 * Common validation functions for forms and data
 */

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns true if valid email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * @param password - Password string to validate
 * @param minLength - Minimum password length (default: 8)
 * @returns true if password meets requirements
 */
export function validatePassword(password: string, minLength: number = 8): boolean {
  // At least minLength characters, one uppercase, one lowercase, one number, one special char
  const regex = new RegExp(
    `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{${minLength},}$`
  )
  return regex.test(password)
}

/**
 * Validate URL format
 * @param url - URL string to validate
 * @returns true if valid URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate phone number (10 digit US format)
 * @param phoneNumber - Phone number string
 * @returns true if valid phone number
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  const cleaned = phoneNumber.replace(/\D/g, '')
  return cleaned.length === 10
}

/**
 * Validate number is within range
 * @param value - Number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns true if number is within range
 */
export function validateRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * Validate string length
 * @param str - String to validate
 * @param minLength - Minimum length
 * @param maxLength - Maximum length (optional)
 * @returns true if string length is valid
 */
export function validateLength(str: string, minLength: number, maxLength?: number): boolean {
  const len = str.length
  if (len < minLength) return false
  if (maxLength !== undefined && len > maxLength) return false
  return true
}

/**
 * Validate that a string is not empty/whitespace
 * @param str - String to validate
 * @returns true if string is not empty
 */
export function validateRequired(str: string): boolean {
  return str.trim().length > 0
}

/**
 * Validate that a value matches a pattern
 * @param value - Value to validate
 * @param pattern - Regex pattern to match
 * @returns true if value matches pattern
 */
export function validatePattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value)
}

/**
 * Validate credit card number (basic Luhn algorithm)
 * @param cardNumber - Credit card number string (numbers only)
 * @returns true if card number passes Luhn check
 */
export function validateCreditCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '')
  
  if (cleaned.length < 13 || cleaned.length > 19) return false

  let sum = 0
  let isEven = false

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

/**
 * Validate username (alphanumeric and underscores, 3-20 chars)
 * @param username - Username string to validate
 * @returns true if valid username format
 */
export function validateUsername(username: string): boolean {
  const regex = /^[a-zA-Z0-9_]{3,20}$/
  return regex.test(username)
}

/**
 * Validate date string (YYYY-MM-DD format)
 * @param dateStr - Date string to validate
 * @returns true if valid date format and real date
 */
export function validateDate(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateStr)) return false

  const date = new Date(dateStr)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Validate IPv4 address
 * @param ip - IP address string to validate
 * @returns true if valid IPv4 address
 */
export function validateIPv4(ip: string): boolean {
  const regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return regex.test(ip)
}

/**
 * Validate that two values match (useful for password confirmation)
 * @param value - First value
 * @param confirmValue - Second value to match
 * @returns true if values match
 */
export function validateMatch(value: string, confirmValue: string): boolean {
  return value === confirmValue
}

/**
 * Validate hex color
 * @param color - Hex color string
 * @returns true if valid hex color
 */
export function validateHexColor(color: string): boolean {
  const regex = /^#(?:[0-9a-fA-F]{3}){1,2}$/
  return regex.test(color)
}
