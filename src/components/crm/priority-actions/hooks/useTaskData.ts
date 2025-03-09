
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Task } from './taskTypes';
import { logQuery } from '@/lib/supabase';

export const useTaskData = (category?: string, showCompleted = false) => {
  return useQuery({
    queryKey: ['unified-tasks', category, showCompleted],
    queryFn: async (): Promise<Task[]> => {
      logQuery('unified-tasks', 'fetching');
      console.log(`Fetching unified tasks with category: ${category}, showCompleted: ${showCompleted}`);
      
      // Fetch general tasks
      const { data: generalTasks, error: generalTasksError } = await supabase
        .from('general_tasks')
        .select('*, clients(name)')
        .eq(showCompleted ? 'status' : '', showCompleted ? 'completed' : 'incomplete')
        .ilike(category && category !== 'All' ? 'category' : '', category ? `%${category}%` : '')
        .order('urgent', { ascending: false })
        .order('next_due_date', { ascending: true });

      if (generalTasksError) {
        console.error('Error fetching general tasks:', generalTasksError);
        throw generalTasksError;
      }

      // Fetch client next steps
      const { data: nextSteps, error: nextStepsError } = await supabase
        .from('client_next_steps')
        .select('*, clients(name)')
        .is(showCompleted ? 'completed_at' : '', showCompleted ? 'not.null' : 'null')
        .ilike(category && category !== 'All' ? 'category' : '', category ? `%${category}%` : '')
        .order('urgent', { ascending: false })
        .order('due_date', { ascending: true });

      if (nextStepsError) {
        console.error('Error fetching client next steps:', nextStepsError);
        throw nextStepsError;
      }

      // Convert general tasks to unified Task format
      const tasksFormatted = (generalTasks || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        client_id: task.client_id,
        client: task.clients,
        due_date: task.next_due_date,
        urgent: task.urgent || false,
        status: task.status,
        completed_at: task.status === 'completed' ? new Date().toISOString() : null,
        category: task.category,
        type: 'task' as const,
        source_table: 'general_tasks' as const
      }));

      // Convert next steps to unified Task format
      const nextStepsFormatted = (nextSteps || []).map(step => ({
        id: step.id,
        title: `Next Step for ${step.clients?.name || 'Client'}`,
        description: step.notes,
        client_id: step.client_id,
        client: step.clients,
        due_date: step.due_date,
        urgent: step.urgent || false,
        status: step.completed_at ? 'completed' : 'incomplete',
        completed_at: step.completed_at,
        category: step.category,
        type: 'next_step' as const,
        source_table: 'client_next_steps' as const
      }));

      // Combine all tasks and sort by urgency, then due date
      const allTasks = [...tasksFormatted, ...nextStepsFormatted].sort((a, b) => {
        // Sort by urgency first
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        
        // Then sort by due date
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
      
      console.log(`Fetched ${allTasks.length} unified tasks`);
      return allTasks;
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0,    // Clean up unused data immediately
    refetchOnWindowFocus: true
  });
};
