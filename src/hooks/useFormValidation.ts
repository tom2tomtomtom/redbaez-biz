
import { useState, useCallback } from 'react';
import { ZodSchema, ZodError, z } from 'zod';
import logger from '@/utils/logger';

interface ValidationOptions<T> {
  schema: ZodSchema;
  onSuccess?: (data: T) => void;
  onError?: (errors: Record<string, string>) => void;
}

interface UseFormValidationResult<T> {
  errors: Record<string, string>;
  isValid: boolean;
  validate: (data: T) => boolean;
  validateField: (field: keyof T, value: any) => boolean;
  clearErrors: () => void;
  clearFieldError: (field: keyof T) => void;
  setCustomError: (field: keyof T, message: string) => void;
}

export function useFormValidation<T extends Record<string, any>>({
  schema,
  onSuccess,
  onError,
}: ValidationOptions<T>): UseFormValidationResult<T> {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatErrors = useCallback((error: ZodError): Record<string, string> => {
    const formattedErrors: Record<string, string> = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (path) {
        formattedErrors[path] = err.message;
      }
    });
    return formattedErrors;
  }, []);

  const validate = useCallback(
    (data: T): boolean => {
      try {
        const validData = schema.parse(data);
        setErrors({});
        onSuccess?.(validData as T);
        return true;
      } catch (error) {
        if (error instanceof ZodError) {
          const newErrors = formatErrors(error);
          setErrors(newErrors);
          onError?.(newErrors);
          logger.warn('Form validation failed', { errors: newErrors });
        } else {
          logger.error('Unexpected validation error', error);
        }
        return false;
      }
    },
    [schema, formatErrors, onSuccess, onError]
  );

  const validateField = useCallback(
    (field: keyof T, value: any): boolean => {
      try {
        // Create a partial schema with just this field
        // Note: We can't access schema.shape directly as it might not exist on all ZodSchema types
        const partialSchema = z.object({ [field as string]: schema }) as ZodSchema;
        
        // Attempt to parse just this field's value
        partialSchema.parse({ [field]: value });
        
        // Clear error for this field if validation passes
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated[field as string];
          return updated;
        });
        return true;
      } catch (error) {
        if (error instanceof ZodError) {
          const fieldErrors = formatErrors(error);
          setErrors((prev) => ({
            ...prev,
            [field as string]: fieldErrors[Object.keys(fieldErrors)[0]] || 'Invalid value'
          }));
        }
        return false;
      }
    },
    [schema, formatErrors]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[field as string];
      return updated;
    });
  }, []);

  const setCustomError = useCallback((field: keyof T, message: string) => {
    setErrors((prev) => ({
      ...prev,
      [field as string]: message,
    }));
  }, []);

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    setCustomError,
  };
}
