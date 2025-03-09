
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export const useQueryCacheManager = () => {
  const queryClient = useQueryClient();
  const [lastInvalidation, setLastInvalidation] = useState(0);

  const invalidateQueries = async (clientId?: number | null) => {
    // Prevent multiple invalidations within 500ms
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
      ['unified-tasks'],
      ['client-items']
    ];
    
    // If a client ID is provided, add client-specific query keys
    if (clientId) {
      queryKeys.push(['client', String(clientId)]); 
      queryKeys.push(['client-items', String(clientId)]);
    }
    
    // First invalidate all queries
    try {
      for (const key of queryKeys) {
        console.log(`CACHE: Invalidating key ${key.join('/')}`);
        await queryClient.invalidateQueries({ 
          queryKey: key,
          refetchType: 'none' // Don't force refetch immediately
        });
      }
      
      // Get list of active queries to avoid errors
      const activeQueries = queryClient.getQueryCache().getAll()
        .map(query => JSON.stringify(query.queryKey));
      
      console.log("CACHE: Active queries:", activeQueries);
      
      // Force immediate refetches of only the queries we know exist
      const refetchPromises = [];
      
      // Check each query type and only refetch if it exists
      if (activeQueries.some(key => key.includes('unified-tasks'))) {
        console.log("CACHE: Refetching unified-tasks");
        refetchPromises.push(queryClient.refetchQueries({ queryKey: ['unified-tasks'] }));
      }
      
      if (activeQueries.some(key => key.includes('tasks'))) {
        console.log("CACHE: Refetching tasks");
        refetchPromises.push(queryClient.refetchQueries({ queryKey: ['tasks'] }));
      }
      
      if (activeQueries.some(key => key.includes('generalTasks'))) {
        console.log("CACHE: Refetching generalTasks");
        refetchPromises.push(queryClient.refetchQueries({ queryKey: ['generalTasks'] }));
      }
      
      if (activeQueries.some(key => key.includes('clientNextSteps'))) {
        console.log("CACHE: Refetching clientNextSteps");
        refetchPromises.push(queryClient.refetchQueries({ queryKey: ['clientNextSteps'] }));
      }
      
      if (activeQueries.some(key => key.includes('client-items'))) {
        console.log("CACHE: Refetching client-items");
        refetchPromises.push(queryClient.refetchQueries({ queryKey: ['client-items'] }));
      }
      
      // If client ID is provided, check and refetch client-specific queries
      if (clientId) {
        if (activeQueries.some(key => key.includes(`client,${clientId}`))) {
          console.log(`CACHE: Refetching client ${clientId}`);
          refetchPromises.push(queryClient.refetchQueries({ queryKey: ['client', String(clientId)] }));
        }
        
        if (activeQueries.some(key => key.includes(`client-items,${clientId}`))) {
          console.log(`CACHE: Refetching client-items for ${clientId}`);
          refetchPromises.push(queryClient.refetchQueries({ queryKey: ['client-items', String(clientId)] }));
        }
      }
      
      if (refetchPromises.length > 0) {
        await Promise.all(refetchPromises);
      }
      
      console.log(`CACHE: Query invalidation complete at: ${new Date().toISOString()}`);
      return true;
    } catch (error) {
      console.error('Error during cache invalidation:', error);
      return false;
    }
  };

  return { invalidateQueries };
};
