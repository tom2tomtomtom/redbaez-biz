
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PriorityItem } from './usePriorityData';

export const useItemStatusChange = () => {
  const queryClient = useQueryClient();

  const invalidateQueries = async (clientId?: number) => {
    console.log('Invalidating queries after task update/delete');
    
    try {
      // First invalidate to mark queries as stale
      await queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
      await queryClient.invalidateQueries({ queryKey: ['clientNextSteps'] });
      
      // Force immediate refetch
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['generalTasks'] }),
        queryClient.refetchQueries({ queryKey: ['clientNextSteps'] })
      ]);
      
      // If there's a client ID, invalidate client-specific queries
      if (clientId) {
        await queryClient.invalidateQueries({ queryKey: ['client', clientId] });
        await queryClient.invalidateQueries({ queryKey: ['client-items', clientId] });
      }
    } catch (err) {
      console.error('Error invalidating queries:', err);
    }
  };

  const handleCompletedChange = async (item: PriorityItem, completed: boolean) => {
    try {
      console.log(`Updating item (${item.type}:${item.data.id}) completed status to: ${completed}`);
      
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

      // Immediately invalidate and refetch queries
      await invalidateQueries(item.data.client_id);

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
        
        // Verify deletion
        if (!error) {
          const { data: checkData } = await supabase
            .from('general_tasks')
            .select('id')
            .eq('id', item.data.id)
            .maybeSingle();
          
          if (checkData) {
            console.error('Task still exists after deletion attempt');
            throw new Error('Failed to delete task');
          } else {
            console.log('Task deletion verified successfully');
          }
        }
      } else if (item.type === 'next_step') {
        console.log('Deleting next step with ID:', item.data.id);
        
        // FIXED: Directly proceed with deletion without delays or verifications
        // that cause race conditions and errors
        const result = await supabase
          .from('client_next_steps')
          .delete()
          .eq('id', item.data.id);
        
        error = result.error;
        
        if (error) {
          console.error('Database error during next step deletion:', error);
          throw error;
        } else {
          console.log('Next step deletion completed successfully');
        }
      }

      if (error) {
        console.error('Database error during deletion:', error);
        throw error;
      }

      // Ensure cache is updated immediately
      queryClient.setQueryData(['generalTasks'], (oldData: any) => {
        if (!oldData) return oldData;
        return Array.isArray(oldData) 
          ? oldData.filter(task => task.id !== item.data.id) 
          : oldData;
      });
      
      queryClient.setQueryData(['clientNextSteps'], (oldData: any) => {
        if (!oldData) return oldData;
        return Array.isArray(oldData) 
          ? oldData.filter(step => step.id !== item.data.id) 
          : oldData;
      });

      // Immediately invalidate and refetch queries after a short delay
      // This ensures the UI has time to remove the item before we refetch
      setTimeout(() => {
        invalidateQueries(item.data.client_id);
      }, 1000);

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

      // Immediately invalidate and refetch queries
      await invalidateQueries(item.data.client_id);

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
