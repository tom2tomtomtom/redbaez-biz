
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useGeneralTasks = (category: string, refreshTrigger: number) => {
  return useQuery({
    queryKey: ['generalTasks', category, refreshTrigger],
    queryFn: async () => {
      console.log('Fetching tasks for category:', category);

      // First fetch general tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('general_tasks')
        .select('*, clients(name)')
        .ilike('category', `%${category}%`);

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        throw tasksError;
      }

      console.log('Strategy - fetched tasks:', tasks?.length, tasks);

      // Then fetch client next steps
      const { data: nextSteps, error: nextStepsError } = await supabase
        .from('client_next_steps')
        .select('*, clients(name)')
        .ilike('category', `%${category}%`);

      if (nextStepsError) {
        console.error('Error fetching next steps:', nextStepsError);
        throw nextStepsError;
      }

      console.log('Strategy - fetched next steps:', nextSteps?.length, nextSteps);

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
        source_table: 'client_next_steps',
        original_data: step
      })) || [];

      // Prepare general tasks with type and source table
      const generalTasksFormatted = (tasks || []).map(task => ({
        ...task, 
        type: 'task',
        source_table: 'general_tasks'
      }));

      // Combine all tasks 
      const allTasks = [...generalTasksFormatted, ...nextStepTasks];

      console.log('Strategy - combined tasks:', allTasks.length, allTasks);
      return allTasks;
    },
    staleTime: 0, 
    gcTime: 0
  });
};
