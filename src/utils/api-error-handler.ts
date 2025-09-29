import { toast } from '@/components/ui/use-toast';
import logger from '@/utils/logger';

/**
 * API Error class for standardized error handling
 */
export class APIError extends Error {
  status?: number;
  code?: string;
  details?: any;
  
  constructor(message: string, options?: { 
    status?: number;
    code?: string;
    details?: any;
    cause?: Error;
  }) {
    super(message);
    this.name = 'APIError';
    this.status = options?.status;
    this.code = options?.code;
    this.details = options?.details;
    this.cause = options?.cause;
  }
}

/**
 * Handles API errors in a standardized way
 * 
 * @param error - The error to handle
 * @param options - Options for error handling
 * @returns The standardized APIError
 */
export function handleAPIError(
  error: any, 
  options: {
    context?: string;
    showToast?: boolean;
    defaultMessage?: string;
    logError?: boolean;
  } = {}
): APIError {
  const {
    context = 'API',
    showToast = true,
    defaultMessage = 'An unexpected error occurred',
    logError = true
  } = options;
  
  // Extract error details
  const errorMessage = error?.message || error?.error?.message || defaultMessage;
  const errorStatus = error?.status || error?.error?.status;
  const errorCode = error?.code || error?.error?.code;
  const errorDetails = error?.details || error?.error?.details;
  
  // Create standardized error
  const apiError = new APIError(errorMessage, {
    status: errorStatus,
    code: errorCode,
    details: errorDetails,
    cause: error
  });
  
  // Log the error
  if (logError) {
    logger.error(`${context} Error:`, apiError, {
      status: errorStatus,
      code: errorCode,
      details: errorDetails
    });
  }
  
  // Show toast notification
  if (showToast) {
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });
  }
  
  return apiError;
}

/**
 * Safely executes an API call with standardized error handling
 * 
 * @param apiCall - The API call function to execute
 * @param options - Options for error handling
 * @returns The result of the API call
 * @throws APIError if the API call fails
 */
export async function safeAPICall<T>(
  apiCall: () => Promise<T>,
  options: {
    context?: string;
    showToast?: boolean;
    defaultMessage?: string;
    logError?: boolean;
  } = {}
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    throw handleAPIError(error, options);
  }
}

/**
 * Safely executes an API call with a fallback value if it fails
 * 
 * @param apiCall - The API call function to execute
 * @param fallbackValue - The fallback value to return if the API call fails
 * @param options - Options for error handling
 * @returns The result of the API call or the fallback value
 */
export async function safeAPICallWithFallback<T>(
  apiCall: () => Promise<T>,
  fallbackValue: T,
  options: {
    context?: string;
    showToast?: boolean;
    defaultMessage?: string;
    logError?: boolean;
  } = {}
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    handleAPIError(error, options);
    return fallbackValue;
  }
}
