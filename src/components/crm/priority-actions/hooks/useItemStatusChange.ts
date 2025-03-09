
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
      // FIRST, remove all data from cache before invalidating
      queryClient.removeQueries({ 
        queryKey: ['generalTasks'],
        exact: false
      });
      
      queryClient.removeQueries({ 
        queryKey: ['clientNextSteps'],
        exact: false
      });
      
      queryClient.removeQueries({
        queryKey: ['priorityData'],
        exact: false
      });
      
      // Wait for removal to complete
      await delay(100);
      
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
        await queryClient.removeQueries({ 
          queryKey: ['client', clientId],
          exact: false
        });
        
        await queryClient.removeQueries({ 
          queryKey: ['client-items', clientId],
          exact: false
        });
        
        await delay(100);
        
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

  const handleDelete = async (item: PriorityItem) => {
    try {
      console.log(`Attempting to delete ${item.type} with ID: ${item.data.id}`);
      
      let deleteError = null;
      const itemId = item.data.id;
      const clientId = item.data.client_id;
      const itemType = item.type;
      
      // Determine the table name based on item type
      const tableName = itemType === 'task' ? 'general_tasks' : 'client_next_steps';
      
      console.log(`Deleting from table ${tableName} with ID: ${itemId}`);

      // CRITICAL FIX: Verify we're using the correct ID before deleting
      // Perform direct database deletion FIRST
      const { error, count } = await supabase
        .from(tableName)
        .delete()
        .eq('id', itemId)
        .select('count');
        
      deleteError = error;
      
      console.log(`${itemType} deletion database result:`, 
        error ? `Error: ${error.message}` : `Success, deleted ${count || 'unknown'} records`);

      if (deleteError) {
        console.error('Database error during deletion:', deleteError);
        throw new Error(`Failed to delete ${itemType}. Database error: ${deleteError.message}`);
      }

      // IMMEDIATELY clear cache to force a refresh with data that doesn't include the deleted item
      await invalidateQueries(clientId);

      console.log(`Successfully deleted ${itemType} with ID: ${itemId}`);
      
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: `Failed to delete item: ${error.message}`,
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

  return {
    handleCompletedChange,
    handleUrgentChange,
    handleDelete
  };
};
