import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, tasksTable } from './taskTypes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useTasksMutations = () => {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mutation to update task completion status
  const updateCompletionMutation = useMutation({
    mutationFn: async (args: { taskId: string; completed: boolean }) => {
      setIsUpdating(true);
      supabase.logQuery('tasks', 'updating completion');
      
      const { data, error } = await tasksTable()
        .update({
          status: args.completed ? 'completed' : 'incomplete'
        })
        .eq('id', args.taskId)
        .select();

      if (error) {
        console.error('Error updating task completion:', error);
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
      console.error('Mutation error:', error);
    },
    onSettled: () => {
      setIsUpdating(false);
    }
  });

  // Mutation to update task urgency
  const updateUrgencyMutation = useMutation({
    mutationFn: async (args: { taskId: string; urgent: boolean }) => {
      setIsUpdating(true);
      supabase.logQuery('tasks', 'updating urgency');
      
      const { data, error } = await tasksTable()
        .update({ urgent: args.urgent })
        .eq('id', args.taskId)
        .select();

      if (error) {
        console.error('Error updating task urgency:', error);
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
      supabase.logQuery('tasks', 'deleting');
      
      const { error } = await tasksTable()
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
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
