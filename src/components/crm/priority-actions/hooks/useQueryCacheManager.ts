
import { useQueryClient } from '@tanstack/react-query';

export const useQueryCacheManager = () => {
  const queryClient = useQueryClient();

  const invalidateQueries = async (clientId?: number | null) => {
    console.log('Invalidating queries for client:', clientId);
    
    // Create a list of all task-related query keys to invalidate
    const queryKeys = [
      ['tasks'],
      ['generalTasks'],
      ['clientNextSteps'],
      ['priority-data']
    ];
    
    // If a client ID is provided, add client-specific query keys
    if (clientId) {
      queryKeys.push(['client', String(clientId)]); // Convert to string
      queryKeys.push(['client-items', String(clientId)]); // Convert to string
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
    
    // Force a complete cache reset for more stubborn cached data
    await queryClient.resetQueries({
      queryKey: ['tasks'],
      exact: false
    });
    
    console.log('Query invalidation complete at:', new Date().toISOString());
    return true;
  };

  return { invalidateQueries };
};
