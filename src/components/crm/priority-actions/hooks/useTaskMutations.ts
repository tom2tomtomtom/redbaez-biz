
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, logResponse } from '@/lib/supabaseClient';
import { Task } from '@/types/task';
import { toast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/queryKeys';

export const useTaskMutations = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Helper function to invalidate task queries
  const invalidateTaskQueries = async () => {
    console.log('Invalidating and refetching task queries');
    
    // Cancel any ongoing queries
    queryClient.cancelQueries();
    
    // First remove the cached data to force fresh fetches
    queryClient.removeQueries({ queryKey: queryKeys.tasks.all() });
    queryClient.removeQueries({ queryKey: ['tasks'] });
    
    // Invalidate all task-related queries
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.list() }),
      queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    ]);
    
    // Force refetch of key queries
    await Promise.all([
      queryClient.refetchQueries({ queryKey: queryKeys.tasks.list() }),
      queryClient.refetchQueries({ queryKey: ['tasks'] }),
    ]);
  };
  
  // Update task completion status
  const updateTaskCompletion = useMutation({
    mutationFn: async ({ task, completed }: { task: Task, completed: boolean }) => {
      setIsProcessing(true);
      console.log(`TASKS: Updating task ${task.id} completion to ${completed}`);
      
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: completed ? 'completed' : 'incomplete',
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select();

      // Log the response
      logResponse({ data }, error, 'updateTaskCompletion');

      if (error) throw error;

      return { taskId: task.id, completed, data };
    },
    onSuccess: (result) => {
      invalidateTaskQueries();
      console.log('Task completion update successful', result);
      toast({
        title: 'Task updated',
        description: 'Task completion status has been updated',
      });
    },
    onError: (error) => {
      console.error('Error updating task completion:', error);
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  // Update task urgency
  const updateTaskUrgency = useMutation({
    mutationFn: async ({ task, urgent }: { task: Task, urgent: boolean }) => {
      setIsProcessing(true);
      console.log(`Updating task ${task.id} urgency to ${urgent}`);
      
      const { data, error } = await supabase
        .from('tasks')
        .update({
          urgent: urgent,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select();

      // Log the response
      logResponse({ data }, error, 'updateTaskUrgency');

      if (error) throw error;

      return { taskId: task.id, urgent, data };
    },
    onSuccess: (result) => {
      invalidateTaskQueries();
      console.log('Task urgency update successful', result);
      toast({
        title: 'Task updated',
        description: 'Task urgency has been updated',
      });
    },
    onError: (error) => {
      console.error('Error updating task urgency:', error);
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  // Delete task
  const deleteTaskMutation = useMutation({
    mutationFn: async (task: Task) => {
      setIsProcessing(true);
      console.log(`Deleting task ${task.id}`);
      
      const { data, error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id)
        .select();

      // Log the response
      logResponse({ data }, error, 'deleteTask');

      if (error) throw error;

      return { taskId: task.id };
    },
    onSuccess: () => {
      invalidateTaskQueries();
      toast({
        title: 'Task deleted',
        description: 'Task has been removed successfully',
      });
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  return {
    isProcessing,
    updateCompletion: (task: Task, completed: boolean) => updateTaskCompletion.mutate({ task, completed }),
    updateUrgency: (task: Task, urgent: boolean) => updateTaskUrgency.mutate({ task, urgent }),
    deleteTask: (task: Task) => deleteTaskMutation.mutate(task),
    invalidateTaskQueries
  };
};
