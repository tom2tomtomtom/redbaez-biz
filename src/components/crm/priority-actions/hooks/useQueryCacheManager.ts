
import { useQueryClient } from '@tanstack/react-query';

export const useQueryCacheManager = () => {
  const queryClient = useQueryClient();

  const invalidateQueries = async (clientId?: number | null) => {
    console.log('Invalidating queries for client:', clientId);
    
    // Define a single timestamp for all invalidations
    const timestamp = Date.now();
    
    // Create a list of all task-related query keys to invalidate
    const queryKeys = [
      ['tasks'],
      ['generalTasks'],
      ['clientNextSteps']
    ];
    
    // If a client ID is provided, add client-specific query keys
    if (clientId) {
      queryKeys.push(['client', clientId]);
      queryKeys.push(['client-items', clientId]);
    }
    
    // Invalidate all relevant queries at once
    await Promise.all(
      queryKeys.map(key => 
        queryClient.invalidateQueries({ 
          queryKey: key, 
          refetchType: 'all' 
        })
      )
    );
    
    console.log('Query invalidation complete at:', new Date().toISOString());
    return true;
  };

  return { invalidateQueries };
};
