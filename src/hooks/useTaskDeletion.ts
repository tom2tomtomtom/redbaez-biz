
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

type TaskType = {
  id: string;
  source_table?: string;
  type?: string;
};

export const useTaskDeletion = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const invalidateTaskQueries = async () => {
    console.log(`DELETION: Invalidating all task queries at ${new Date().toISOString()}`);
    
    // Create a list of query keys to invalidate
    const queryKeys = [
      ['tasks'],
      ['generalTasks'],
      ['clientNextSteps'],
      ['priority-data'],
      ['unified-tasks'],
      ['client-items']
    ];
    
    // First invalidate all queries
    for (const key of queryKeys) {
      console.log(`DELETION: Invalidating query ${key.join('/')}`);
      await queryClient.invalidateQueries({ queryKey: key });
    }
    
    // Then force immediate refetches of critical queries
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['unified-tasks'] }),
      queryClient.refetchQueries({ queryKey: ['generalTasks'] }),
      queryClient.refetchQueries({ queryKey: ['clientNextSteps'] }),
      queryClient.refetchQueries({ queryKey: ['client-items'] }),
    ]);
    
    console.log(`DELETION: Invalidation complete at ${new Date().toISOString()}`);
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
    const timestamp = new Date().toISOString();
    console.log(`DELETION: Starting deletion for task ${task.id} at ${timestamp}`);
    
    try {
      // Determine which table to use based on task type or source_table
      let tableName = 'general_tasks';
      let taskId = task.id;
      
      if (task.source_table === 'client_next_steps' || 
          task.type === 'next_step' || 
          task.type === 'next-step') {
        tableName = 'client_next_steps';
        // Extract the actual ID by removing the prefix if it exists
        if (typeof taskId === 'string' && taskId.startsWith('next-step-')) {
          taskId = taskId.replace('next-step-', '');
        }
      }
      
      console.log(`DELETION: Deleting from ${tableName} with ID: ${taskId} at ${timestamp}`);
      
      // Add custom headers to prevent caching issues
      const customHeaders = {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Custom-Timestamp': timestamp
      };
      
      // Perform the deletion
      const { error, data } = await supabase
        .from(tableName)
        .delete()
        .eq('id', taskId)
        .select();
        
      if (error) {
        console.error('DELETION: Error deleting task:', error);
        toast({
          title: "Error",
          description: `Failed to delete task: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      // Success
      console.log(`DELETION: Task deleted successfully from ${tableName}. Response:`, data);
      
      // Invalidate all related queries to ensure UI updates
      await invalidateTaskQueries();
      
      // Run a second invalidation after a short delay to ensure UI is updated
      setTimeout(async () => {
        console.log(`DELETION: Running second invalidation for ${taskId}`);
        await invalidateTaskQueries();
      }, 500);
      
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
      
      return true;
    } catch (error) {
      console.error('DELETION: Unexpected error in deletion process:', error);
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

  return { deleteTask, isDeleting };
};
