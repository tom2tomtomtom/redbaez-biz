
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { supabaseDiagnostics } from '@/integrations/supabase/client';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  client_id?: number | null;
  client?: { name: string } | null;
  next_due_date?: string | null;
  due_date?: string | null; // Added for compatibility
  urgent: boolean;
  status?: string;
  completed_at?: string | null;
  category?: string | null;
  source?: string; // Added missing property
}

export const useTasks = (category?: string, showCompleted = false) => {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTasks = async (): Promise<Task[]> => {
    // Log query execution with timestamp for debugging
    supabaseDiagnostics.logQuery('tasks', 'fetching');
    console.log(`[${new Date().toISOString()}] Fetching tasks with category: ${category}, showCompleted: ${showCompleted}`);

    // Prepare query builder
    let query = supabase.from('tasks').select('*, clients(name)');

    // Apply completed filter
    if (showCompleted) {
      query = query.not('completed_at', 'is', null);
    } else {
      query = query.is('completed_at', null);
    }

    // Apply category filter if provided
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    // Execute query with order
    const { data, error } = await query.order('urgent', { ascending: false }).order('next_due_date', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error fetching tasks',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }

    console.log(`[${new Date().toISOString()}] Fetched ${data?.length} tasks`);
    console.log('Tasks data:', data);
    
    return data || [];
  };

  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ['tasks', category, showCompleted, Date.now()], // Add Date.now() to force refresh
    queryFn: fetchTasks,
    staleTime: 0, // Always consider data stale to ensure fresh fetches
    gcTime: 0, // No cache
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Mutation to update task completion status
  const updateCompletionMutation = useMutation({
    mutationFn: async (args: { taskId: string; completed: boolean }) => {
      setIsUpdating(true);
      supabaseDiagnostics.logQuery('tasks', 'updating completion');
      
      const { data, error } = await supabase
        .from('tasks')
        .update({
          completed_at: args.completed ? new Date().toISOString() : null,
          status: args.completed ? 'completed' : 'in_progress'
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
      supabaseDiagnostics.logQuery('tasks', 'updating urgency');
      
      const { data, error } = await supabase
        .from('tasks')
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
      supabaseDiagnostics.logQuery('tasks', 'deleting');
      
      const { error } = await supabase
        .from('tasks')
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
    tasks,
    isLoading,
    isUpdating,
    isDeleting,
    updateCompletion,
    updateUrgency,
    deleteTask,
    refetch
  };
};
