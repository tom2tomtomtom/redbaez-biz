
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { PriorityItem } from './usePriorityData';
import { useQueryCacheManager } from './useQueryCacheManager';
import { useState } from 'react';

export const useItemDeletion = () => {
  const { invalidateQueries } = useQueryCacheManager();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (item: PriorityItem) => {
    if (isDeleting) {
      console.log('Already processing a deletion, skipping');
      return false;
    }
    
    setIsDeleting(true);
    
    try {
      const itemId = item.data.id;
      const clientId = item.data.client_id;
      const itemType = item.type;
      
      // Determine the table name based on item type
      const tableName = itemType === 'task' ? 'general_tasks' : 'client_next_steps';
      
      console.log(`DELETE: Deleting item ${itemType}:${itemId} from table ${tableName} at ${new Date().toISOString()}`);

      // Add custom headers to prevent caching issues
      const customHeaders = {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Custom-Timestamp': new Date().toISOString()
      };

      // Perform the deletion with a timestamp for debugging
      const { error: deleteError, data } = await supabase
        .from(tableName)
        .delete()
        .eq('id', itemId)
        .select();
        
      if (deleteError) {
        console.error(`DELETE: Error during deletion:`, deleteError);
        throw new Error(`Failed to delete ${itemType}. Database error: ${deleteError.message}`);
      }

      console.log(`DELETE: Successfully deleted item ${itemId} from ${tableName}. Response:`, data);
      
      // Immediately invalidate queries to force a refresh - wait for this to complete
      await invalidateQueries(clientId);
      
      // Wait a moment then invalidate again to ensure UI is updated
      setTimeout(async () => {
        console.log(`DELETE: Running second invalidation for ${itemId}`);
        await invalidateQueries(clientId);
      }, 500);
      
      toast({
        title: `${itemType === 'task' ? 'Task' : 'Next Step'} deleted`,
        description: "The item has been successfully removed."
      });
      
      return true;
    } catch (error) {
      console.error('DELETE: Error deleting item:', error);
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
