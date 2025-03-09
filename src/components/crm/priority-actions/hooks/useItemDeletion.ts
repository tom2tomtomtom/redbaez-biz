
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { PriorityItem } from './usePriorityData';
import { useQueryCacheManager } from './useQueryCacheManager';

export const useItemDeletion = () => {
  const { invalidateQueries } = useQueryCacheManager();

  const handleDelete = async (item: PriorityItem) => {
    try {
      const itemId = item.data.id;
      const clientId = item.data.client_id;
      const itemType = item.type;
      
      // Determine the table name based on item type
      const tableName = itemType === 'task' ? 'general_tasks' : 'client_next_steps';
      
      console.log(`Deleting item ${itemType}:${itemId} from table ${tableName}`);

      // Perform the deletion
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', itemId);
        
      if (deleteError) {
        console.error(`Error during deletion of ${itemId} from ${tableName}:`, deleteError);
        throw new Error(`Failed to delete ${itemType}. Database error: ${deleteError.message}`);
      }

      console.log(`Successfully deleted item ${itemId} from ${tableName}`);
      
      // Immediately invalidate queries to force a refresh - this is CRITICAL
      await invalidateQueries(clientId);

      console.log(`Cache invalidated after deleting ${itemType} with ID: ${itemId}`);
      
      // Force extra refresh by waiting and invalidating again for certainty
      setTimeout(async () => {
        await invalidateQueries(clientId);
        console.log('Secondary cache invalidation completed');
      }, 500);
      
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: `Failed to delete item: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }
  };

  return { handleDelete };
};
