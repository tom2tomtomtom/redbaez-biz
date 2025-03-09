
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

type TaskType = {
  id: string;
  source_table?: string;
  type?: string;
  original_data?: any;
};

export const useTaskDeletion = (onTaskDeleted?: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  // Get a list of active query keys from the cache
  const getActiveQueries = () => {
    return queryClient.getQueryCache().getAll()
      .map(query => JSON.stringify(query.queryKey));
  };

  // Improved invalidation with safety checks
  const invalidateTaskQueries = async () => {
    console.log(`Invalidating task queries at ${new Date().toISOString()}`);
    
    // Get active queries before starting
    const activeQueries = getActiveQueries();
    console.log("Active queries:", activeQueries);
    
    // Track which queries we've already invalidated to avoid duplicates
    const invalidatedKeys = new Set();
    
    // Invalidate and refetch only queries that actually exist
    const promises = [];
    
    // Check and invalidate unified-tasks if it exists
    if (activeQueries.some(key => key.includes('unified-tasks'))) {
      console.log("Invalidating and refetching unified-tasks");
      invalidatedKeys.add('unified-tasks');
      await queryClient.invalidateQueries({ queryKey: queryKeys.tasks.unified() });
      promises.push(queryClient.refetchQueries({ queryKey: queryKeys.tasks.unified() }));
    }
    
    // Check and invalidate generalTasks if it exists
    if (activeQueries.some(key => key.includes('generalTasks'))) {
      console.log("Invalidating generalTasks");
      invalidatedKeys.add('generalTasks');
      await queryClient.invalidateQueries({ queryKey: queryKeys.tasks.general() });
    }
    
    // Check and invalidate clientNextSteps if it exists
    if (activeQueries.some(key => key.includes('clientNextSteps'))) {
      console.log("Invalidating clientNextSteps");
      invalidatedKeys.add('clientNextSteps');
      await queryClient.invalidateQueries({ queryKey: queryKeys.tasks.clientNextSteps() });
    }
    
    // Check and invalidate client-items if it exists
    if (activeQueries.some(key => key.includes('client-items'))) {
      console.log("Invalidating client-items");
      invalidatedKeys.add('client-items');
      await queryClient.invalidateQueries({ queryKey: queryKeys.tasks.clientItems() });
    }
    
    // Wait for all refetch promises to complete
    if (promises.length > 0) {
      try {
        await Promise.all(promises);
      } catch (error) {
        console.error('Error during refetch:', error);
      }
    }
    
    console.log(`Invalidation complete at ${new Date().toISOString()}`);
  };

  // Find which table the task exists in
  const findTaskLocation = async (taskId: string) => {
    console.log(`Searching for task with ID: ${taskId}`);
    
    // Check general_tasks table
    const { data: generalTask, error: generalError } = await supabase
      .from('general_tasks')
      .select('id')
      .eq('id', taskId)
      .maybeSingle();
      
    if (generalError) {
      console.error('Error checking general_tasks:', generalError);
    }
    
    if (generalTask) {
      console.log(`Found task in general_tasks table`);
      return 'general_tasks';
    }
    
    // Check client_next_steps table
    const { data: nextStep, error: nextStepError } = await supabase
      .from('client_next_steps')
      .select('id')
      .eq('id', taskId)
      .maybeSingle();
      
    if (nextStepError) {
      console.error('Error checking client_next_steps:', nextStepError);
    }
    
    if (nextStep) {
      console.log(`Found task in client_next_steps table`);
      return 'client_next_steps';
    }
    
    console.log(`Task not found in any table`);
    return null;
  };

  const deleteTask = async (task: TaskType) => {
    if (!task || !task.id) {
      console.error("No valid task provided for deletion");
      return false;
    }
    
    if (isDeleting) {
      console.log("Already processing a deletion, skipping");
      return false;
    }
    
    setIsDeleting(true);
    console.log(`Starting deletion for task`, task);
    
    try {
      // Extract the pure ID without any prefix
      let taskId = task.id;
      
      // If we have original_data with an ID, use that instead (it's the source of truth)
      if (task.original_data && task.original_data.id) {
        taskId = task.original_data.id;
        console.log(`Using original_data ID: ${taskId}`);
      }
      
      // Remove prefix if it exists
      if (typeof taskId === 'string' && taskId.startsWith('next-step-')) {
        taskId = taskId.replace('next-step-', '');
        console.log(`Removed prefix, using ID: ${taskId}`);
      }
      
      // Find which table contains the task
      let tableName = task.source_table;
      
      // If source_table is not provided, find it
      if (!tableName) {
        tableName = await findTaskLocation(taskId);
      }
      
      if (!tableName) {
        console.error(`Task with ID ${taskId} not found in any table`);
        toast({
          title: "Error",
          description: "Task not found. It may have been already deleted.",
          variant: "destructive",
        });
        return false;
      }
      
      console.log(`Deleting from ${tableName} with ID: ${taskId}`);
      
      // Execute the deletion
      const { error, data } = await supabase
        .from(tableName)
        .delete()
        .eq('id', taskId)
        .select();
        
      console.log(`Deletion response:`, { data, error });
      
      if (error) {
        console.error('Error deleting task:', error);
        toast({
          title: "Error",
          description: `Failed to delete task: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      // Success - invalidate queries to refresh UI
      await invalidateTaskQueries();
      
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
      
      // Call the callback if provided - after a delay to allow React to update
      if (onTaskDeleted) {
        setTimeout(() => {
          console.log('Executing onTaskDeleted callback');
          onTaskDeleted();
        }, 100);
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error in deletion process:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteTask, isDeleting, invalidateTaskQueries };
};
