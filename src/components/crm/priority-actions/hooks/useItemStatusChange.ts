
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PriorityItem } from './usePriorityData';

export const useItemStatusChange = () => {
  const queryClient = useQueryClient();

  // Create a delay function to manage timing of cache updates
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const invalidateQueries = async (clientId?: number) => {
    console.log('Invalidating queries after task update/delete');
    
    try {
      // Force refetch instead of just invalidating
      await queryClient.invalidateQueries({ 
        queryKey: ['generalTasks'],
        refetchType: 'all'
      });
      
      await queryClient.invalidateQueries({ 
        queryKey: ['clientNextSteps'],
        refetchType: 'all'
      });
      
      // If there's a client ID, invalidate client-specific queries
      if (clientId) {
        await queryClient.invalidateQueries({ 
          queryKey: ['client', clientId],
          refetchType: 'all'
        });
        
        await queryClient.invalidateQueries({ 
          queryKey: ['client-items', clientId],
          refetchType: 'all'
        });
      }
      
      console.log('Query cache invalidated successfully');
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

      // Update cache immediately for better user experience
      if (item.type === 'task') {
        queryClient.setQueryData(['generalTasks'], (oldData: any) => {
          if (!oldData) return oldData;
          return Array.isArray(oldData) 
            ? oldData.map(task => 
                task.id === item.data.id 
                  ? {...task, status: completed ? 'completed' : 'incomplete'} 
                  : task
              )
            : oldData;
        });
      } else {
        queryClient.setQueryData(['clientNextSteps'], (oldData: any) => {
          if (!oldData) return oldData;
          return Array.isArray(oldData) 
            ? oldData.map(step => 
                step.id === item.data.id 
                  ? {...step, completed_at: completed ? new Date().toISOString() : null} 
                  : step
              )
            : oldData;
        });
      }

      // Invalidate queries after a delay to allow UI to update first
      await delay(500);
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
      console.log(`Attempting to delete ${item.type} with ID: ${item.data.id}`);

      // First, immediately remove from all caches to prevent UI from showing deleted items
      if (item.type === 'task') {
        // Immediately remove from cache
        queryClient.setQueryData(['generalTasks'], (oldData: any) => {
          if (!oldData) return [];
          console.log('Removing task from cache, before:', oldData?.length);
          const filtered = Array.isArray(oldData) 
            ? oldData.filter(task => task.id !== item.data.id) 
            : oldData;
          console.log('After filter:', filtered?.length);
          return filtered;
        });

        // Delete from database
        const result = await supabase
          .from('general_tasks')
          .delete()
          .eq('id', item.data.id);
        error = result.error;
        
        console.log('Task deletion result:', result);
      } else if (item.type === 'next_step') {
        // Immediately remove from cache
        queryClient.setQueryData(['clientNextSteps'], (oldData: any) => {
          if (!oldData) return [];
          console.log('Removing next step from cache, before:', oldData?.length);
          const filtered = Array.isArray(oldData) 
            ? oldData.filter(step => step.id !== item.data.id) 
            : oldData;
          console.log('After filter:', filtered?.length);
          return filtered;
        });
        
        // Delete from database
        const result = await supabase
          .from('client_next_steps')
          .delete()
          .eq('id', item.data.id);
        error = result.error;
        
        if (!error) {
          console.log('Next step deletion completed successfully');
        }
      }

      if (error) {
        console.error('Database error during deletion:', error);
        throw new Error(`Failed to delete ${item.type}. Database error: ${error.message}`);
      }

      // Allow short delay before invalidating queries to prevent race conditions
      await delay(500);
      
      // Force a complete cache reset for these queries to ensure deleted items don't reappear
      await queryClient.resetQueries({ queryKey: ['generalTasks'] });
      await queryClient.resetQueries({ queryKey: ['clientNextSteps'] });
      
      // Then properly invalidate all related queries
      await invalidateQueries(item.data.client_id);

      console.log(`Successfully deleted ${item.type} with ID: ${item.data.id}`);
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
        // Update cache first
        queryClient.setQueryData(['generalTasks'], (oldData: any) => {
          if (!oldData) return oldData;
          return Array.isArray(oldData) 
            ? oldData.map(task => 
                task.id === item.data.id 
                  ? {...task, urgent: checked} 
                  : task
              )
            : oldData;
        });
        
        // Then update database
        const { error: updateError } = await supabase
          .from('general_tasks')
          .update({ urgent: checked })
          .eq('id', item.data.id);
        error = updateError;
      } else if (item.type === 'next_step') {
        // Update cache first
        queryClient.setQueryData(['clientNextSteps'], (oldData: any) => {
          if (!oldData) return oldData;
          return Array.isArray(oldData) 
            ? oldData.map(step => 
                step.id === item.data.id 
                  ? {...step, urgent: checked} 
                  : step
              )
            : oldData;
        });
        
        // Then update database
        const { error: updateError } = await supabase
          .from('client_next_steps')
          .update({ urgent: checked })
          .eq('id', item.data.id);
        error = updateError;
      }

      if (error) throw error;

      // Invalidate after a delay
      await delay(500);
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
