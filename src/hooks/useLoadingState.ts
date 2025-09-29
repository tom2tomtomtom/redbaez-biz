import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  message: string;
}

interface UseLoadingStateReturn extends LoadingState {
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  setError: (error: Error | string) => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * Custom hook for managing loading states with better UX
 * 
 * @param initialMessage - Initial loading message
 * @returns Loading state and methods to control it
 */
export function useLoadingState(initialMessage = 'Loading...'): UseLoadingStateReturn {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    isError: false,
    error: null,
    message: initialMessage,
  });

  const startLoading = useCallback((message?: string) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      message: message || prev.message,
    }));
  }, []);

  const stopLoading = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
    }));
  }, []);

  const setError = useCallback((error: Error | string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    setState(prev => ({
      ...prev,
      isLoading: false,
      isError: true,
      error: errorObj,
      message: errorObj.message,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      isError: false,
      error: null,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isError: false,
      error: null,
      message: initialMessage,
    });
  }, [initialMessage]);

  return {
    ...state,
    startLoading,
    stopLoading,
    setError,
    clearError,
    reset,
  };
}

export default useLoadingState;
