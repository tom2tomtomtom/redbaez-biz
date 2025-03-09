
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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
  console.log('Fetching general tasks');
  
  try {
    // Create a timestamp for this request to prevent caching
    const timestamp = new Date().toISOString();
    
    let query = supabase
      .from('general_tasks')
      .select('*')
      .order('urgent', { ascending: false })
      .order('updated_at', { ascending: false });
      
    if (category && category !== 'All') {
      query = query.ilike('category', `%${category}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching tasks at ${timestamp}:`, error);
      throw error;
    }
    
    console.log(`Fetched ${data?.length} tasks at ${timestamp}`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchGeneralTasks:', error);
    return [];
  }
};

const fetchNextSteps = async (category?: string) => {
  console.log('Fetching next steps');
  
  try {
    // Create a timestamp for this request to prevent caching
    const timestamp = new Date().toISOString();
    
    let query = supabase
      .from('client_next_steps')
      .select(`
        *,
        clients (name)
      `)
      .order('urgent', { ascending: false })
      .order('updated_at', { ascending: false });
      
    if (category && category !== 'All') {
      query = query.ilike('category', `%${category}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching next steps at ${timestamp}:`, error);
      throw error;
    }
    
    console.log(`Fetched ${data?.length} next steps at ${timestamp}`);
    
    return (data || []).map(step => ({
      ...step,
      client_name: step.clients?.name
    }));
  } catch (error) {
    console.error('Error in fetchNextSteps:', error);
    return [];
  }
};

// Create a unique ID for each item to assist with tracking
const createUniqueId = (type: string, id: string | number) => `${type}-${id}`;

export const usePriorityData = (category?: string) => {
  const tasksQuery = useQuery({
    queryKey: ['generalTasks', category], 
    queryFn: () => fetchGeneralTasks(category),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const nextStepsQuery = useQuery({
    queryKey: ['clientNextSteps', category], 
    queryFn: () => fetchNextSteps(category),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  // Ensure we have arrays even if queries return null/undefined
  const tasks = tasksQuery.data || [];
  const nextSteps = nextStepsQuery.data || [];

  // Create a map to ensure we don't have duplicates
  const itemsMap = new Map<string, PriorityItem>();
  
  // Add tasks to the map
  tasks.forEach(task => {
    if (task && task.id) {
      const key = createUniqueId('task', task.id);
      itemsMap.set(key, {
        type: 'task',
        date: task.next_due_date,
        data: task
      });
    }
  });
  
  // Add next steps to the map
  nextSteps.forEach(step => {
    if (step && step.id) {
      const key = createUniqueId('next_step', step.id);
      itemsMap.set(key, {
        type: 'next_step',
        date: step.due_date,
        data: step
      });
    }
  });
  
  // Convert map to sorted array
  const allItems = Array.from(itemsMap.values())
    .sort((a, b) => {
      // First sort by urgency
      const aUrgent = 'urgent' in a.data && a.data.urgent;
      const bUrgent = 'urgent' in b.data && b.data.urgent;

      if (aUrgent && !bUrgent) return -1;
      if (!aUrgent && bUrgent) return 1;

      // Then sort by date
      const aDate = a.date;
      const bDate = b.date;

      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      
      return new Date(aDate).getTime() - new Date(bDate).getTime();
    });

  console.log('Priority items count:', allItems.length);
  
  return {
    allItems,
    isLoading: tasksQuery.isLoading || nextStepsQuery.isLoading,
    error: tasksQuery.error || nextStepsQuery.error,
    refetch: async () => {
      console.log('Manually refetching priority data');
      await Promise.all([
        tasksQuery.refetch(),
        nextStepsQuery.refetch()
      ]);
    }
  };
};
