
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

// Simplified task type with only essential properties
type TaskType = {
  id: string;
  source_table?: string;
  type?: string;
};

/**
 * Simplified task deletion hook with focused responsibility
 */
export const useTaskDeletion = (onSuccess?: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const deleteTask = async (task: TaskType) => {
    if (!task?.id) {
      console.error("No valid task ID provided for deletion");
      return false;
    }
    
    if (isDeleting) {
      console.log("Already processing a deletion");
      return false;
    }
    
    setIsDeleting(true);
    console.log(`[DELETE] Starting deletion for task ID: ${task.id}`);
    
    try {
      // Determine which table to delete from
      const tableName = task.source_table || 
                        (task.type === 'next_step' ? 'client_next_steps' : 'general_tasks');
      
      console.log(`[DELETE] Deleting from ${tableName}`);
      
      // Execute the actual deletion
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', task.id);
      
      if (error) {
        throw error;
      }
      
      console.log(`[DELETE] Successfully deleted task from ${tableName}`);
      
      // Invalidate all relevant queries
      await queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all() });
      
      // Specifically refetch the unified view which is used most commonly
      queryClient.refetchQueries({ queryKey: queryKeys.tasks.unified() });
      
      toast({
        title: "Task deleted",
        description: "The task has been removed successfully.",
      });
      
      // Call success callback if provided
      if (onSuccess) {
        setTimeout(onSuccess, 100);
      }
      
      return true;
    } catch (error) {
      console.error('[DELETE] Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteTask, isDeleting };
};
