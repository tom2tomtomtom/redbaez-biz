
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

      // Timestamp for debugging and to help prevent caching issues
      const timestamp = new Date().toISOString();

      // Add custom headers to prevent caching issues
      const customHeaders = {
        'Cache-Control': 'no-cache',
        'X-Custom-Timestamp': timestamp
      };

      // Perform the deletion with a custom header to bypass caching
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', itemId)
        .select()
        .then(response => {
          console.log(`Delete response:`, response);
          return response;
        });
        
      if (deleteError) {
        console.error(`Error during deletion at ${timestamp}:`, deleteError);
        throw new Error(`Failed to delete ${itemType}. Database error: ${deleteError.message}`);
      }

      console.log(`Successfully deleted item ${itemId} from ${tableName} at ${timestamp}`);
      
      // Immediately invalidate queries to force a refresh - wait for this to complete
      await invalidateQueries(clientId);
      
      // Force a refresh again after a short delay for certainty
      setTimeout(async () => {
        await invalidateQueries(clientId);
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
