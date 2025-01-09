import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { PriorityItem } from './usePriorityData';

export const useItemStatusChange = () => {
  const queryClient = useQueryClient();

  const handleCompletedChange = async (item: PriorityItem, completed: boolean) => {
    try {
      if (item.type === 'task') {
        const { error } = await supabase
          .from('general_tasks')
          .update({ status: completed ? 'completed' : 'incomplete' })
          .eq('id', item.data.id);
        if (error) throw error;
      } else if (item.type === 'client') {
        const { error } = await supabase
          .from('clients')
          .update({ status: completed ? 'completed' : 'incomplete' })
          .eq('id', item.data.id);
        if (error) throw error;
      } else if (item.type === 'next_step') {
        const { error } = await supabase
          .from('client_next_steps')
          .update({ completed_at: completed ? new Date().toISOString() : null })
          .eq('id', item.data.id);
        if (error) throw error;
      }

      // Invalidate all relevant queries to ensure proper reordering
      queryClient.invalidateQueries({ queryKey: ['priorityClients'] });
      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
      queryClient.invalidateQueries({ queryKey: ['priorityNextSteps'] });
      queryClient.invalidateQueries({ queryKey: ['nextSteps'] });

      toast({
        title: completed ? "Item completed" : "Item reopened",
        description: `Successfully ${completed ? 'completed' : 'reopened'} the item`,
      });

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

  const handleUrgentChange = async (item: PriorityItem, checked: boolean) => {
    try {
      let error;

      if (item.type === 'task') {
        const result = await supabase
          .from('general_tasks')
          .update({ urgent: checked })
          .eq('id', item.data.id);
        error = result.error;
      } else if (item.type === 'client') {
        // Update client urgent status
        const clientResult = await supabase
          .from('clients')
          .update({ urgent: checked })
          .eq('id', item.data.id);
        error = clientResult.error;

        if (!error) {
          // Also update all active next steps for this client
          const nextStepsResult = await supabase
            .from('client_next_steps')
            .update({ urgent: checked })
            .eq('client_id', item.data.id)
            .is('completed_at', null);
          error = nextStepsResult.error;
        }
      } else if (item.type === 'next_step') {
        const result = await supabase
          .from('client_next_steps')
          .update({ urgent: checked })
          .eq('id', item.data.id);
        error = result.error;
      }

      if (error) throw error;

      // Invalidate all relevant queries to ensure proper reordering
      queryClient.invalidateQueries({ queryKey: ['priorityClients'] });
      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
      queryClient.invalidateQueries({ queryKey: ['priorityNextSteps'] });
      queryClient.invalidateQueries({ queryKey: ['nextSteps'] });
      queryClient.invalidateQueries({ queryKey: ['client'] });
      queryClient.invalidateQueries({ queryKey: ['client-next-steps'] });

      toast({
        title: checked ? "Marked as urgent" : "Removed urgent flag",
        description: `Successfully ${checked ? 'marked' : 'unmarked'} as urgent`,
      });

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

  return {
    handleCompletedChange,
    handleUrgentChange
  };
};