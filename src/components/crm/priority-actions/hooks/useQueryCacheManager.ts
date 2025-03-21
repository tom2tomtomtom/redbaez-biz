
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Enhanced query cache manager with improved invalidation strategy
 */
export const useQueryCacheManager = () => {
  const queryClient = useQueryClient();

  const invalidateQueries = async (clientId?: number | null) => {
    try {
      console.log(`[CACHE] Invalidating queries at ${new Date().toISOString()}`);
      
      // Cancel any ongoing queries to prevent race conditions
      queryClient.cancelQueries();
      
      // Remove data from cache to force a clean refetch
      queryClient.removeQueries({ queryKey: queryKeys.tasks.unified() });
      queryClient.removeQueries({ queryKey: ['unified-tasks'] });
      queryClient.removeQueries({ queryKey: ['tasks'] });
      
      // Invalidate all task-related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all() }),
        queryClient.invalidateQueries({ queryKey: ['tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['generalTasks'] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.general() }),
        queryClient.invalidateQueries({ queryKey: ['priorityClients'] }),
        queryClient.invalidateQueries({ queryKey: ['clientNextSteps'] }),
      ]);
      
      // Force refetch critical data
      await Promise.all([
        queryClient.refetchQueries({ queryKey: queryKeys.tasks.unified() }),
        queryClient.refetchQueries({ queryKey: ['unified-tasks'] }),
        queryClient.refetchQueries({ queryKey: ['tasks'] }),
      ]);
      
      // If client ID provided, refresh client-specific data
      if (clientId) {
        console.log(`[CACHE] Refreshing client ${clientId} data`);
        
        await Promise.all([
          queryClient.refetchQueries({ 
            queryKey: queryKeys.clients.detail(clientId) 
          }),
          
          queryClient.refetchQueries({ 
            queryKey: queryKeys.tasks.clientItems(clientId) 
          })
        ]);
      }
      
      console.log(`[CACHE] Query invalidation complete`);
      return true;
    } catch (error) {
      console.error('[CACHE] Error during invalidation:', error);
      return false;
    }
  };

  return { invalidateQueries };
};
