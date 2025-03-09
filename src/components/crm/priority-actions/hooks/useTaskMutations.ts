
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Task } from './taskTypes';
import { toast } from '@/hooks/use-toast';
import { useTaskDeletion } from '@/hooks/useTaskDeletion';

export const useTaskMutations = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const { deleteTask: deleteTaskHook } = useTaskDeletion();
  
  const invalidateTaskQueries = async () => {
    console.log(`TASKS: Invalidating all task queries at ${new Date().toISOString()}`);
    
    // Invalidate all task-related queries to ensure UI refresh
    const queryKeys = [
      ['unified-tasks'],
      ['priority-data'],
      ['tasks'],
      ['generalTasks'],
      ['clientNextSteps']
    ];
    
    // First invalidate all relevant queries
    for (const key of queryKeys) {
      console.log(`TASKS: Invalidating query ${key.join('/')}`);
      await queryClient.invalidateQueries({ queryKey: key });
    }
    
    // Then force immediate refetches of critical queries
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['unified-tasks'] }),
      queryClient.refetchQueries({ queryKey: ['generalTasks'] }),
      queryClient.refetchQueries({ queryKey: ['clientNextSteps'] }),
    ]);
    
    console.log(`TASKS: Invalidation complete at ${new Date().toISOString()}`);
  };

  // Update task completion status
  const updateTaskCompletion = useMutation({
    mutationFn: async ({ task, completed }: { task: Task, completed: boolean }) => {
      setIsProcessing(true);
      console.log(`TASKS: Updating task ${task.id} completion to ${completed}`);

      if (task.source_table === 'general_tasks') {
        const { error } = await supabase
          .from('general_tasks')
          .update({
            status: completed ? 'completed' : 'incomplete',
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
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

      if (task.source_table === 'general_tasks') {
        const { error } = await supabase
          .from('general_tasks')
          .update({
            urgent: urgent,
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
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
