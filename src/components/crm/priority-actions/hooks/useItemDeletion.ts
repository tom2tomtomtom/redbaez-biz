import logger from '@/utils/logger';

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
    logger.info("[ITEM_DELETION] Task deleted successfully - refreshing data");
    
    // Remove cached data to ensure fresh fetches
    queryClient.removeQueries({ queryKey: queryKeys.tasks.unified() });
    queryClient.removeQueries({ queryKey: ['tasks'] });
    queryClient.removeQueries({ queryKey: queryKeys.tasks.clientItems(null) });
    
    // Force immediate refresh of ALL related queries
    await Promise.all([
      queryClient.refetchQueries({ queryKey: queryKeys.tasks.clientItems(null) }),
      queryClient.refetchQueries({ queryKey: queryKeys.tasks.unified() }),
      queryClient.refetchQueries({ queryKey: ['tasks'] })
    ]);
  });

  const handleDelete = async (item: PriorityItem) => {
    if (isDeleting) {
      return false;
    }
    
    setIsDeleting(true);
    
    try {
      const itemId = item.data.id;
      logger.info(`[ITEM_DELETION] Deleting item ${item.type}:${itemId}`);
      
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
        await Promise.all([
          queryClient.refetchQueries({ 
            queryKey: queryKeys.clients.detail(item.data.client_id) 
          }),
          
          queryClient.refetchQueries({ 
            queryKey: queryKeys.tasks.clientItems(item.data.client_id) 
          })
        ]);
      }
      
      return true;
    } catch (error) {
      logger.error('[ITEM_DELETION] Error deleting item:', error);
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
