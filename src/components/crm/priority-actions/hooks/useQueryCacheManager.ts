
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Simplified query cache manager with direct refetching
 */
export const useQueryCacheManager = () => {
  const queryClient = useQueryClient();
  const [lastInvalidation, setLastInvalidation] = useState(0);

  const invalidateQueries = async (clientId?: number | null) => {
    // Simple debounce to prevent rapid invalidations
    const now = Date.now();
    if (now - lastInvalidation < 500) {
      console.log('[CACHE] Skipping invalidation - too soon after last one');
      return false;
    }
    
    setLastInvalidation(now);
    console.log(`[CACHE] Invalidating queries at ${new Date().toISOString()}`);
    
    // Invalidate the core tasks - simpler approach
    await queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all() });
    
    // Refresh the unified tasks view which is most commonly used
    queryClient.refetchQueries({ queryKey: queryKeys.tasks.unified() });
    
    // If client ID provided, refresh client-specific data
    if (clientId) {
      console.log(`[CACHE] Refreshing client ${clientId} data`);
      
      queryClient.refetchQueries({ 
        queryKey: queryKeys.clients.detail(clientId) 
      });
      
      queryClient.refetchQueries({ 
        queryKey: queryKeys.tasks.clientItems(clientId) 
      });
    }
    
    console.log(`[CACHE] Query invalidation complete`);
    return true;
  };

  return { invalidateQueries };
};
