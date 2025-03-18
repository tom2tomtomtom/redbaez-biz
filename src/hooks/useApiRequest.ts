
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import logger from '@/utils/logger';
import { ENV } from '@/config/env';

interface ApiRequestOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  timeout?: number;
}

interface ApiRequestState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

type ApiRequestFunction<T, P> = (params: P) => Promise<T>;

export function useApiRequest<T = any, P = any>(
  requestFn: ApiRequestFunction<T, P>,
  options: ApiRequestOptions<T> = {}
) {
  const {
    onSuccess,
    onError,
    successMessage = 'Operation completed successfully',
    errorMessage = 'An error occurred',
    showSuccessToast = true,
    showErrorToast = true,
    timeout = ENV.API_TIMEOUT,
  } = options;

  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (params: P): Promise<T | null> => {
      setState({ data: null, error: null, isLoading: true });
      
      // Create an abort controller for the timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        logger.info('API request started', { params });
        
        const response = await Promise.race([
          requestFn(params),
          new Promise<never>((_, reject) => {
            controller.signal.addEventListener('abort', () => {
              reject(new Error(`Request timed out after ${timeout}ms`));
            });
          }),
        ]);
        
        clearTimeout(timeoutId);
        
        logger.info('API request succeeded', { response });
        
        setState({
          data: response,
          error: null,
          isLoading: false,
        });
        
        if (showSuccessToast) {
          toast({
            title: 'Success',
            description: successMessage,
          });
        }
        
        onSuccess?.(response);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        
        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        logger.error('API request failed', errorObj);
        
        setState({
          data: null,
          error: errorObj,
          isLoading: false,
        });
        
        if (showErrorToast) {
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
          });
        }
        
        onError?.(errorObj);
        return null;
      }
    },
    [requestFn, onSuccess, onError, successMessage, errorMessage, showSuccessToast, showErrorToast, timeout]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
