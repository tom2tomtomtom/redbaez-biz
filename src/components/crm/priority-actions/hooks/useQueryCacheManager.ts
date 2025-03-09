
import { useQueryClient } from '@tanstack/react-query';

export const useQueryCacheManager = () => {
  const queryClient = useQueryClient();

  // Helper function to create a delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const invalidateQueries = async (clientId?: number) => {
    console.log('Invalidating queries after task update/delete');
    
    try {
      // First, completely remove all data from cache before invalidating
      queryClient.removeQueries({ 
        queryKey: ['generalTasks'],
        exact: false
      });
      
      queryClient.removeQueries({ 
        queryKey: ['clientNextSteps'],
        exact: false
      });
      
      queryClient.removeQueries({
        queryKey: ['priorityData'],
        exact: false
      });
      
      queryClient.removeQueries({
        queryKey: ['tasks'],
        exact: false
      });
      
      // Wait for removal to complete
      await delay(100);
      
      // Only after reset, properly invalidate to trigger refetches
      await queryClient.invalidateQueries({ 
        queryKey: ['generalTasks'],
        refetchType: 'all'
      });
      
      await queryClient.invalidateQueries({ 
        queryKey: ['clientNextSteps'],
        refetchType: 'all'
      });
      
      await queryClient.invalidateQueries({
        queryKey: ['priorityData'],
        refetchType: 'all'
      });
      
      await queryClient.invalidateQueries({
        queryKey: ['tasks'],
        refetchType: 'all'
      });
      
      // If there's a client ID, invalidate client-specific queries
      if (clientId) {
        await queryClient.removeQueries({ 
          queryKey: ['client', clientId],
          exact: false
        });
        
        await queryClient.removeQueries({ 
          queryKey: ['client-items', clientId],
          exact: false
        });
        
        await delay(100);
        
        await queryClient.invalidateQueries({ 
          queryKey: ['client', clientId],
          refetchType: 'all'
        });
        
        await queryClient.invalidateQueries({ 
          queryKey: ['client-items', clientId],
          refetchType: 'all'
        });
      }
      
      console.log('Query cache fully reset and invalidated');
    } catch (err) {
      console.error('Error invalidating queries:', err);
    }
  };

  return { invalidateQueries };
};
