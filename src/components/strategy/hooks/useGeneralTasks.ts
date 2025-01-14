import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useGeneralTasks = (category: string, refreshTrigger: number) => {
  return useQuery({
    queryKey: ['generalTasks', category, refreshTrigger],
    queryFn: async () => {
      console.log('Fetching tasks for category:', category); // Debug log

      // Fetch general tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('general_tasks')
        .select('*, clients(name)')
        .eq('category', category.toLowerCase())
        .order('next_due_date', { ascending: true });

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        throw tasksError;
      }

      // Fetch client next steps that are related to this category
      const { data: nextSteps, error: nextStepsError } = await supabase
        .from('client_next_steps')
        .select('*, clients(name)')
        .eq('category', category.toLowerCase())
        .is('completed_at', null)
        .order('due_date', { ascending: true });

      if (nextStepsError) {
        console.error('Error fetching next steps:', nextStepsError);
        throw nextStepsError;
      }

      // Fetch strategic recommendations
      const { data: recommendations, error: recommendationsError } = await supabase
        .from('recommendations')
        .select('*, clients(name)')
        .eq('category', category.toLowerCase())
        .eq('status', 'pending')
        .order('due_date', { ascending: true });

      if (recommendationsError) {
        console.error('Error fetching recommendations:', recommendationsError);
        throw recommendationsError;
      }

      // Convert next steps and recommendations to general task format
      const nextStepTasks = nextSteps?.map(step => ({
        id: `next-step-${step.id}`,
        title: `Next Step for ${step.clients?.name || 'Unknown Client'}`,
        description: step.notes,
        category: category.toLowerCase(),
        status: step.completed_at ? 'completed' : null,
        next_due_date: step.due_date,
        created_at: step.created_at,
        updated_at: step.updated_at,
        urgent: step.urgent,
        client_id: step.client_id
      })) || [];

      const recommendationTasks = recommendations?.map(rec => ({
        id: `recommendation-${rec.id}`,
        title: `Strategic Recommendation for ${rec.clients?.name || 'Unknown Client'}`,
        description: rec.description,
        category: category.toLowerCase(),
        status: rec.status === 'completed' ? 'completed' : null,
        next_due_date: rec.due_date,
        created_at: rec.created_at,
        updated_at: rec.created_at,
        urgent: false,
        client_id: rec.client_id
      })) || [];

      // Combine all tasks
      const allTasks = [
        ...(tasks || []),
        ...nextStepTasks,
        ...recommendationTasks
      ];

      console.log('Combined tasks:', allTasks); // Debug log
      return allTasks;
    }
  });
};