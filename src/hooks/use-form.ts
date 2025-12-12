import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { validateEmail as validateEmailUtil } from '@/lib/validations';

export interface FormErrors {
  [key: string]: string;
}

export interface FormValues {
  [key: string]: string | number | boolean;
}

export interface ValidationRules {
  [key: string]: {
    required?: boolean | string;
    email?: boolean | string;
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
    validate?: (value: string | number | boolean) => boolean | string;
    custom?: (value: unknown, allValues: FormValues) => boolean | string;
  };
}

interface UseFormOptions<T extends FormValues> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void> | void;
  validate?: (values: T) => FormErrors;
  validationRules?: ValidationRules;
  onError?: (error: Error) => void;
}

/**
 * useForm Hook
 * Provides comprehensive form state management, validation, and error handling
 * Supports built-in validation rules, custom validators, and async submission
 * 
 * @example
 * const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm({
 *   initialValues: { email: '', password: '' },
 *   validationRules: {
 *     email: { required: 'Email is required', email: 'Invalid email' },
 *     password: { required: 'Password is required', minLength: { value: 8, message: 'Min 8 chars' } }
 *   },
 *   onSubmit: async (values) => { ... }
 * })
 */
export function useForm<T extends FormValues>({
  initialValues,
  onSubmit,
  validate,
  validationRules,
  onError = undefined,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  /**
   * Validate a single field with rules
   */
  const validateField = useCallback(
    (fieldName: string, fieldValue: string | number | boolean | null | undefined, allValues: T): string => {
      const rules = validationRules?.[fieldName];
      if (!rules) return '';

      // Required validation
      if (rules.required) {
        const isEmpty = fieldValue === '' || fieldValue === null || fieldValue === undefined;
        if (isEmpty) {
          return typeof rules.required === 'string' ? rules.required : `${fieldName} is required`;
        }
      }

      // Email validation
      if (rules.email && fieldValue && typeof fieldValue === 'string') {
        if (!validateEmailUtil(fieldValue)) {
          return typeof rules.email === 'string' ? rules.email : 'Invalid email format';
        }
      }

      // Min length validation
      if (rules.minLength && fieldValue && typeof fieldValue === 'string') {
        if (fieldValue.length < rules.minLength.value) {
          return rules.minLength.message;
        }
      }

      // Max length validation
      if (rules.maxLength && fieldValue && typeof fieldValue === 'string') {
        if (fieldValue.length > rules.maxLength.value) {
          return rules.maxLength.message;
        }
      }

      // Pattern validation
      if (rules.pattern && fieldValue) {
        if (!rules.pattern.value.test(String(fieldValue))) {
          return rules.pattern.message;
        }
      }

      // Custom validation function
      if (rules.validate) {
        if (typeof fieldValue === 'string' || typeof fieldValue === 'number' || typeof fieldValue === 'boolean') {
            const result = rules.validate(fieldValue);
            if (result !== true) {
              return typeof result === 'string' ? result : `${fieldName} is invalid`;
            }
        }
      }

      // Custom validation with all values
      if (rules.custom) {
        const result = rules.custom(fieldValue, allValues);
        if (result !== true) {
          return typeof result === 'string' ? result : `${fieldName} is invalid`;
        }
      }

      return '';
    },
    [validationRules]
  );

  /**
   * Handle field changes with real-time validation
   */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

      setValues(prev => ({
        ...prev,
        [name]: fieldValue,
      }));

      setIsDirty(true);

      // Real-time validation if field has been touched
      if (touched[name]) {
        const error = validateField(name, fieldValue, {
          ...values,
          [name]: fieldValue,
        } as T);
        setErrors(prev => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [touched, values, validateField]
  );

  /**
   * Handle field blur to mark as touched
   */
  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

      setTouched(prev => ({
        ...prev,
        [name]: true,
      }));

      // Validate on blur
      const error = validateField(name, fieldValue, values);
      setErrors(prev => ({
        ...prev,
        [name]: error,
      }));
    },
    [values, validateField]
  );

  /**
   * Validate entire form
   */
  const validateForm = (vals: T): FormErrors => {
    const newErrors: FormErrors = {};

    // Run rules-based validation if provided
    if (validationRules) {
      Object.keys(validationRules).forEach(fieldName => {
        const error = validateField(fieldName, vals[fieldName], vals);
        if (error) {
          newErrors[fieldName] = error;
        }
      });
    }

    // Run custom validation if provided
    if (validate) {
      const customErrors = validate(vals);
      Object.assign(newErrors, customErrors);
    }

    return newErrors;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Clear previous errors and success state
      setErrors({});
      setSubmitSuccess(false);
      setSubmitError(null);

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(allTouched);

      // Validate form
      const newErrors = validateForm(values);
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Submit form
      setIsSubmitting(true);
      try {
        await onSubmit(values);
        setSubmitSuccess(true);
        setValues(initialValues);
        setTouched({});
        setIsDirty(false);

        // Clear success message after 4 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 4000);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while submitting the form';
        setSubmitError(errorMessage);
        if (onError && error instanceof Error) {
          onError(error);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, initialValues, validate, validateForm, onSubmit, onError]
  );

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitSuccess(false);
    setSubmitError(null);
    setIsSubmitting(false);
    setIsDirty(false);
  }, [initialValues]);

  /**
   * Set field value programmatically
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setFieldValue = useCallback((name: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
    setIsDirty(true);
  }, []);

  /**
   * Set field error programmatically
   */
  const setFieldError = useCallback((name: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    submitSuccess,
    submitError,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    setFieldValue,
    setFieldError,
    resetForm,
  };
}
