
/**
 * Hook to initialize and use the QueryCacheManager.
 * This ensures the QueryClient is properly set before using the manager.
 */
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QueryCacheManager } from '@/lib/QueryCacheManager';

export const useQueryManager = () => {
  const queryClient = useQueryClient();
  
  // Initialize the QueryCacheManager with the current QueryClient
  useEffect(() => {
    const manager = QueryCacheManager.getInstance();
    manager.setQueryClient(queryClient);
  }, [queryClient]);
  
  // Return the same interface as useQueryCacheManager for ease of use
  const manager = QueryCacheManager.getInstance();
  
  return {
    invalidateTaskQueries: (clientId?: number | null) => manager.invalidateTaskQueries(clientId),
    invalidateClientQueries: (clientId?: number) => manager.invalidateClientQueries(clientId),
    invalidateRevenueQueries: () => manager.invalidateRevenueQueries(),
    invalidateAllQueries: () => manager.invalidateAllQueries()
  };
};
