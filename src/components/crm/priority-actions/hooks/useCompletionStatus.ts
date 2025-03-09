
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { PriorityItem } from './usePriorityData';
import { useQueryCacheManager } from './useQueryCacheManager';

export const useCompletionStatus = () => {
  const { invalidateQueries } = useQueryCacheManager();

  const handleCompletedChange = async (item: PriorityItem, completed: boolean) => {
    try {
      console.log(`Updating item (${item.type}:${item.data.id}) completed status to: ${completed}`);
      
      // Store a reference to what type of item we're dealing with
      const isTask = item.type === 'task';
      const itemId = item.data.id;
      const clientId = item.data.client_id;
      
      // Complete database update first before touching cache
      let error = null;
      
      if (isTask) {
        const { error: updateError } = await supabase
          .from('general_tasks')
          .update({ status: completed ? 'completed' : 'incomplete' })
          .eq('id', itemId);
        error = updateError;
      } else {
        const { error: updateError } = await supabase
          .from('client_next_steps')
          .update({ completed_at: completed ? new Date().toISOString() : null })
          .eq('id', itemId);
        error = updateError;
      }
      
      if (error) throw error;
      
      // IMMEDIATELY after DB update, remove the queries to force a fresh fetch
      await invalidateQueries(clientId);

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
