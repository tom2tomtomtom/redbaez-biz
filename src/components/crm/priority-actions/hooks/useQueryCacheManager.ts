
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Enhanced query cache manager with improved invalidation strategy
 */
export const useQueryCacheManager = () => {
  const queryClient = useQueryClient();
  const [lastInvalidation, setLastInvalidation] = useState(0);
  const [isInvalidating, setIsInvalidating] = useState(false);

  const invalidateQueries = async (clientId?: number | null) => {
    // Don't run multiple invalidations simultaneously
    if (isInvalidating) {
      console.log('[CACHE] Already invalidating, skipping additional request');
      return false;
    }
    
    // Simple debounce to prevent rapid invalidations
    const now = Date.now();
    if (now - lastInvalidation < 150) { // Further reduced from 250ms to 150ms for faster updates
      console.log('[CACHE] Skipping invalidation - too soon after last one');
      return false;
    }
    
    try {
      setIsInvalidating(true);
      setLastInvalidation(now);
      console.log(`[CACHE] Invalidating queries at ${new Date().toISOString()}`);
      
      // Immediately cancel any ongoing queries to prevent race conditions
      queryClient.cancelQueries({ queryKey: queryKeys.tasks.all() });
      
      // Invalidate the core tasks more aggressively
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all() }),
        queryClient.invalidateQueries({ queryKey: ['generalTasks'] }),
        queryClient.invalidateQueries({ queryKey: ['tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['unified-tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['priorityClients'] }),
        queryClient.invalidateQueries({ queryKey: ['clientNextSteps'] }),
      ]);
      
      // Remove data from cache to force a clean refetch
      queryClient.removeQueries({ queryKey: queryKeys.tasks.unified() });
      
      // Refresh the unified tasks view which is most commonly used
      await queryClient.refetchQueries({ 
        queryKey: queryKeys.tasks.unified(),
        exact: false
      });
      
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
      
      // Force UI refresh by refetching the main data sources
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['priorityClients'] }),
        queryClient.refetchQueries({ queryKey: ['clientNextSteps'] })
      ]);
      
      console.log(`[CACHE] Query invalidation complete`);
      return true;
    } catch (error) {
      console.error('[CACHE] Error during invalidation:', error);
      return false;
    } finally {
      setIsInvalidating(false);
    }
  };

  return { invalidateQueries };
};
