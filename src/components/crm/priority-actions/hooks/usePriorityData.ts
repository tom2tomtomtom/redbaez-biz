import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';
import { ClientRow } from '@/integrations/supabase/types/clients.types';
import { GeneralTaskRow } from '@/integrations/supabase/types/general-tasks.types';

export type PriorityItem = {
  type: 'task';
  date: string | null;
  data: GeneralTaskRow;
} | {
  type: 'client';
  date: string | null;
  data: ClientRow;
} | {
  type: 'next_step';
  date: string | null;
  data: Tables<'client_next_steps'> & { client_name?: string };
};

const fetchPriorityClients = async () => {
  const startDate = startOfMonth(new Date());
  const endDate = endOfMonth(new Date());

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .gte('next_due_date', startDate.toISOString())
    .lte('next_due_date', endDate.toISOString())
    .neq('status', 'completed')
    .order('next_due_date');
    
  if (error) throw error;
  return data;
};

const fetchGeneralTasks = async () => {
  const { data, error } = await supabase
    .from('general_tasks')
    .select('*')
    .neq('status', 'completed')
    .order('next_due_date', { ascending: true });
    
  if (error) throw error;
  return data;
};

const fetchNextSteps = async () => {
  const startDate = startOfMonth(new Date());
  const endDate = endOfMonth(new Date());

  const { data, error } = await supabase
    .from('client_next_steps')
    .select(`
      *,
      clients (
        name
      )
    `)
    .gte('due_date', startDate.toISOString())
    .lte('due_date', endDate.toISOString())
    .is('completed_at', null)
    .order('due_date');

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

  if (!a.date) return 1;
  if (!b.date) return -1;
  return new Date(a.date).getTime() - new Date(b.date).getTime();
};

export const usePriorityData = () => {
  const clientsQuery = useQuery({
    queryKey: ['priorityClients'],
    queryFn: fetchPriorityClients,
  });

  const tasksQuery = useQuery({
    queryKey: ['generalTasks'],
    queryFn: fetchGeneralTasks,
  });

  const nextStepsQuery = useQuery({
    queryKey: ['priorityNextSteps'],
    queryFn: fetchNextSteps,
  });

  const isLoading = clientsQuery.isLoading || tasksQuery.isLoading || nextStepsQuery.isLoading;
  const error = clientsQuery.error || tasksQuery.error || nextStepsQuery.error;

  const allItems: PriorityItem[] = [
    ...(tasksQuery.data?.map(task => ({
      type: 'task' as const,
      date: task.next_due_date,
      data: task
    })) || []),
    ...(clientsQuery.data?.map(client => ({
      type: 'client' as const,
      date: client.next_due_date,
      data: client
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