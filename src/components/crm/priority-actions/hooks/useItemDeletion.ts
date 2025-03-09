
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
  
  // Use the central task deletion hook with a callback
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
      console.log(`ITEM_DELETION: Preparing to delete item ${item.type}:${itemId}`);
      
      // Format the task with the proper structure for the core deletion function
      const taskToDelete = {
        id: String(itemId),
        type: item.type,
        source_table: item.type === 'next_step' ? 'client_next_steps' : 'general_tasks',
        original_data: item.data // Include the full original data
      };
      
      console.log('ITEM_DELETION: Sending to deleteTask:', taskToDelete);
      
      // Use the unified task deletion hook
      const success = await deleteTask(taskToDelete);
      
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
      
      console.log(`ITEM_DELETION: Deletion complete for ${itemId}`);
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
