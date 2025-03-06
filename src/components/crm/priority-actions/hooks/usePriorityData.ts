
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
  console.log('Fetched tasks:', data?.length); // Debug log
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
    .is('completed_at', null) // Only get incomplete next steps
    .order('due_date', { ascending: true });

  if (error) throw error;
  
  console.log('Fetched next steps:', data?.length); // Debug log
  return data?.map(step => ({
    ...step,
    client_name: step.clients?.name
  }));
};

export const usePriorityData = (category?: string, refreshKey?: number) => {
  const tasksQuery = useQuery({
    queryKey: ['generalTasks', category, refreshKey],
    queryFn: () => fetchGeneralTasks(category),
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache at all
    refetchOnWindowFocus: true, // Refetch when window gets focus
    refetchOnMount: true, // Refetch data when component mounts
  });

  const nextStepsQuery = useQuery({
    queryKey: ['clientNextSteps', refreshKey],
    queryFn: fetchNextSteps,
    enabled: !category, // Only fetch next steps if no category filter
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache at all
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  // We have already filtered for incomplete items in the query
  const tasks = tasksQuery.data || [];
  const nextSteps = (!category ? (nextStepsQuery.data || []) : []);

  const allItems: PriorityItem[] = [
    ...tasks.map(task => ({
      type: 'task' as const,
      date: task.next_due_date,
      data: task
    })),
    ...nextSteps.map(step => ({
      type: 'next_step' as const,
      date: step.due_date,
      data: step
    }))
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

  console.log('Priority Actions - all items:', allItems.length);
  
  return {
    allItems,
    isLoading: tasksQuery.isLoading || (!category && nextStepsQuery.isLoading),
    error: tasksQuery.error || (!category && nextStepsQuery.error),
    refetch: () => {
      console.log('Manually refetching priority data');
      tasksQuery.refetch();
      if (!category) {
        nextStepsQuery.refetch();
      }
    }
  };
};
