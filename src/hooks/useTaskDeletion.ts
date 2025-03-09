
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

type TaskType = {
  id: string;
  source_table?: string;
  type?: string;
  original_data?: any;
};

export const useTaskDeletion = (onTaskDeleted?: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  // Improved invalidation with safety checks
  const invalidateTaskQueries = async () => {
    console.log(`Invalidating task queries at ${new Date().toISOString()}`);
    
    // List of known query keys
    const queryKeys = [
      ['tasks'],
      ['generalTasks'],
      ['clientNextSteps'],
      ['unified-tasks'],
      ['client-items']
    ];
    
    // First invalidate all queries without forcing refetch
    for (const key of queryKeys) {
      console.log(`Invalidating query ${key.join('/')}`);
      await queryClient.invalidateQueries({ queryKey: key });
    }
    
    // Then refetch only active queries that we know exist
    try {
      // Get list of active query keys to avoid trying to fetch non-existent ones
      const activeQueries = queryClient.getQueryCache().getAll()
        .map(query => JSON.stringify(query.queryKey));
      
      console.log("Active queries:", activeQueries);
      
      // Only refetch queries that actually exist
      const promises = [];
      
      // Check and refetch unified-tasks if it exists
      if (activeQueries.includes(JSON.stringify(['unified-tasks'])) || 
          activeQueries.some(key => key.includes('unified-tasks'))) {
        console.log("Refetching unified-tasks");
        promises.push(queryClient.refetchQueries({ queryKey: ['unified-tasks'] }));
      }
      
      // Check and refetch generalTasks if it exists
      if (activeQueries.includes(JSON.stringify(['generalTasks'])) || 
          activeQueries.some(key => key.includes('generalTasks'))) {
        console.log("Refetching generalTasks");
        promises.push(queryClient.refetchQueries({ queryKey: ['generalTasks'] }));
      }
      
      // Check and refetch clientNextSteps if it exists
      if (activeQueries.includes(JSON.stringify(['clientNextSteps'])) || 
          activeQueries.some(key => key.includes('clientNextSteps'))) {
        console.log("Refetching clientNextSteps");
        promises.push(queryClient.refetchQueries({ queryKey: ['clientNextSteps'] }));
      }
      
      // Check and refetch client-items if it exists
      if (activeQueries.includes(JSON.stringify(['client-items'])) || 
          activeQueries.some(key => key.includes('client-items'))) {
        console.log("Refetching client-items");
        promises.push(queryClient.refetchQueries({ queryKey: ['client-items'] }));
      }
      
      if (promises.length > 0) {
        await Promise.all(promises);
      }
    } catch (error) {
      console.log('Error during refetch:', error);
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
      
      // Run a second invalidation after a short delay
      setTimeout(async () => {
        await invalidateTaskQueries();
        
        // Call the callback if provided
        if (onTaskDeleted) {
          console.log('Executing onTaskDeleted callback');
          onTaskDeleted();
        }
      }, 500);
      
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
      
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
