/**
 * Password Validation & Security Utilities
 * 
 * Centralized password validation, strength checking, and security requirements
 * Used throughout the authentication system for consistent password policies
 */

/**
 * Password Requirements Configuration
 * Define what makes a valid and strong password
 */
export const PASSWORD_REQUIREMENTS = {
  // Length requirements
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  RECOMMENDED_LENGTH: 12,

  // Complexity requirements
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,

  // Special characters allowed
  SPECIAL_CHARS: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
  SAFE_SPECIAL_CHARS: ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '-', '='],

  // Patterns for validation
  UPPERCASE_PATTERN: /[A-Z]/,
  LOWERCASE_PATTERN: /[a-z]/,
  NUMBER_PATTERN: /[0-9]/,
  SPECIAL_PATTERN: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,

  // Common weak passwords to reject
  COMMON_WEAK_PASSWORDS: [
    'password',
    '12345678',
    'qwerty',
    'abc123',
    'admin',
    'letmein',
    'welcome',
    'monkey',
    '1q2w3e4r',
    'password123',
  ],
} as const;

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
  score: number; // 0-100
}

/**
 * Validate password format and complexity
 * Returns detailed validation result with specific errors and strength assessment
 * 
 * @param password - The password to validate
 * @returns Validation result with errors, warnings, and strength score
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required'],
      warnings: [],
      strength: 'weak',
      score: 0,
    };
  }

  // Check length
  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    errors.push(
      `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters long`
    );
  } else {
    score += 20;
  }

  if (password.length > PASSWORD_REQUIREMENTS.MAX_LENGTH) {
    errors.push(
      `Password must not exceed ${PASSWORD_REQUIREMENTS.MAX_LENGTH} characters`
    );
  }

  // Check for uppercase
  if (!PASSWORD_REQUIREMENTS.UPPERCASE_PATTERN.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  } else {
    score += 20;
  }

  // Check for lowercase
  if (!PASSWORD_REQUIREMENTS.LOWERCASE_PATTERN.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  } else {
    score += 20;
  }

  // Check for numbers
  if (!PASSWORD_REQUIREMENTS.NUMBER_PATTERN.test(password)) {
    errors.push('Password must contain at least one number (0-9)');
  } else {
    score += 20;
  }

  // Check for special characters
  if (!PASSWORD_REQUIREMENTS.SPECIAL_PATTERN.test(password)) {
    errors.push(
      'Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)'
    );
  } else {
    score += 20;
  }

  // Check for common weak passwords
  const lowerPassword = password.toLowerCase();
  if ((PASSWORD_REQUIREMENTS.COMMON_WEAK_PASSWORDS as readonly string[]).includes(lowerPassword)) {
    errors.push('This password is too common and easily guessed');
  }

  // Check for sequential characters (e.g., "abc", "123")
  if (/(.)\1{2,}/.test(password)) {
    warnings.push('Avoid repeating characters (e.g., "aaa", "111")');
  }

  // Check length quality
  if (password.length >= PASSWORD_REQUIREMENTS.RECOMMENDED_LENGTH) {
    score += 5;
  } else if (password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH + 4) {
    warnings.push(
      `Password should be at least ${PASSWORD_REQUIREMENTS.RECOMMENDED_LENGTH} characters for better security`
    );
  }

  // Determine strength level
  let strength: PasswordValidationResult['strength'];
  if (errors.length > 0) {
    strength = 'weak';
    score = Math.max(0, score - 20);
  } else if (score >= 90) {
    strength = 'strong';
  } else if (score >= 70) {
    strength = 'good';
  } else if (score >= 50) {
    strength = 'fair';
  } else {
    strength = 'weak';
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    strength,
    score: Math.min(100, Math.max(0, score)),
  };
}

/**
 * Check if a password meets minimum requirements
 * Quick check without detailed validation
 * 
 * @param password - The password to check
 * @returns true if password meets all requirements
 */
export function isPasswordValid(password: string): boolean {
  const validation = validatePassword(password);
  return validation.isValid;
}

/**
 * Get a password strength indicator
 * Useful for UI feedback (0-4 stars, etc.)
 * 
 * @param password - The password to check
 * @returns Strength level as a number (0-4)
 */
export function getPasswordStrengthLevel(password: string): number {
  const validation = validatePassword(password);

  const strengthLevels = {
    weak: 1,
    fair: 2,
    good: 3,
    strong: 4,
  };

  return strengthLevels[validation.strength];
}

/**
 * Get human-readable error messages for a password
 * 
 * @param password - The password to validate
 * @returns Array of error messages
 */
export function getPasswordErrors(password: string): string[] {
  return validatePassword(password).errors;
}

/**
 * Get human-readable warning messages for a password
 * 
 * @param password - The password to validate
 * @returns Array of warning messages
 */
export function getPasswordWarnings(password: string): string[] {
  return validatePassword(password).warnings;
}

/**
 * Generate password requirements text for UI display
 * 
 * @returns Formatted string with all password requirements
 */
export function getPasswordRequirementsText(): string {
  return `Password must contain:
- Minimum ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters (${PASSWORD_REQUIREMENTS.RECOMMENDED_LENGTH}+ recommended)
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)`;
}

/**
 * Validate and provide detailed feedback on password strength
 * This is the main function to use for comprehensive password validation
 * 
 * @param password - The password to validate
 * @returns Full validation result with all details
 */
export function assessPasswordStrength(password: string): PasswordValidationResult {
  return validatePassword(password);
}

/**
 * Check if a password is strong enough for production/high-security scenarios
 * 
 * @param password - The password to check
 * @returns true if password is considered "strong" or better
 */
export function isStrongPassword(password: string): boolean {
  const validation = validatePassword(password);
  return validation.strength === 'strong' && validation.score >= 80;
}

/**
 * Sanitize password validation errors for user display
 * Removes technical jargon and provides friendly messages
 * 
 * @param errors - Array of validation errors
 * @returns User-friendly error messages
 */
export function sanitizePasswordErrors(errors: string[]): string[] {
  const sanitizationMap: Record<string, string> = {
    'must be at least': 'needs to be longer -',
    'must contain at least one uppercase': 'needs an uppercase letter (A-Z)',
    'must contain at least one lowercase': 'needs a lowercase letter (a-z)',
    'must contain at least one number': 'needs a number (0-9)',
    'must contain at least one special character': 'needs a special character (!@#$%^&* etc)',
    'too common and easily guessed': 'is too common - choose something more unique',
  };

  return errors.map((error) => {
    for (const [key, replacement] of Object.entries(sanitizationMap)) {
      if (error.toLowerCase().includes(key.toLowerCase())) {
        return error.substring(0, error.toLowerCase().indexOf(key)) + replacement;
      }
    }
    return error;
  });
}
