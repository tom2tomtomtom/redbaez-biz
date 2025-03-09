
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

  const invalidateTaskQueries = async () => {
    console.log(`Invalidating task queries at ${new Date().toISOString()}`);
    
    // Create a list of query keys to invalidate (without priority-data that's causing errors)
    const queryKeys = [
      ['tasks'],
      ['generalTasks'],
      ['clientNextSteps'],
      ['unified-tasks'],
      ['client-items']
    ];
    
    // Invalidate all queries
    for (const key of queryKeys) {
      console.log(`Invalidating query ${key.join('/')}`);
      await queryClient.invalidateQueries({ queryKey: key });
    }
    
    // Force immediate refetches ONLY of queries that exist
    try {
      await Promise.all([
        queryClient.fetchQuery({ 
          queryKey: ['generalTasks'],
          staleTime: 0 
        }),
        queryClient.fetchQuery({ 
          queryKey: ['clientNextSteps'],
          staleTime: 0
        }),
        queryClient.fetchQuery({ 
          queryKey: ['unified-tasks'],
          staleTime: 0
        })
      ]);
    } catch (error) {
      console.log('Error during forced refetch:', error);
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
      const tableName = await findTaskLocation(taskId);
      
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
