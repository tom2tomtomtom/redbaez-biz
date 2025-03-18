
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { PriorityItem } from './usePriorityData';
import { useQueryCacheManager } from './useQueryCacheManager';
import { useState } from 'react';

export const useCompletionStatus = () => {
  const { invalidateQueries } = useQueryCacheManager();
  const [processing, setProcessing] = useState(false);

  const handleCompletedChange = async (item: PriorityItem, completed: boolean) => {
    // Prevent multiple simultaneous updates
    if (processing) {
      console.log('Already processing a completion change, ignoring request');
      return false;
    }
    
    try {
      setProcessing(true);
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
      
      // Immediately invalidate and refetch all related queries
      await invalidateQueries(clientId);
      
      // Show a toast to confirm the action
      toast({
        title: completed ? "Task Completed" : "Task Reopened",
        description: completed 
          ? "Task has been marked as completed" 
          : "Task has been reopened",
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
    } finally {
      setProcessing(false);
    }
  };

  return { handleCompletedChange, isProcessing: processing };
};
