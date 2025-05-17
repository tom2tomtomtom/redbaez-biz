
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { PriorityItem } from './usePriorityData';
import { useQueryManager } from '@/hooks/useQueryManager';

export const useUrgencyStatus = () => {
  const { invalidateTaskQueries } = useQueryManager();

  const handleUrgentChange = async (item: PriorityItem, checked: boolean) => {
    try {
      // Add timestamp for debugging
      const timestamp = new Date().toISOString();
      const itemId = item.data.id;
      const clientId = item.data.client_id;
      
      console.log(`Updating urgency for ${item.type}:${itemId} to ${checked} at ${timestamp}`);
      
      // Update database
      const { error } = await supabase
        .from('tasks')
        .update({ 
          urgent: checked,
          updated_at: timestamp 
        })
        .eq('id', itemId);

      if (error) {
        console.error(`Error updating urgent status at ${timestamp}:`, error);
        throw error;
      }

      console.log(`Successfully updated urgency at ${timestamp}`);
      
      // Immediately invalidate after database update
      await invalidateTaskQueries();
      
      // Secondary invalidation for certainty
      setTimeout(async () => {
        await invalidateTaskQueries();
      }, 500);

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
