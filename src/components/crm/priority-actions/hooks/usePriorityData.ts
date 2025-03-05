
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { GeneralTaskRow } from '@/integrations/supabase/types/general-tasks.types';

export type PriorityItem = {
  type: 'task';
  date: string | null;
  data: GeneralTaskRow;
} | {
  type: 'next_step';
  date: string | null;
  data: Tables<'client_next_steps'> & { client_name?: string };
};

const fetchGeneralTasks = async (category?: string) => {
  console.log('Fetching tasks for category:', category); // Debug log
  
  let query = supabase
    .from('general_tasks')
    .select('*')
    .eq('status', 'incomplete');

  if (category) {
    // Convert both the category and the database value to lowercase for comparison
    query = query.ilike('category', category);
  }
    
  const { data, error } = await query;
  if (error) throw error;
  console.log('Fetched tasks:', data); // Debug log
  return data;
};

const fetchNextSteps = async () => {
  const { data, error } = await supabase
    .from('client_next_steps')
    .select(`
      *,
      clients (
        name
      )
    `)
    .is('completed_at', null)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data?.map(step => ({
    ...step,
    client_name: step.clients?.name
  }));
};

export const usePriorityData = (category?: string) => {
  const tasksQuery = useQuery({
    queryKey: ['generalTasks', category],
    queryFn: () => fetchGeneralTasks(category),
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true, // Refetch when window gets focus
    refetchOnMount: true // Refetch data when component mounts
  });

  const nextStepsQuery = useQuery({
    queryKey: ['clientNextSteps'],
    queryFn: fetchNextSteps,
    enabled: !category, // Only fetch next steps if no category filter
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const allItems: PriorityItem[] = [
    ...(tasksQuery.data?.map(task => ({
      type: 'task' as const,
      date: task.next_due_date,
      data: task
    })) || []),
    ...(!category ? (nextStepsQuery.data?.map(step => ({
      type: 'next_step' as const,
      date: step.due_date,
      data: step
    })) || []) : [])
  ].sort((a, b) => {
    const aUrgent = 'urgent' in a.data ? a.data.urgent : false;
    const bUrgent = 'urgent' in b.data ? b.data.urgent : false;

    if (aUrgent && !bUrgent) return -1;
    if (!aUrgent && bUrgent) return 1;

    const aDate = a.date;
    const bDate = b.date;

    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;
    return new Date(aDate).getTime() - new Date(bDate).getTime();
  });

  return {
    allItems,
    isLoading: tasksQuery.isLoading || (!category && nextStepsQuery.isLoading),
    error: tasksQuery.error || (!category && nextStepsQuery.error)
  };
};
