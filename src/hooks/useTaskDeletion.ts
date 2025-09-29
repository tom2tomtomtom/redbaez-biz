import logger from '@/utils/logger';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { Task, TaskType } from '@/types/task';

// Re-export the Task type for backward compatibility
export type { Task } from '@/types/task';

/**
 * Simplified task deletion hook with focused responsibility
 */
export const useTaskDeletion = (onSuccess?: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const deleteTask = async (task: Pick<Task, 'id'>) => {
    if (!task?.id) {
      logger.error("No valid task ID provided for deletion");
      return false;
    }

    if (isDeleting) {
      logger.info("Already processing a deletion");
      return false;
    }

    setIsDeleting(true);
    logger.info(`[DELETE] Starting deletion for task ID: ${task.id}`);

    try {
      // Check authentication before attempting delete
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

      // Execute the actual deletion from the unified tasks table
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) {
        logger.error('[DELETE] Supabase delete error:', error);
        logger.error('[DELETE] Error code:', error.code);
        logger.error('[DELETE] Error message:', error.message);
        console.error(`🚨 [DELETE] Supabase delete error:`, error);
        console.error(`🚨 [DELETE] Error code: ${error.code}, Error message: ${error.message}`);

        // Check for RLS policy errors
        if (error.code === '42501') {
          throw new Error('Permission denied - you may not have access to delete this task');
        }

        throw error;
      }
      
      logger.info(`[DELETE] Successfully deleted task`);
      console.log(`✅ [DELETE] Successfully deleted task ID: ${task.id}`);
      
      // Simplify cache management to avoid race conditions and unnecessary refetches
      // We no longer remove queries or force refetches - let React Query optimistic updates handle this
      // Just mark the task as deleted for immediate UI update
      queryClient.setQueryData(
        ['tasks'],
        (oldData: Task[] | undefined) => oldData?.filter(t => t.id !== task.id) || []
      );
      
      // Also update all task list queries to remove the deleted task
      queryClient.setQueryData(
        queryKeys.tasks.list(),
        (oldData: Task[] | undefined) => oldData?.filter(t => t.id !== task.id) || []
      );
      
      // Update all other task related queries
      ['generalTasks', 'unified-tasks', 'clientTasks'].forEach(queryKey => {
        queryClient.setQueryData(
          [queryKey],
          (oldData: any[] | undefined) => oldData?.filter(t => t.id !== task.id) || []
        );
      });
      
      // After UI is updated immediately, schedule background revalidation
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }, 500);
      
      toast({
        title: "Task deleted",
        description: "The task has been removed successfully.",
      });
      
      // Call success callback if provided
      if (onSuccess) {
        setTimeout(onSuccess, 100);
      }
      
      return true;
    } catch (error) {
      logger.error('[DELETE] Error deleting task:', error);

      let errorMessage = "Failed to delete task. Please try again.";
      if (error.message.includes('Authentication required')) {
        errorMessage = "Please log in to delete tasks.";
      } else if (error.message.includes('Permission denied')) {
        errorMessage = "You don't have permission to delete this task.";
      } else if (error.code === '42501') {
        errorMessage = "Access denied. Please check your permissions.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteTask, isDeleting };
};
