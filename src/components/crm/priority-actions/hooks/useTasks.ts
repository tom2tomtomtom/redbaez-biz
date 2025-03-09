
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
  original_data?: any;
  source?: 'task' | 'next_step';
};

export const useTasks = (category?: string, showCompleted = false) => {
  const queryClient = useQueryClient();
  const currentTimestamp = Date.now();

  // Log at the start of hook execution to verify it's being called
  console.log(`useTasks hook called with: category=${category}, showCompleted=${showCompleted}, timestamp=${currentTimestamp}`);

  const { data: tasks = [], isLoading, error, refetch } = useQuery({
    queryKey: ['tasks', category, showCompleted, currentTimestamp],
    queryFn: async () => {
      console.log(`Fetching tasks: category=${category}, showCompleted=${showCompleted}`);
      
      try {
        // Fetch general tasks
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
        
        if (category && category !== 'All') {
          tasksQuery = tasksQuery.ilike('category', `%${category}%`);
        }
        
        if (showCompleted) {
          tasksQuery = tasksQuery.eq('status', 'completed');
        } else {
          tasksQuery = tasksQuery.eq('status', 'incomplete');
        }
        
        const { data: taskData, error: taskError } = await tasksQuery;
        
        if (taskError) {
          console.error('Error fetching general tasks:', taskError);
          throw taskError;
        }
        
        console.log('Raw general tasks data:', taskData);
        
        // Transform general tasks into our Task type
        const transformedTasks = (taskData || []).map(task => ({
          id: task.id,
          title: task.title || 'Untitled Task',
          description: task.description,
          category: task.category,
          status: task.status as 'incomplete' | 'completed',
          due_date: task.next_due_date,
          client_id: task.client_id,
          urgent: task.urgent || false,
          created_at: task.created_at,
          updated_at: task.updated_at,
          source: 'task' as const
        }));
        
        // Fetch client next steps
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
            clients(name),
            created_at,
            updated_at
          `);
        
        if (category && category !== 'All') {
          nextStepsQuery = nextStepsQuery.ilike('category', `%${category}%`);
        }
        
        if (showCompleted) {
          nextStepsQuery = nextStepsQuery.not('completed_at', 'is', null);
        } else {
          nextStepsQuery = nextStepsQuery.is('completed_at', null);
        }
        
        const { data: nextStepsData, error: nextStepsError } = await nextStepsQuery;
        
        if (nextStepsError) {
          console.error('Error fetching client next steps:', nextStepsError);
          throw nextStepsError;
        }
        
        console.log('Raw next steps data:', nextStepsData);
        
        // Transform next steps into our Task type
        const transformedNextSteps = (nextStepsData || []).map(step => {
          const clientName = step.clients ? (step.clients as any).name : 'Unknown Client';
          
          return {
            id: `next-step-${step.id}`,
            title: `Next Step: ${clientName}`,
            description: step.notes,
            category: step.category || 'Uncategorized',
            status: step.completed_at ? 'completed' as const : 'incomplete' as const,
            due_date: step.due_date,
            client_id: step.client_id,
            client_name: clientName,
            urgent: step.urgent || false,
            created_at: step.created_at,
            updated_at: step.updated_at,
            original_data: step,
            source: 'next_step' as const
          } as Task;
        });
        
        // Combine and sort tasks
        const allTasks = [...transformedTasks, ...transformedNextSteps].sort((a, b) => {
          if (a.urgent && !b.urgent) return -1;
          if (!a.urgent && b.urgent) return 1;
          
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        });
        
        console.log(`Fetched ${allTasks.length} tasks: ${transformedTasks.length} general tasks and ${transformedNextSteps.length} next steps`);
        console.log('Processed tasks data:', allTasks);
        return allTasks;
      } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache results
    refetchOnWindowFocus: true, // Refresh when window regains focus
    refetchOnMount: true, // Refresh when component mounts
    retry: 2
  });

  // Update task completion status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      if (taskId.startsWith('next-step-')) {
        const id = taskId.replace('next-step-', '');
        const { error } = await supabase
          .from('client_next_steps')
          .update({ completed_at: completed ? new Date().toISOString() : null })
          .eq('id', id);
        
        if (error) throw error;
      } else {
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

  // Update task urgency mutation
  const updateUrgencyMutation = useMutation({
    mutationFn: async ({ taskId, urgent }: { taskId: string; urgent: boolean }) => {
      if (taskId.startsWith('next-step-')) {
        const id = taskId.replace('next-step-', '');
        const { error } = await supabase
          .from('client_next_steps')
          .update({ urgent })
          .eq('id', id);
        
        if (error) throw error;
      } else {
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

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      if (taskId.startsWith('next-step-')) {
        const id = taskId.replace('next-step-', '');
        const { error } = await supabase
          .from('client_next_steps')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } else {
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
