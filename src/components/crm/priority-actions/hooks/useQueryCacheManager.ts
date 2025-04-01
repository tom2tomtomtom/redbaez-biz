
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import logger from '@/utils/logger';

/**
 * Centralized hook for managing query cache invalidation
 * to ensure consistent refreshing across components
 */
export const useQueryCacheManager = () => {
  const queryClient = useQueryClient();

  /**
   * Invalidate and refetch all task-related queries
   */
  const invalidateQueries = async () => {
    logger.info('Invalidating and refetching task queries');
    
    // Cancel any ongoing queries to prevent race conditions
    queryClient.cancelQueries();
    
    // Remove cached data to force fresh fetches
    queryClient.removeQueries({ queryKey: queryKeys.tasks.unified() });
    queryClient.removeQueries({ queryKey: ['unified-tasks'] });
    queryClient.removeQueries({ queryKey: ['tasks'] });
    
    // Invalidate all task-related queries
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.list() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.clientItems(null) }),
      queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    ]);
    
    // Force immediate refetching of key queries
    await Promise.all([
      queryClient.refetchQueries({ queryKey: queryKeys.tasks.list() }),
      queryClient.refetchQueries({ queryKey: queryKeys.tasks.clientItems(null) }),
      queryClient.refetchQueries({ queryKey: ['tasks'] }),
    ]);
  };

  return {
    invalidateQueries
  };
};
