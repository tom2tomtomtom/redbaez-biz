
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export const useQueryCacheManager = () => {
  const queryClient = useQueryClient();
  const [lastInvalidation, setLastInvalidation] = useState(0);

  const invalidateQueries = async (clientId?: number | null) => {
    // Prevent multiple invalidations within 2 seconds
    const now = Date.now();
    if (now - lastInvalidation < 2000) {
      console.log('Skipping invalidation - too soon after last one');
      return false;
    }
    
    setLastInvalidation(now);
    const timestamp = new Date().toISOString();
    console.log(`CACHE: Invalidating queries at ${timestamp} for client:`, clientId);
    
    // Create a list of all task-related query keys to invalidate
    const queryKeys = [
      ['tasks'],
      ['generalTasks'],
      ['clientNextSteps'],
      ['priority-data'],
      ['unified-tasks'],
      ['client-items']
    ];
    
    // If a client ID is provided, add client-specific query keys
    if (clientId) {
      queryKeys.push(['client', String(clientId)]); 
      queryKeys.push(['client-items', String(clientId)]);
    }
    
    // Invalidate and immediately refetch all relevant queries
    try {
      // First invalidate all queries
      await Promise.all(
        queryKeys.map(key => {
          console.log(`CACHE: Invalidating key ${key.join('/')}`);
          return queryClient.invalidateQueries({ 
            queryKey: key,
            refetchType: 'all'
          });
        })
      );
      
      // Force immediate refetches of the most critical queries
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['unified-tasks'] }),
        queryClient.refetchQueries({ queryKey: ['tasks'] }),
        queryClient.refetchQueries({ queryKey: ['generalTasks'] }),
        queryClient.refetchQueries({ queryKey: ['clientNextSteps'] }),
        queryClient.refetchQueries({ queryKey: ['priority-data'] }),
        queryClient.refetchQueries({ queryKey: ['client-items'] }),
      ]);
      
      console.log(`CACHE: Query invalidation complete at: ${timestamp}`);
      return true;
    } catch (error) {
      console.error('Error during cache invalidation:', error);
      return false;
    }
  };

  return { invalidateQueries };
};
