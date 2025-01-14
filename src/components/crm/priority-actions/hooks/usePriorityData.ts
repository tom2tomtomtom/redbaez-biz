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

const fetchGeneralTasks = async () => {
  const { data, error } = await supabase
    .from('general_tasks')
    .select('*')
    .order('next_due_date', { ascending: true });
    
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
  // First sort by urgency
  const aUrgent = a.data.urgent || false;
  const bUrgent = b.data.urgent || false;

  if (aUrgent && !bUrgent) return -1;
  if (!aUrgent && bUrgent) return 1;

  // Then sort by date
  const aDate = a.type === 'task' ? a.data.next_due_date : a.data.due_date;
  const bDate = b.type === 'task' ? b.data.next_due_date : b.data.due_date;

  if (!aDate) return 1;
  if (!bDate) return -1;
  return new Date(aDate).getTime() - new Date(bDate).getTime();
};

export const usePriorityData = () => {
  const tasksQuery = useQuery({
    queryKey: ['generalTasks'],
    queryFn: fetchGeneralTasks,
  });

  const nextStepsQuery = useQuery({
    queryKey: ['priorityNextSteps'],
    queryFn: fetchNextSteps,
  });

  const isLoading = tasksQuery.isLoading || nextStepsQuery.isLoading;
  const error = tasksQuery.error || nextStepsQuery.error;

  const allItems: PriorityItem[] = [
    ...(tasksQuery.data?.map(task => ({
      type: 'task' as const,
      date: task.next_due_date,
      data: task
    })) || []),
    ...(nextStepsQuery.data?.map(step => ({
      type: 'next_step' as const,
      date: step.due_date,
      data: step
    })) || [])
  ].sort(sortByUrgencyAndDate);

  return {
    allItems,
    isLoading,
    error
  };
};