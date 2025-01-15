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
      } else if (item.type === 'next_step') {
        const { error } = await supabase
          .from('client_next_steps')
          .update({ completed_at: completed ? new Date().toISOString() : null })
          .eq('id', item.data.id);
        if (error) throw error;
      }

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

  const handleDelete = async (item: PriorityItem) => {
    try {
      let error;

      if (item.type === 'task') {
        console.log('Deleting task with ID:', item.data.id);
        const result = await supabase
          .from('general_tasks')
          .delete()
          .eq('id', item.data.id);
        error = result.error;
      } else if (item.type === 'next_step') {
        console.log('Deleting next step with ID:', item.data.id);
        const result = await supabase
          .from('client_next_steps')
          .delete()
          .eq('id', item.data.id);
        error = result.error;
      }

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
      queryClient.invalidateQueries({ queryKey: ['priorityNextSteps'] });
      queryClient.invalidateQueries({ queryKey: ['nextSteps'] });
      queryClient.invalidateQueries({ queryKey: ['client'] });

      toast({
        title: "Item deleted",
        description: "Successfully deleted the item",
      });

      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete the item",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleUrgentChange = async (item: PriorityItem, checked: boolean) => {
    try {
      let error;

      if (item.type === 'task') {
        const { error: updateError } = await supabase
          .from('general_tasks')
          .update({ urgent: checked })
          .eq('id', item.data.id);
        error = updateError;
      } else if (item.type === 'next_step') {
        const { error: updateError } = await supabase
          .from('client_next_steps')
          .update({ urgent: checked })
          .eq('id', item.data.id);
        error = updateError;
      }

      if (error) throw error;

      // Invalidate all relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
      queryClient.invalidateQueries({ queryKey: ['clientNextSteps'] });
      queryClient.invalidateQueries({ queryKey: ['priorityNextSteps'] });
      queryClient.invalidateQueries({ queryKey: ['client'] });

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
    handleUrgentChange,
    handleDelete
  };
};