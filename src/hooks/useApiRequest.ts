
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import logger from '@/utils/logger';

interface ApiRequestOptions<T, P> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  showToasts?: boolean;
  logErrors?: boolean;
}

interface ApiRequestState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

type ApiRequestFunction<T, P> = (params: P) => Promise<T>;

export function useApiRequest<T = any, P = any>(
  requestFn: ApiRequestFunction<T, P>,
  options: ApiRequestOptions<T, P> = {}
) {
  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage = 'An error occurred',
    showToasts = true,
    logErrors = true,
  } = options;

  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (params: P): Promise<T | null> => {
      setState({ data: null, error: null, isLoading: true });
      
      try {
        const data = await requestFn(params);
        
        setState({ data, error: null, isLoading: false });
        
        if (onSuccess) {
          onSuccess(data);
        }
        
        if (showToasts && successMessage) {
          toast({
            title: 'Success',
            description: successMessage,
          });
        }
        
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        setState({ data: null, error: err, isLoading: false });
        
        if (onError) {
          onError(err);
        }
        
        if (showToasts) {
          toast({
            title: 'Error',
            description: errorMessage || err.message,
            variant: 'destructive',
          });
        }
        
        if (logErrors) {
          logger.error('API request failed', { error: err, params });
        }
        
        return null;
      }
    },
    [requestFn, onSuccess, onError, successMessage, errorMessage, showToasts, logErrors]
  );

  return {
    ...state,
    execute,
    reset: useCallback(() => {
      setState({ data: null, error: null, isLoading: false });
    }, []),
  };
}
