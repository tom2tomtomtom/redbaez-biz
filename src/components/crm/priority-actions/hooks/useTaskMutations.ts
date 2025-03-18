
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Task, useTaskDeletion } from '@/hooks/useTaskDeletion';
import { toast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/queryKeys';

export const useTaskMutations = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use the core task deletion hook with our own callback
  const { deleteTask: deleteTaskHook } = useTaskDeletion(async () => {
    console.log("Task deletion callback - refreshing queries");
    await invalidateTaskQueries();
  });
  
  // Helper function to invalidate task queries
  const invalidateTaskQueries = async () => {
    console.log('Invalidating and refetching task queries');
    
    // Cancel any ongoing queries
    queryClient.cancelQueries();
    
    // First remove the cached data to force fresh fetches
    queryClient.removeQueries({ queryKey: queryKeys.tasks.unified() });
    queryClient.removeQueries({ queryKey: ['unified-tasks'] });
    
    // Invalidate all task-related queries
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.list() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.client() }),
      queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    ]);
    
    // Force refetch of key queries
    await Promise.all([
      queryClient.refetchQueries({ queryKey: queryKeys.tasks.list() }),
      queryClient.refetchQueries({ queryKey: queryKeys.tasks.client() }),
      queryClient.refetchQueries({ queryKey: ['tasks'] }),
    ]);
  };
  
  // Update task completion status
  const updateTaskCompletion = useMutation({
    mutationFn: async ({ task, completed }: { task: Task, completed: boolean }) => {
      setIsProcessing(true);
      console.log(`TASKS: Updating task ${task.id} completion to ${completed}`);
      
      const { error } = await supabase
        .from('tasks')
        .update({
          status: completed ? 'completed' : 'incomplete',
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);

      if (error) throw error;

      return { taskId: task.id, completed };
    },
    onSuccess: () => {
      invalidateTaskQueries();
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
      
      const { error } = await supabase
        .from('tasks')
        .update({
          urgent: urgent,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);

      if (error) throw error;

      return { taskId: task.id, urgent };
    },
    onSuccess: () => {
      invalidateTaskQueries();
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

  return {
    isProcessing,
    updateCompletion: (task: Task, completed: boolean) => updateTaskCompletion.mutate({ task, completed }),
    updateUrgency: (task: Task, urgent: boolean) => updateTaskUrgency.mutate({ task, urgent }),
    deleteTask: (task: Task) => deleteTaskHook(task),
    invalidateTaskQueries
  };
};
