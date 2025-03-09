
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { PriorityItem } from './usePriorityData';
import { useQueryCacheManager } from './useQueryCacheManager';

export const useItemDeletion = () => {
  const { invalidateQueries } = useQueryCacheManager();

  // Create a delay function to manage timing of cache updates
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleDelete = async (item: PriorityItem) => {
    try {
      const itemId = item.data.id;
      const clientId = item.data.client_id;
      const itemType = item.type;
      
      // Determine the table name based on item type
      const tableName = itemType === 'task' ? 'general_tasks' : 'client_next_steps';
      
      console.log(`DELETING: Attempting to delete item ${itemType}:${itemId} from table ${tableName}`);

      // Check if the item exists first before trying to delete
      const { data: checkData, error: checkError } = await supabase
        .from(tableName)
        .select('id')
        .eq('id', itemId)
        .single();
      
      if (checkError) {
        console.error(`Item ${itemId} in table ${tableName} not found:`, checkError);
        return false;
      }
      
      console.log(`Item ${itemId} exists in ${tableName}, proceeding with deletion`);

      // Now perform the actual deletion
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', itemId);
        
      if (deleteError) {
        console.error(`Error during deletion of ${itemId} from ${tableName}:`, deleteError);
        throw new Error(`Failed to delete ${itemType}. Database error: ${deleteError.message}`);
      }

      console.log(`Successfully deleted item ${itemId} from ${tableName}`);
      
      // Add a delay before invalidating the cache to ensure the deletion has propagated
      await delay(300);
      
      // IMMEDIATELY clear cache to force a refresh with data that doesn't include the deleted item
      await invalidateQueries(clientId);

      console.log(`Cache invalidated after deleting ${itemType} with ID: ${itemId}`);
      
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
