
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
      // Force a HARD RESET instead of just invalidating for these key queries
      await queryClient.resetQueries({ 
        queryKey: ['generalTasks'],
      });
      
      await queryClient.resetQueries({ 
        queryKey: ['clientNextSteps'],
      });
      
      await queryClient.resetQueries({
        queryKey: ['priorityData'],
      });
      
      // Only after reset, properly invalidate to trigger refetches
      await queryClient.invalidateQueries({ 
        queryKey: ['generalTasks'],
        refetchType: 'all'
      });
      
      await queryClient.invalidateQueries({ 
        queryKey: ['clientNextSteps'],
        refetchType: 'all'
      });
      
      await queryClient.invalidateQueries({
        queryKey: ['priorityData'],
        refetchType: 'all'
      });
      
      // If there's a client ID, invalidate client-specific queries
      if (clientId) {
        await queryClient.resetQueries({ 
          queryKey: ['client', clientId],
        });
        
        await queryClient.resetQueries({ 
          queryKey: ['client-items', clientId],
        });
        
        await queryClient.invalidateQueries({ 
          queryKey: ['client', clientId],
          refetchType: 'all'
        });
        
        await queryClient.invalidateQueries({ 
          queryKey: ['client-items', clientId],
          refetchType: 'all'
        });
      }
      
      console.log('Query cache fully reset and invalidated');
    } catch (err) {
      console.error('Error invalidating queries:', err);
    }
  };

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
      
      // Only after successful database update, update the cache
      if (isTask) {
        queryClient.setQueryData(['generalTasks'], (oldData: any) => {
          if (!oldData) return oldData;
          return Array.isArray(oldData) 
            ? oldData.map(task => 
                task.id === itemId
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
                step.id === itemId 
                  ? {...step, completed_at: completed ? new Date().toISOString() : null} 
                  : step
              )
            : oldData;
        });
      }

      // Give time for the UI to update before invalidating queries
      await delay(300);
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

  const handleDelete = async (item: PriorityItem) => {
    try {
      let deleteError = null;
      const itemId = item.data.id;
      const clientId = item.data.client_id;
      
      console.log(`Attempting to delete ${item.type} with ID: ${itemId}`);

      // Perform the database deletion FIRST, before touching the cache
      if (item.type === 'task') {
        const { error } = await supabase
          .from('general_tasks')
          .delete()
          .eq('id', itemId);
        deleteError = error;
        console.log('Task deletion database result:', error ? 'Error: ' + error.message : 'Success');
      } else if (item.type === 'next_step') {
        const { error } = await supabase
          .from('client_next_steps')
          .delete()
          .eq('id', itemId);
        deleteError = error;
        console.log('Next step deletion database result:', error ? 'Error: ' + error.message : 'Success');
      }

      if (deleteError) {
        console.error('Database error during deletion:', deleteError);
        throw new Error(`Failed to delete ${item.type}. Database error: ${deleteError.message}`);
      }

      // After successful database deletion, THEN update the cache
      if (item.type === 'task') {
        // Remove from generalTasks cache
        queryClient.setQueryData(['generalTasks'], (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return [];
          return oldData.filter(task => task.id !== itemId);
        });
      } else if (item.type === 'next_step') {
        // Remove from clientNextSteps cache
        queryClient.setQueryData(['clientNextSteps'], (oldData: any) => {
          if (!oldData || !Array.isArray(oldData)) return [];
          return oldData.filter(step => step.id !== itemId);
        });
      }
      
      // Also remove from priorityData cache
      queryClient.setQueryData(['priorityData'], (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) return [];
        return oldData.filter(i => !(i.type === item.type && i.data.id === itemId));
      });

      // Force a complete cache reset and invalidation
      await delay(100); // Brief delay
      await queryClient.resetQueries();
      await delay(100); // Brief delay
      await invalidateQueries(clientId);

      console.log(`Successfully deleted ${item.type} with ID: ${itemId}`);
      toast({
        title: "Success",
        description: `${item.type === 'task' ? 'Task' : 'Next step'} deleted successfully`,
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

      // Then update cache
      if (item.type === 'task') {
        queryClient.setQueryData(['generalTasks'], (oldData: any) => {
          if (!oldData) return oldData;
          return Array.isArray(oldData) 
            ? oldData.map(task => 
                task.id === itemId 
                  ? {...task, urgent: checked} 
                  : task
              )
            : oldData;
        });
      } else if (item.type === 'next_step') {
        queryClient.setQueryData(['clientNextSteps'], (oldData: any) => {
          if (!oldData) return oldData;
          return Array.isArray(oldData) 
            ? oldData.map(step => 
                step.id === itemId 
                  ? {...step, urgent: checked} 
                  : step
              )
            : oldData;
        });
      }
      
      // Also update in priorityData cache
      queryClient.setQueryData(['priorityData'], (oldData: any) => {
        if (!oldData) return oldData;
        return Array.isArray(oldData) 
          ? oldData.map(i => {
              if (i.type === item.type && i.data.id === itemId) {
                return {
                  ...i,
                  data: {
                    ...i.data,
                    urgent: checked
                  }
                };
              }
              return i;
            })
          : oldData;
      });

      // Invalidate after a delay
      await delay(300);
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

  return {
    handleCompletedChange,
    handleUrgentChange,
    handleDelete
  };
};
