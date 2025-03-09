
import { toast } from '@/hooks/use-toast';
import { PriorityItem } from './usePriorityData';
import { useQueryCacheManager } from './useQueryCacheManager';
import { useState } from 'react';
import { useTaskDeletion } from '@/hooks/useTaskDeletion';
import { useQueryClient } from '@tanstack/react-query';

export const useItemDeletion = () => {
  const { invalidateQueries } = useQueryCacheManager();
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  
  // Use the central task deletion hook with a more aggressive callback
  const { deleteTask } = useTaskDeletion(async () => {
    console.log("ITEM_DELETION: Deletion callback executed");
    
    // Force an immediate refetch of all task-related queries
    await Promise.all([
      queryClient.fetchQuery({ queryKey: ['unified-tasks'], staleTime: 0 }),
      queryClient.fetchQuery({ queryKey: ['priority-data'], staleTime: 0 }),
      queryClient.fetchQuery({ queryKey: ['client-items'], staleTime: 0 }),
    ]);
    
    // Additional invalidation to ensure UI updates across all components
    await invalidateQueries();
  });

  const handleDelete = async (item: PriorityItem) => {
    if (isDeleting) {
      console.log('Already processing a deletion, skipping');
      return false;
    }
    
    setIsDeleting(true);
    
    try {
      const itemId = item.data.id;
      const clientId = item.data.client_id;
      const timestamp = new Date().toISOString();
      
      console.log(`ITEM_DELETION: Deleting item ${item.type}:${itemId} at ${timestamp}`);
      
      // Use the unified task deletion hook
      const success = await deleteTask({
        id: itemId,
        type: item.type
      });
      
      if (!success) {
        throw new Error(`Failed to delete ${item.type}.`);
      }
      
      // Force refresh client data if this was a client task
      if (clientId) {
        console.log(`ITEM_DELETION: Invalidating client data for client ${clientId}`);
        await invalidateQueries(clientId);
        queryClient.fetchQuery({ queryKey: ['client', String(clientId)], staleTime: 0 });
        queryClient.fetchQuery({ queryKey: ['client-items', String(clientId)], staleTime: 0 });
      }
      
      // Always force a refresh of the priority data
      queryClient.fetchQuery({ queryKey: ['priority-data'], staleTime: 0 });
      
      console.log(`ITEM_DELETION: Deletion complete for ${itemId} at ${new Date().toISOString()}`);
      return true;
    } catch (error) {
      console.error('ITEM_DELETION: Error deleting item:', error);
      toast({
        title: "Error",
        description: `Failed to delete item: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { handleDelete, isDeleting };
};
