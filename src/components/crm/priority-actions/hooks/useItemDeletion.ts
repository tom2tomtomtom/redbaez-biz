
import { toast } from '@/hooks/use-toast';
import { PriorityItem } from './usePriorityData';
import { useState } from 'react';
import { useTaskDeletion } from '@/hooks/useTaskDeletion';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Simplified hook for deleting priority items
 */
export const useItemDeletion = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  
  // Use the central task deletion hook with a direct callback
  const { deleteTask } = useTaskDeletion(async () => {
    console.log("[ITEM_DELETION] Task deleted successfully - refreshing data");
    
    // Refresh client-specific items if any item is deleted
    queryClient.refetchQueries({ queryKey: queryKeys.tasks.clientItems() });
    
    // Also refresh the unified view
    queryClient.refetchQueries({ queryKey: queryKeys.tasks.unified() });
  });

  const handleDelete = async (item: PriorityItem) => {
    if (isDeleting) {
      return false;
    }
    
    setIsDeleting(true);
    
    try {
      const itemId = item.data.id;
      console.log(`[ITEM_DELETION] Deleting item ${item.type}:${itemId}`);
      
      // Format task for deletion
      const taskToDelete = {
        id: String(itemId)
      };
      
      // Use the simplified task deletion hook
      const success = await deleteTask(taskToDelete);
      
      if (!success) {
        throw new Error(`Failed to delete ${item.type}.`);
      }
      
      // If this was a client task, refresh client data
      if (item.data.client_id) {
        queryClient.refetchQueries({ 
          queryKey: queryKeys.clients.detail(item.data.client_id) 
        });
        
        queryClient.refetchQueries({ 
          queryKey: queryKeys.tasks.clientItems(item.data.client_id) 
        });
      }
      
      return true;
    } catch (error) {
      console.error('[ITEM_DELETION] Error deleting item:', error);
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
