
import { z } from 'zod';
import { useFormValidation } from '@/hooks/useFormValidation';
import { ClientFormData } from '../types';
import logger from '@/utils/logger';

// Create a Zod schema for client validation
const clientSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  type: z.string().optional(),
  industry: z.string().optional(),
  company_size: z.string().optional(),
  status: z.string().optional(),
  website: z.string().optional(),
  background: z.string().optional(),
  likelihood: z.number().optional().nullable()
});

export const useClientValidation = () => {
  const { validate, errors, isValid } = useFormValidation<ClientFormData>({
    schema: clientSchema,
    onError: (validationErrors) => {
      logger.warn('Client form validation failed', { errors: validationErrors });
    }
  });

  return { 
    validateForm: validate,
    errors,
    isValid
  };
};
