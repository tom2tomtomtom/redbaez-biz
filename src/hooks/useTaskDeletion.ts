
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { useQueryManager } from '@/hooks/useQueryManager';
import { Task, TaskType } from '@/types/task';
import logger from '@/utils/logger';

// Re-export the Task type for backward compatibility
export type { Task } from '@/types/task';

/**
 * Simplified task deletion hook with focused responsibility
 */
export const useTaskDeletion = (onSuccess?: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { invalidateTaskQueries } = useQueryManager();

  const deleteTask = async (task: Pick<Task, 'id'>) => {
    if (!task?.id) {
      logger.error('No valid task ID provided for deletion');
      return false;
    }
    
    if (isDeleting) {
      logger.info('Already processing a deletion');
      return false;
    }
    
    setIsDeleting(true);
    logger.info(`[DELETE] Starting deletion for task ID: ${task.id}`);
    
    try {
      // Execute the actual deletion from the unified tasks table
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);
      
      if (error) {
        throw error;
      }
      
      logger.info('[DELETE] Successfully deleted task');
      
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
        invalidateTaskQueries();
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
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteTask, isDeleting };
};
