/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

/**
 * Sanitize HTML content (strips all HTML tags)
 */
export const sanitizeHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Sanitize object by sanitizing all string values
 */
export const sanitizeObject = <T extends Record<string, unknown>>(obj: T): T => {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    const value = sanitized[key];
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value) as T[Extract<keyof T, string>];
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>) as T[Extract<keyof T, string>];
    }
  }
  
  return sanitized;
};
