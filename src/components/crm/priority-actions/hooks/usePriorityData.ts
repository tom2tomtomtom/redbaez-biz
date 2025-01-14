import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type PriorityItem = {
  type: 'task' | 'next_step';
  data: Tables<'general_tasks'> | Tables<'client_next_steps'>;
};

export const usePriorityData = (category?: string) => {
  const { data: tasks, isLoading: isTasksLoading, error: tasksError } = useQuery({
    queryKey: ['generalTasks', category],
    queryFn: async () => {
      let query = supabase
        .from('general_tasks')
        .select('*')
        .order('next_due_date', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const { data: nextSteps, isLoading: isNextStepsLoading, error: nextStepsError } = useQuery({
    queryKey: ['clientNextSteps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_next_steps')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  const allItems: PriorityItem[] = [
    ...(tasks?.map(task => ({ type: 'task' as const, data: task })) || []),
    ...(nextSteps?.map(step => ({ type: 'next_step' as const, data: step })) || [])
  ];

  return {
    allItems,
    isLoading: isTasksLoading || isNextStepsLoading,
    error: tasksError || nextStepsError
  };
};