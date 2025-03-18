
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
      
      // Update the database with the new status
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: completed ? 'completed' : 'incomplete',
          updated_at: timestamp
        })
        .eq('id', itemId);
      
      if (error) {
        console.error(`Error updating completion status at ${timestamp}:`, error);
        throw error;
      }
      
      console.log(`Successfully updated completion status at ${timestamp}`);
      
      // More aggressive cache invalidation to ensure UI updates
      // Immediately invalidate queries
      await invalidateQueries(clientId);
      
      // Secondary invalidation after a short delay for certainty
      setTimeout(async () => {
        console.log(`Performing secondary cache invalidation for ${itemId}`);
        await invalidateQueries(clientId);
      }, 500);
      
      // Third invalidation after a longer delay as a failsafe
      setTimeout(async () => {
        console.log(`Performing tertiary cache invalidation for ${itemId}`);
        await invalidateQueries(clientId);
      }, 1500);

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
