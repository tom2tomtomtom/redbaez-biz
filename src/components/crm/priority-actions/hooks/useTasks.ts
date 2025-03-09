
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export type Task = {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: 'incomplete' | 'completed';
  due_date?: string;
  client_id?: number;
  client_name?: string;
  urgent?: boolean;
  created_at?: string;
  updated_at?: string;
};

// Unified hook for all task operations
export const useTasks = (category?: string, showCompleted = false) => {
  const queryClient = useQueryClient();
  const currentTimestamp = Date.now(); // Use timestamp to prevent caching

  // Fetch all tasks
  const { data: tasks = [], isLoading, error, refetch } = useQuery({
    queryKey: ['tasks', category, showCompleted, currentTimestamp],
    queryFn: async () => {
      console.log(`Fetching tasks: category=${category}, showCompleted=${showCompleted}`);
      
      try {
        // First fetch general tasks
        let tasksQuery = supabase
          .from('general_tasks')
          .select(`
            id,
            title,
            description,
            category,
            status,
            next_due_date,
            client_id,
            urgent,
            created_at,
            updated_at
          `);
        
        // Apply category filter if provided
        if (category && category !== 'All') {
          tasksQuery = tasksQuery.ilike('category', `%${category}%`);
        }
        
        // Filter by completion status
        if (showCompleted) {
          tasksQuery = tasksQuery.eq('status', 'completed');
        } else {
          tasksQuery = tasksQuery.eq('status', 'incomplete');
        }
        
        const { data: taskData, error: taskError } = await tasksQuery;
        
        if (taskError) throw taskError;
        
        // Transform general tasks to match our Task interface
        const transformedTasks = (taskData || []).map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          category: task.category,
          status: task.status as 'incomplete' | 'completed',
          due_date: task.next_due_date,
          client_id: task.client_id,
          urgent: task.urgent,
          created_at: task.created_at,
          updated_at: task.updated_at
        }));
        
        // Next fetch client next steps and transform to match task format
        let nextStepsQuery = supabase
          .from('client_next_steps')
          .select(`
            id,
            notes,
            category,
            due_date,
            completed_at,
            urgent,
            client_id,
            clients (
              name
            ),
            created_at,
            updated_at
          `);
        
        // Apply category filter if provided
        if (category && category !== 'All') {
          nextStepsQuery = nextStepsQuery.ilike('category', `%${category}%`);
        }
        
        // Filter by completion status
        if (showCompleted) {
          nextStepsQuery = nextStepsQuery.not('completed_at', 'is', null);
        } else {
          nextStepsQuery = nextStepsQuery.is('completed_at', null);
        }
        
        const { data: nextStepsData, error: nextStepsError } = await nextStepsQuery;
        
        if (nextStepsError) throw nextStepsError;
        
        // Transform next steps to match task format
        const transformedNextSteps = (nextStepsData || []).map(step => {
          // Extract client name safely
          const clientName = step.clients ? step.clients.name : 'Unknown Client';
          
          return {
            id: `next-step-${step.id}`,
            title: `Next Step: ${clientName}`,
            description: step.notes,
            category: step.category,
            status: step.completed_at ? 'completed' : 'incomplete',
            due_date: step.due_date,
            client_id: step.client_id,
            client_name: clientName,
            urgent: step.urgent,
            created_at: step.created_at,
            updated_at: step.updated_at,
            original_data: step // Keep original data for updates
          };
        });
        
        // Combine both arrays and sort by urgency and due date
        const allTasks = [...transformedTasks, ...transformedNextSteps].sort((a, b) => {
          // Sort by urgency first
          if (a.urgent && !b.urgent) return -1;
          if (!a.urgent && b.urgent) return 1;
          
          // Then sort by due date
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        });
        
        console.log(`Fetched ${allTasks.length} tasks`);
        return allTasks;
      } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0 // Don't cache
  });

  // Create mutation to update task completion status
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      if (taskId.startsWith('next-step-')) {
        // Update next step
        const id = taskId.replace('next-step-', '');
        const { error } = await supabase
          .from('client_next_steps')
          .update({ completed_at: completed ? new Date().toISOString() : null })
          .eq('id', id);
        
        if (error) throw error;
      } else {
        // Update general task
        const { error } = await supabase
          .from('general_tasks')
          .update({ status: completed ? 'completed' : 'incomplete' })
          .eq('id', taskId);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Task updated successfully"
      });
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  });

  // Create mutation to update task urgency
  const updateUrgencyMutation = useMutation({
    mutationFn: async ({ taskId, urgent }: { taskId: string; urgent: boolean }) => {
      if (taskId.startsWith('next-step-')) {
        // Update next step
        const id = taskId.replace('next-step-', '');
        const { error } = await supabase
          .from('client_next_steps')
          .update({ urgent })
          .eq('id', id);
        
        if (error) throw error;
      } else {
        // Update general task
        const { error } = await supabase
          .from('general_tasks')
          .update({ urgent })
          .eq('id', taskId);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Task urgency updated"
      });
    },
    onError: (error) => {
      console.error('Error updating task urgency:', error);
      toast({
        title: "Error",
        description: "Failed to update task urgency",
        variant: "destructive"
      });
    }
  });

  // Create mutation to delete task
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      if (taskId.startsWith('next-step-')) {
        // Delete next step
        const id = taskId.replace('next-step-', '');
        const { error } = await supabase
          .from('client_next_steps')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } else {
        // Delete general task
        const { error } = await supabase
          .from('general_tasks')
          .delete()
          .eq('id', taskId);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Task deleted successfully"
      });
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  });

  return {
    tasks,
    isLoading,
    error,
    refetch,
    updateCompletion: (taskId: string, completed: boolean) => 
      updateTaskMutation.mutate({ taskId, completed }),
    updateUrgency: (taskId: string, urgent: boolean) => 
      updateUrgencyMutation.mutate({ taskId, urgent }),
    deleteTask: (taskId: string) => 
      deleteTaskMutation.mutate(taskId),
    isUpdating: updateTaskMutation.isPending || updateUrgencyMutation.isPending,
    isDeleting: deleteTaskMutation.isPending
  };
};
