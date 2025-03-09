
import { toast } from '@/hooks/use-toast';
import { PriorityItem } from './usePriorityData';
import { useQueryCacheManager } from './useQueryCacheManager';
import { useState } from 'react';
import { useTaskDeletion } from '@/hooks/useTaskDeletion';

export const useItemDeletion = () => {
  const { invalidateQueries } = useQueryCacheManager();
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteTask } = useTaskDeletion();

  const handleDelete = async (item: PriorityItem) => {
    if (isDeleting) {
      console.log('Already processing a deletion, skipping');
      return false;
    }
    
    setIsDeleting(true);
    
    try {
      const itemId = item.data.id;
      const clientId = item.data.client_id;
      
      console.log(`ITEM_DELETION: Deleting item ${item.type}:${itemId} at ${new Date().toISOString()}`);
      
      // Use the unified task deletion hook
      const success = await deleteTask({
        id: itemId,
        type: item.type
      });
      
      if (!success) {
        throw new Error(`Failed to delete ${item.type}.`);
      }
      
      // Invalidate client queries if this was a client task
      if (clientId) {
        await invalidateQueries(clientId);
      }
      
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
