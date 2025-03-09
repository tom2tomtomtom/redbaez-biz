
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { queryKeys } from '@/lib/queryKeys';

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
    
    // Get the active queries first
    const activeQueries = queryClient.getQueryCache().getAll()
      .map(query => JSON.stringify(query.queryKey));
    
    console.log("CACHE: Active queries:", activeQueries);
    
    // Prepare a list of query keys to invalidate based on what's actually in the cache
    const keysToInvalidate = [];
    
    // Check each query type and only add if it exists in the cache
    if (activeQueries.some(key => key.includes('tasks'))) {
      keysToInvalidate.push(queryKeys.tasks.all());
    }
    
    if (activeQueries.some(key => key.includes('generalTasks'))) {
      keysToInvalidate.push(queryKeys.tasks.general());
    }
    
    if (activeQueries.some(key => key.includes('clientNextSteps'))) {
      keysToInvalidate.push(queryKeys.tasks.clientNextSteps());
    }
    
    if (activeQueries.some(key => key.includes('unified-tasks'))) {
      keysToInvalidate.push(queryKeys.tasks.unified());
    }
    
    if (activeQueries.some(key => key.includes('client-items'))) {
      keysToInvalidate.push(queryKeys.tasks.clientItems());
    }
    
    // If a client ID is provided, add client-specific query keys
    if (clientId) {
      if (activeQueries.some(key => key.includes(`client,${clientId}`))) {
        keysToInvalidate.push(queryKeys.clients.detail(clientId));
      }
      
      if (activeQueries.some(key => key.includes(`client-items,${clientId}`))) {
        keysToInvalidate.push(queryKeys.tasks.clientItems(clientId));
      }
    }
    
    // Invalidate the identified queries
    for (const key of keysToInvalidate) {
      console.log(`CACHE: Invalidating key ${key.join('/')}`);
      await queryClient.invalidateQueries({ 
        queryKey: key,
        refetchType: 'none' // Don't force refetch immediately
      });
    }
    
    // Now prepare a list of queries to refetch
    const refetchPromises = [];
    
    // Only refetch unified-tasks as it's the most commonly used
    if (activeQueries.some(key => key.includes('unified-tasks'))) {
      console.log("CACHE: Refetching unified-tasks");
      refetchPromises.push(queryClient.refetchQueries({ queryKey: queryKeys.tasks.unified() }));
    }
    
    // If client ID is provided, refetch client-specific queries
    if (clientId) {
      if (activeQueries.some(key => key.includes(`client,${clientId}`))) {
        console.log(`CACHE: Refetching client ${clientId}`);
        refetchPromises.push(queryClient.refetchQueries({ queryKey: queryKeys.clients.detail(clientId) }));
      }
      
      if (activeQueries.some(key => key.includes(`client-items,${clientId}`))) {
        console.log(`CACHE: Refetching client-items for ${clientId}`);
        refetchPromises.push(queryClient.refetchQueries({ queryKey: queryKeys.tasks.clientItems(clientId) }));
      }
    }
    
    // Execute all refetch operations
    if (refetchPromises.length > 0) {
      try {
        await Promise.all(refetchPromises);
      } catch (error) {
        console.error('Error during refetch operations:', error);
      }
    }
    
    console.log(`CACHE: Query invalidation complete at: ${new Date().toISOString()}`);
    return true;
  };

  return { invalidateQueries };
};
