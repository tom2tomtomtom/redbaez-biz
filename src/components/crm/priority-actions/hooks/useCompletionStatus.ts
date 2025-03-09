
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { PriorityItem } from './usePriorityData';
import { useQueryCacheManager } from './useQueryCacheManager';

export const useCompletionStatus = () => {
  const { invalidateQueries } = useQueryCacheManager();

  const handleCompletedChange = async (item: PriorityItem, completed: boolean) => {
    try {
      console.log(`Updating item (${item.type}:${item.data.id}) completed status to: ${completed}`);
      
      // Add timestamp for debugging
      const timestamp = new Date().toISOString();
      const itemId = item.data.id;
      const clientId = item.data.client_id;
      
      // Update the database based on item type
      let error = null;
      
      if (item.type === 'task') {
        const { error: updateError } = await supabase
          .from('general_tasks')
          .update({ 
            status: completed ? 'completed' : 'incomplete',
            updated_at: timestamp
          })
          .eq('id', itemId);
        error = updateError;
      } else {
        const { error: updateError } = await supabase
          .from('client_next_steps')
          .update({ 
            completed_at: completed ? timestamp : null,
            updated_at: timestamp
          })
          .eq('id', itemId);
        error = updateError;
      }
      
      if (error) {
        console.error(`Error updating completion status at ${timestamp}:`, error);
        throw error;
      }
      
      console.log(`Successfully updated completion status at ${timestamp}`);
      
      // Immediately invalidate queries
      await invalidateQueries(clientId);
      
      // Secondary invalidation for certainty
      setTimeout(async () => {
        await invalidateQueries(clientId);
      }, 500);

      return true;
    } catch (error) {
      console.error('Error updating completion status:', error);
      toast({
        title: "Error",
        description: "Failed to update completion status",
        variant: "destructive",
      });
      return false;
    }
  };

  return { handleCompletedChange };
};
