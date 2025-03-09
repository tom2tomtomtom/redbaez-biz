
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { PriorityItem } from './usePriorityData';
import { useQueryCacheManager } from './useQueryCacheManager';

export const useUrgencyStatus = () => {
  const { invalidateQueries } = useQueryCacheManager();

  const handleUrgentChange = async (item: PriorityItem, checked: boolean) => {
    try {
      let error = null;
      const itemId = item.data.id;
      const clientId = item.data.client_id;
      
      // Update database first
      if (item.type === 'task') {
        const { error: updateError } = await supabase
          .from('general_tasks')
          .update({ urgent: checked })
          .eq('id', itemId);
        error = updateError;
      } else if (item.type === 'next_step') {
        const { error: updateError } = await supabase
          .from('client_next_steps')
          .update({ urgent: checked })
          .eq('id', itemId);
        error = updateError;
      }

      if (error) throw error;

      // Immediately invalidate after database update
      await invalidateQueries(clientId);

      return true;
    } catch (error) {
      console.error('Error updating urgent status:', error);
      toast({
        title: "Error",
        description: "Failed to update urgent status",
        variant: "destructive",
      });
      return false;
    }
  };

  return { handleUrgentChange };
};
