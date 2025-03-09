
import { useQueryClient } from '@tanstack/react-query';

export const useQueryCacheManager = () => {
  const queryClient = useQueryClient();

  const invalidateQueries = async (clientId?: number | null) => {
    console.log('Invalidating queries for client:', clientId);
    
    // Invalidate with timestamp to force fresh data
    const timestamp = Date.now();
    
    // Always invalidate general task queries
    await Promise.all([
      queryClient.invalidateQueries({ 
        queryKey: ['tasks'], 
        refetchType: 'all' 
      }),
      queryClient.invalidateQueries({ 
        queryKey: ['generalTasks'], 
        refetchType: 'all' 
      }),
      queryClient.invalidateQueries({ 
        queryKey: ['clientNextSteps'], 
        refetchType: 'all' 
      })
    ]);
    
    // If we have a client ID, also invalidate client-specific queries
    if (clientId) {
      await Promise.all([
        queryClient.invalidateQueries({ 
          queryKey: ['client', clientId], 
          refetchType: 'all'
        }),
        queryClient.invalidateQueries({ 
          queryKey: ['client-items', clientId], 
          refetchType: 'all'
        })
      ]);
    }
    
    console.log('Query invalidation complete at:', new Date().toISOString());
    return true;
  };

  return { invalidateQueries };
};
