import logger from '@/utils/logger';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, logResponse } from '@/lib/supabaseClient';
import { Task, TaskPriority } from '@/types/task';
import { toast } from '@/hooks/use-toast';

/**
 * Unified hook for task mutations (create, update, delete)
 * Replaces multiple specialized mutation hooks
 */
export const useTaskMutations = () => {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper function to invalidate task queries
  const invalidateTaskQueries = async () => {
    logger.info('Invalidating unified task queries');

    // Clear all cached data for tasks
    queryClient.removeQueries({ queryKey: ['unified-tasks'] });
    queryClient.removeQueries({ queryKey: ['tasks'] });

    // Invalidate all task-related queries
    await queryClient.invalidateQueries({ queryKey: ['unified-tasks'] });
    await queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };
  
  // Unified update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (task: Partial<Task> & { id: string }) => {
      logger.info(`[UPDATE] Starting update for task ID: ${task.id}`);
      console.log(`🔄 [UPDATE] Starting update for task ID: ${task.id}`, task);

      // Check authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('Authentication required to update tasks');
      }

      console.log(`🔄 [UPDATE] Authenticated user: ${session.user.email}`);

      // Prepare update data (exclude read-only fields)
      const updateData = {
        title: task.title,
        description: task.description,
        client_id: task.client_id,
        due_date: task.due_date,
        status: task.status,
        category: task.category,
        // Map priority to legacy urgent field for database compatibility
        urgent: task.priority === 'urgent',
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', task.id)
        .select('*, clients(name)')
        .single();

      if (error) {
        console.error(`🚨 [UPDATE] Supabase update error:`, error);
        throw error;
      }

      console.log(`✅ [UPDATE] Successfully updated task ID: ${task.id}`);
      return data;
    },
    onMutate: () => {
      setIsUpdating(true);
    },
    onSuccess: () => {
      invalidateTaskQueries();
      toast({
        title: "Task updated",
        description: "The task has been updated successfully.",
      });
    },
    onError: (error) => {
      logger.error('[UPDATE] Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUpdating(false);
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (task: Pick<Task, 'id'>) => {
      if (!task?.id) {
        throw new Error("No valid task ID provided for deletion");
      }

      logger.info(`[DELETE] Starting deletion for task ID: ${task.id}`);
      console.log(`🔥 [DELETE] Starting deletion for task ID: ${task.id}`);

      // Check authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        logger.error('[DELETE] Session error:', sessionError);
        throw new Error('Authentication check failed');
      }

      if (!session) {
        logger.error('[DELETE] No authentication session - cannot delete due to RLS policies');
        throw new Error('Authentication required to delete tasks');
      }

      logger.info(`[DELETE] Authenticated user: ${session.user.email}, proceeding with delete`);
      console.log(`🔥 [DELETE] Authenticated user: ${session.user.email}, proceeding with delete task ID: ${task.id}`);

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) {
        logger.error('[DELETE] Supabase delete error:', error);
        console.error(`🚨 [DELETE] Supabase delete error:`, error);

        if (error.code === '42501') {
          throw new Error('Permission denied - you may not have access to delete this task');
        }
        throw error;
      }

      logger.info(`[DELETE] Successfully deleted task`);
      console.log(`✅ [DELETE] Successfully deleted task ID: ${task.id}`);

      return task.id;
    },
    onMutate: () => {
      setIsDeleting(true);
    },
    onSuccess: (taskId) => {
      // Optimistically remove from cache
      queryClient.setQueryData(
        ['unified-tasks'],
        (oldData: Task[] | undefined) => oldData?.filter(t => t.id !== taskId) || []
      );

      invalidateTaskQueries();
      toast({
        title: "Task deleted",
        description: "The task has been removed successfully.",
      });
    },
    onError: (error) => {
      logger.error('[DELETE] Error deleting task:', error);

      let errorMessage = "Failed to delete task. Please try again.";
      if (error.message.includes('Authentication required')) {
        errorMessage = "Please log in to delete tasks.";
      } else if (error.message.includes('Permission denied')) {
        errorMessage = "You don't have permission to delete this task.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsDeleting(false);
    }
  });

  return {
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isUpdating,
    isDeleting,
    updateError: updateTaskMutation.error,
    deleteError: deleteTaskMutation.error,
    invalidateTaskQueries
  };
};
