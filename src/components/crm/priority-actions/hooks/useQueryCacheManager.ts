
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
      queryKeys.push(['client', String(clientId)]); 
      queryKeys.push(['client-items', String(clientId)]);
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
