
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, getFreshSupabaseClient } from '@/lib/supabase';
import { Task } from './taskTypes';
import { toast } from '@/hooks/use-toast';
import { useTaskDeletion } from '@/hooks/useTaskDeletion';

export const useTaskMutations = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const { deleteTask: deleteTaskHook, invalidateTaskQueries } = useTaskDeletion();
  
  // Update task completion status
  const updateTaskCompletion = useMutation({
    mutationFn: async ({ task, completed }: { task: Task, completed: boolean }) => {
      setIsProcessing(true);
      console.log(`TASKS: Updating task ${task.id} completion to ${completed}`);
      
      // Get a fresh client to avoid caching issues
      const freshClient = getFreshSupabaseClient();

      if (task.source_table === 'general_tasks') {
        const { error } = await freshClient
          .from('general_tasks')
          .update({
            status: completed ? 'completed' : 'incomplete',
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id);

        if (error) throw error;
      } else {
        const { error } = await freshClient
          .from('client_next_steps')
          .update({
            completed_at: completed ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id);

        if (error) throw error;
      }

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
      
      // Get a fresh client to avoid caching issues
      const freshClient = getFreshSupabaseClient();

      if (task.source_table === 'general_tasks') {
        const { error } = await freshClient
          .from('general_tasks')
          .update({
            urgent: urgent,
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id);

        if (error) throw error;
      } else {
        const { error } = await freshClient
          .from('client_next_steps')
          .update({
            urgent: urgent,
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id);

        if (error) throw error;
      }

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
