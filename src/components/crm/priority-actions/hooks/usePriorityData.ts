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
  let query = supabase
    .from('general_tasks')
    .select('*')
    .neq('status', 'completed')
    .not('next_due_date', 'is', null)
    .order('next_due_date', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }
    
  const { data, error } = await query;
  if (error) throw error;
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

const sortByUrgencyAndDate = (a: PriorityItem, b: PriorityItem) => {
  const aUrgent = 'urgent' in a.data ? a.data.urgent : false;
  const bUrgent = 'urgent' in b.data ? b.data.urgent : false;

  if (aUrgent && !bUrgent) return -1;
  if (!aUrgent && bUrgent) return 1;

  const aDate = a.type === 'task' ? a.data.next_due_date : a.data.due_date;
  const bDate = b.type === 'task' ? b.data.next_due_date : b.data.due_date;

  if (!aDate) return 1;
  if (!bDate) return -1;
  return new Date(aDate).getTime() - new Date(bDate).getTime();
};

export const usePriorityData = (category?: string) => {
  const tasksQuery = useQuery({
    queryKey: ['generalTasks', category],
    queryFn: () => fetchGeneralTasks(category),
  });

  const nextStepsQuery = useQuery({
    queryKey: ['priorityNextSteps'],
    queryFn: fetchNextSteps,
    enabled: !category, // Only fetch next steps if no category filter
  });

  const isLoading = tasksQuery.isLoading || (!category && nextStepsQuery.isLoading);
  const error = tasksQuery.error || (!category && nextStepsQuery.error);

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
  ].sort(sortByUrgencyAndDate);

  return {
    allItems,
    isLoading,
    error
  };
};