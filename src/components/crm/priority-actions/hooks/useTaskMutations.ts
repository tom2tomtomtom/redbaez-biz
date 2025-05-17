import logger from '@/utils/logger';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, logResponse } from '@/lib/supabaseClient';
import { Task } from '@/types/task';
import { toast } from '@/hooks/use-toast';

export const useTaskMutations = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Helper function to invalidate task queries
  const invalidateTaskQueries = async () => {
    logger.info('Invalidating task queries');
    
    // Clear all cached data for tasks
    queryClient.removeQueries({ queryKey: ['tasks'] });
    
    // Invalidate all task-related queries
    await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    
    // Force refetch of all task queries
    await queryClient.refetchQueries({ queryKey: ['tasks'] });
  };
  
  // Update task completion status
  const updateTaskCompletion = useMutation({
    mutationFn: async ({ task, completed }: { task: Task, completed: boolean }) => {
      setIsProcessing(true);
      logger.info(`Updating task ${task.id} completion to ${completed}`);
      
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: completed ? 'completed' : 'incomplete',
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select();

      // Log response for debugging
      logResponse({ data }, error, 'updateTaskCompletion');

      if (error) throw error;
      return { taskId: task.id, completed, data };
    },
    onSuccess: () => {
      invalidateTaskQueries();
      toast({
        title: 'Task updated',
        description: 'Task completion status has been updated',
      });
    },
    onError: (error) => {
      logger.error('Error updating task completion:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update task. Please try again.',
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
      logger.info(`Updating task ${task.id} urgency to ${urgent}`);
      
      const { data, error } = await supabase
        .from('tasks')
        .update({
          urgent: urgent,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select();

      // Log response for debugging
      logResponse({ data }, error, 'updateTaskUrgency');

      if (error) throw error;
      return { taskId: task.id, urgent, data };
    },
    onSuccess: () => {
      invalidateTaskQueries();
      toast({
        title: 'Task updated',
        description: 'Task urgency has been updated',
      });
    },
    onError: (error) => {
      logger.error('Error updating task urgency:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update task urgency. Please try again.',
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
      logger.info(`Deleting task ${task.id}`);
      
      const { data, error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id)
        .select();

      // Log response for debugging
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
      logger.error('Error deleting task:', error);
      toast({
        title: 'Delete failed',
        description: 'Failed to delete task. Please try again.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  return {
    isProcessing,
    updateCompletion: (task: Task, completed: boolean) => 
      updateTaskCompletion.mutate({ task, completed }),
    updateUrgency: (task: Task, urgent: boolean) => 
      updateTaskUrgency.mutate({ task, urgent }),
    deleteTask: (task: Task) => 
      deleteTaskMutation.mutate(task),
    invalidateTaskQueries
  };
};
