
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

      console.log('Strategy - fetched tasks:', tasks?.length);

      // Then fetch client next steps
      const { data: nextSteps, error: nextStepsError } = await supabase
        .from('client_next_steps')
        .select('*, clients(name)')
        .ilike('category', `%${category}%`);

      if (nextStepsError) {
        console.error('Error fetching next steps:', nextStepsError);
        throw nextStepsError;
      }

      console.log('Strategy - fetched next steps:', nextSteps?.length);
      
      // Log the actual format of next steps for debugging
      if (nextSteps && nextSteps.length > 0) {
        console.log('DEBUG: First next step raw data:', nextSteps[0]);
        console.log('DEBUG: First next step ID format:', nextSteps[0].id, 'Type:', typeof nextSteps[0].id);
      }

      // Convert next steps to general task format
      const nextStepTasks = nextSteps?.map(step => {
        // Create the next step task with consistent ID formatting
        const nextStepTask = {
          id: step.id, // Use the original ID without any prefix
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
          original_data: step // Store the full original object for reference
        };
        
        return nextStepTask;
      }) || [];

      // Prepare general tasks with type and source table
      const generalTasksFormatted = (tasks || []).map(task => ({
        ...task, 
        type: 'task',
        source_table: 'general_tasks',
        original_data: task // Store the original task data
      }));

      // Combine all tasks 
      const allTasks = [...generalTasksFormatted, ...nextStepTasks];

      console.log('Strategy - combined tasks count:', allTasks.length);
      return allTasks;
    },
    staleTime: 3000, // Add 3 seconds stale time to prevent immediate refetches 
    gcTime: 60000,   // Keep unused data for 1 minute
    refetchOnMount: false, // Don't refetch when component mounts
    refetchOnWindowFocus: false // Don't refetch when window gets focus
  });
};
