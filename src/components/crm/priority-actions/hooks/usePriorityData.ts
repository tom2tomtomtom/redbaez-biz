import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';
import { ClientRow } from '@/integrations/supabase/types/clients.types';

export type PriorityItem = {
  type: 'task' | 'client';
  date: string | null;
  data: Tables<'general_tasks'> | ClientRow;
};

const fetchPriorityClients = async () => {
  const startDate = startOfMonth(new Date());
  const endDate = endOfMonth(new Date());

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .gte('next_due_date', startDate.toISOString())
    .lte('next_due_date', endDate.toISOString())
    .order('next_due_date');
    
  if (error) throw error;
  return data;
};

const fetchGeneralTasks = async () => {
  const { data, error } = await supabase
    .from('general_tasks')
    .select('*')
    .order('next_due_date', { ascending: true });
    
  if (error) throw error;
  return data;
};

export const usePriorityData = () => {
  const { 
    data: clients, 
    isLoading: isLoadingClients, 
    error: clientsError 
  } = useQuery({
    queryKey: ['priorityClients'],
    queryFn: fetchPriorityClients,
  });

  const { 
    data: tasks, 
    isLoading: isLoadingTasks, 
    error: tasksError 
  } = useQuery({
    queryKey: ['generalTasks'],
    queryFn: fetchGeneralTasks,
  });

  const isLoading = isLoadingClients || isLoadingTasks;
  const error = clientsError || tasksError;

  const allItems: PriorityItem[] = [
    ...(tasks?.map(task => ({
      type: 'task' as const,
      date: task.next_due_date,
      data: task
    })) || []),
    ...(clients?.map(client => ({
      type: 'client' as const,
      date: client.next_due_date,
      data: client
    })) || [])
  ].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return {
    allItems,
    isLoading,
    error
  };
};