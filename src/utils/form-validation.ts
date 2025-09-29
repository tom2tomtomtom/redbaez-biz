import { z } from 'zod';
import logger from '@/utils/logger';

/**
 * Form validation error class
 */
export class FormValidationError extends Error {
  errors: Record<string, string>;
  
  constructor(message: string, errors: Record<string, string>) {
    super(message);
    this.name = 'FormValidationError';
    this.errors = errors;
  }
}

/**
 * Validates form data against a Zod schema
 * 
 * @param schema - The Zod schema to validate against
 * @param data - The form data to validate
 * @param options - Options for validation
 * @returns The validated data
 * @throws FormValidationError if validation fails
 */
export function validateForm<T>(
  schema: z.ZodType<T>,
  data: any,
  options: {
    context?: string;
    logErrors?: boolean;
  } = {}
): T {
  const { context = 'Form', logErrors = true } = options;
  
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Convert Zod errors to a more user-friendly format
      const errors: Record<string, string> = {};
      
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      
      if (logErrors) {
        logger.warn(`${context} validation failed:`, { errors });
      }
      
      throw new FormValidationError('Form validation failed', errors);
    }
    
    // Re-throw other errors
    throw error;
  }
}

/**
 * Safely validates form data with a fallback value if validation fails
 * 
 * @param schema - The Zod schema to validate against
 * @param data - The form data to validate
 * @param fallbackValue - The fallback value to return if validation fails
 * @param options - Options for validation
 * @returns The validated data or the fallback value
 */
export function safeValidateForm<T>(
  schema: z.ZodType<T>,
  data: any,
  fallbackValue: T,
  options: {
    context?: string;
    logErrors?: boolean;
  } = {}
): { isValid: boolean; data: T; errors?: Record<string, string> } {
  try {
    const validatedData = validateForm(schema, data, options);
    return { isValid: true, data: validatedData };
  } catch (error) {
    if (error instanceof FormValidationError) {
      return { isValid: false, data: fallbackValue, errors: error.errors };
    }
    
    // For other errors, return fallback value without specific errors
    return { isValid: false, data: fallbackValue };
  }
}

/**
 * Creates a validation schema for common form fields
 */
export const commonValidators = {
  // String validators
  nonEmptyString: z.string().min(1, 'This field is required'),
  email: z.string().email('Invalid email format'),
  url: z.string().url('Invalid URL format'),
  phone: z.string().regex(/^\+?[0-9\s\-()]{7,20}$/, 'Invalid phone number format'),
  
  // Number validators
  positiveNumber: z.number().positive('Must be a positive number'),
  nonNegativeNumber: z.number().nonnegative('Must be zero or a positive number'),
  percentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
  
  // Date validators
  pastDate: z.string().refine(
    (date) => !date || new Date(date) < new Date(),
    'Date must be in the past'
  ),
  futureDate: z.string().refine(
    (date) => !date || new Date(date) > new Date(),
    'Date must be in the future'
  ),
  
  // Optional variants
  optionalNonEmptyString: z.string().min(1, 'This field is required').optional().nullable(),
  optionalEmail: z.string().email('Invalid email format').optional().nullable(),
  optionalUrl: z.string().url('Invalid URL format').optional().nullable(),
  optionalPhone: z.string().regex(/^\+?[0-9\s\-()]{7,20}$/, 'Invalid phone number format').optional().nullable(),
  optionalPositiveNumber: z.number().positive('Must be a positive number').optional().nullable(),
  optionalNonNegativeNumber: z.number().nonnegative('Must be zero or a positive number').optional().nullable(),
  optionalPercentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100').optional().nullable(),
};
