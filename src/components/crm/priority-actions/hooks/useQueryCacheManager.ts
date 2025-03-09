
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export const useQueryCacheManager = () => {
  const queryClient = useQueryClient();
  const [lastInvalidation, setLastInvalidation] = useState(0);

  const invalidateQueries = async (clientId?: number | null) => {
    // Prevent multiple invalidations within 500ms instead of 2 seconds
    // to make UI updates more responsive
    const now = Date.now();
    if (now - lastInvalidation < 500) {
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
      // First invalidate all queries with refetchType: 'all'
      await Promise.all(
        queryKeys.map(key => {
          console.log(`CACHE: Invalidating key ${key.join('/')}`);
          return queryClient.invalidateQueries({ 
            queryKey: key,
            refetchType: 'all'
          });
        })
      );
      
      // Force immediate refetches of the most critical queries with zero stale time
      await Promise.all([
        queryClient.fetchQuery({ queryKey: ['unified-tasks'], staleTime: 0 }),
        queryClient.fetchQuery({ queryKey: ['tasks'], staleTime: 0 }),
        queryClient.fetchQuery({ queryKey: ['generalTasks'], staleTime: 0 }),
        queryClient.fetchQuery({ queryKey: ['clientNextSteps'], staleTime: 0 }),
        queryClient.fetchQuery({ queryKey: ['priority-data'], staleTime: 0 }),
        queryClient.fetchQuery({ queryKey: ['client-items'], staleTime: 0 }),
      ]);
      
      console.log(`CACHE: Query invalidation complete at: ${new Date().toISOString()}`);
      return true;
    } catch (error) {
      console.error('Error during cache invalidation:', error);
      return false;
    }
  };

  return { invalidateQueries };
};
