
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useGeneralTasks = (category: string, refreshTrigger: number) => {
  return useQuery({
    queryKey: ['generalTasks', category, refreshTrigger],
    queryFn: async () => {
      console.log('Fetching tasks for category:', category); // Debug log

      // Fetch general tasks with case-insensitive category matching
      const { data: tasks, error: tasksError } = await supabase
        .from('general_tasks')
        .select('*, clients(name)')
        .ilike('category', category)
        .order('next_due_date', { ascending: true });

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        throw tasksError;
      }

      // Fetch client next steps that are related to this category
      const { data: nextSteps, error: nextStepsError } = await supabase
        .from('client_next_steps')
        .select('*, clients(name)')
        .ilike('category', category)
        .order('due_date', { ascending: true });

      if (nextStepsError) {
        console.error('Error fetching next steps:', nextStepsError);
        throw nextStepsError;
      }

      // Convert next steps to general task format
      const nextStepTasks = nextSteps?.map(step => ({
        id: `next-step-${step.id}`,
        title: `Next Step for ${step.clients?.name || 'Unknown Client'}`,
        description: step.notes,
        category: category.toLowerCase(),
        status: step.completed_at ? 'completed' : 'incomplete',
        next_due_date: step.due_date,
        created_at: step.created_at,
        updated_at: step.updated_at,
        urgent: step.urgent,
        client_id: step.client_id,
        type: 'next_step',
        original_data: step
      })) || [];

      // Combine all tasks and add type identifier
      const allTasks = [
        ...(tasks?.map(task => ({ ...task, type: 'task' })) || []),
        ...nextStepTasks
      ];

      console.log('Combined tasks:', allTasks); // Debug log
      return allTasks;
    },
    // Force refetch on every category or refreshTrigger change to ensure latest data
    staleTime: 0, 
    gcTime: 0  // Replaced cacheTime with gcTime which is the equivalent in React Query v5
  });
};
