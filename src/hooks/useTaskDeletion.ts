
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
    
    // Create a list of query keys to invalidate
    const queryKeys = [
      ['tasks'],
      ['generalTasks'],
      ['clientNextSteps'],
      ['priority-data'],
      ['unified-tasks'],
      ['client-items']
    ];
    
    // Invalidate all queries
    for (const key of queryKeys) {
      console.log(`Invalidating query ${key.join('/')}`);
      await queryClient.invalidateQueries({ queryKey: key });
    }
    
    // Force immediate refetches of critical queries
    try {
      await Promise.all([
        queryClient.fetchQuery({ 
          queryKey: ['unified-tasks'],
          staleTime: 0
        }),
        queryClient.fetchQuery({ 
          queryKey: ['generalTasks'],
          staleTime: 0 
        }),
        queryClient.fetchQuery({ 
          queryKey: ['clientNextSteps'],
          staleTime: 0
        }),
        queryClient.fetchQuery({ 
          queryKey: ['client-items'],
          staleTime: 0
        }),
      ]);
    } catch (error) {
      console.log('Error during forced refetch:', error);
    }
    
    console.log(`Invalidation complete at ${new Date().toISOString()}`);
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
      let tableName = 'general_tasks';
      
      // If we have original_data with an ID, use that instead (it's the source of truth)
      if (task.original_data && task.original_data.id) {
        taskId = task.original_data.id;
        console.log(`Using original_data ID: ${taskId}`);
      }
      
      // Remove prefix if it exists (handle both raw string and object formats)
      if (typeof taskId === 'string' && taskId.startsWith('next-step-')) {
        taskId = taskId.replace('next-step-', '');
        console.log(`Removed prefix, using ID: ${taskId}`);
      }
      
      // Determine which table to use
      if (task.source_table) {
        tableName = task.source_table;
      } else if (task.type === 'next_step' || task.type === 'next-step') {
        tableName = 'client_next_steps';
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

      // Verify deletion
      if ((!data || !data.length) && !error) {
        // Try the other table as a fallback
        const otherTable = tableName === 'general_tasks' ? 'client_next_steps' : 'general_tasks';
        console.log(`Attempting deletion from alternate table ${otherTable}`);
        
        const { error: fallbackError } = await supabase
          .from(otherTable)
          .delete()
          .eq('id', taskId)
          .select();
          
        if (fallbackError) {
          console.error('Fallback deletion also failed:', fallbackError);
          toast({
            title: "Warning",
            description: "Task may not have been deleted. Please refresh and try again.",
            variant: "destructive",
          });
          return false;
        }
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
