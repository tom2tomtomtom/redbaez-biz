import logger from '@/utils/logger';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, tasksTable } from './taskTypes';
import { supabase, logQuery } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

export const useTasksMutations = () => {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mutation to update task completion status
  const updateCompletionMutation = useMutation({
    mutationFn: async (args: { taskId: string; completed: boolean }) => {
      setIsUpdating(true);
      logQuery('tasks', 'updating completion');
      
      let table;
      // Determine which table to update based on the task ID format
      if (args.taskId.startsWith('next-step-')) {
        table = tasksTable.nextSteps();
      } else {
        table = tasksTable.general();
      }
      
      const { data, error } = await table
        .update({
          status: args.completed ? 'completed' : 'incomplete'
        })
        .eq('id', args.taskId.replace('next-step-', ''))
        .select();

      if (error) {
        logger.error('Error updating task completion:', error);
        toast({
          title: 'Update failed',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Task updated',
        description: 'Task status has been updated',
      });
    },
    onError: (error) => {
      logger.error('Mutation error:', error);
    },
    onSettled: () => {
      setIsUpdating(false);
    }
  });

  // Mutation to update task urgency
  const updateUrgencyMutation = useMutation({
    mutationFn: async (args: { taskId: string; urgent: boolean }) => {
      setIsUpdating(true);
      logQuery('tasks', 'updating urgency');
      
      let table;
      // Determine which table to update based on the task ID format
      if (args.taskId.startsWith('next-step-')) {
        table = tasksTable.nextSteps();
      } else {
        table = tasksTable.general();
      }
      
      const { data, error } = await table
        .update({ urgent: args.urgent })
        .eq('id', args.taskId.replace('next-step-', ''))
        .select();

      if (error) {
        logger.error('Error updating task urgency:', error);
        toast({
          title: 'Update failed',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Task updated',
        description: 'Task urgency has been updated',
      });
    },
    onSettled: () => {
      setIsUpdating(false);
    }
  });

  // Mutation to delete a task
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      setIsDeleting(true);
      logQuery('tasks', 'deleting');
      
      let table;
      // Determine which table to delete from based on the task ID format
      if (taskId.startsWith('next-step-')) {
        table = tasksTable.nextSteps();
      } else {
        table = tasksTable.general();
      }
      
      const { error } = await table
        .delete()
        .eq('id', taskId.replace('next-step-', ''));

      if (error) {
        logger.error('Error deleting task:', error);
        toast({
          title: 'Delete failed',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return taskId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Task deleted',
        description: 'Task has been removed',
      });
    },
    onSettled: () => {
      setIsDeleting(false);
    }
  });

  // Helper functions that use the mutations
  const updateCompletion = (taskId: string, completed: boolean) =>
    updateCompletionMutation.mutate({ taskId, completed });

  const updateUrgency = (taskId: string, urgent: boolean) =>
    updateUrgencyMutation.mutate({ taskId, urgent });

  const deleteTask = (taskId: string) =>
    deleteTaskMutation.mutate(taskId);

  return {
    isUpdating,
    isDeleting,
    updateCompletion,
    updateUrgency,
    deleteTask
  };
};
