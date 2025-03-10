
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  client_id?: number | null;
  client?: { name: string } | null;
  due_date?: string | null;
  urgent: boolean;
  status: 'completed' | 'incomplete';
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  // Add fields that might be needed for backward compatibility
  notes?: string | null;
  next_due_date?: string | null;
  completed_at?: string | null;
  client_name?: string | null; // Add for backward compatibility
  type?: 'task' | 'next_step'; // Add type property for compatibility
};

/**
 * Simplified task deletion hook with focused responsibility
 */
export const useTaskDeletion = (onSuccess?: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const deleteTask = async (task: Pick<Task, 'id'>) => {
    if (!task?.id) {
      console.error("No valid task ID provided for deletion");
      return false;
    }
    
    if (isDeleting) {
      console.log("Already processing a deletion");
      return false;
    }
    
    setIsDeleting(true);
    console.log(`[DELETE] Starting deletion for task ID: ${task.id}`);
    
    try {
      // Execute the actual deletion from the unified tasks table
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);
      
      if (error) {
        throw error;
      }
      
      console.log(`[DELETE] Successfully deleted task`);
      
      // Force immediate invalidation of ALL task-related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.list() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.client() })
      ]);
      
      // Force immediate refetch of key views
      await Promise.all([
        queryClient.refetchQueries({ queryKey: queryKeys.tasks.list() }),
        queryClient.refetchQueries({ queryKey: queryKeys.tasks.client() })
      ]);
      
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
      console.error('[DELETE] Error deleting task:', error);
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
