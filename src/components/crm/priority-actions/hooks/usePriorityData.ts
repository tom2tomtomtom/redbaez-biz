
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
  // Properly convert undefined to a more explicit value for logging
  const categoryToUse = category && typeof category === 'string' ? category : 'all';
  console.log('Fetching general tasks with category:', categoryToUse); 
  
  try {
    let query = supabase
      .from('general_tasks')
      .select('*');

    // Only filter for incomplete tasks
    query = query.eq('status', 'incomplete');
      
    // Only apply category filter if a valid category is provided
    if (category && typeof category === 'string' && category.trim() !== '') {
      // Make the category comparison case-insensitive
      query = query.ilike('category', `%${category}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
    
    console.log('Fetched tasks:', data?.length, data); // Debug log with actual data
    return data || [];
  } catch (error) {
    console.error('Exception in fetchGeneralTasks:', error);
    // Return empty array instead of throwing to prevent query from entering error state
    return [];
  }
};

const fetchNextSteps = async () => {
  console.log('Fetching next steps'); // Debug log
  
  try {
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

    if (error) {
      console.error('Error fetching next steps:', error);
      throw error;
    }
    
    console.log('Fetched next steps:', data?.length, data); // Debug log with actual data
    return data?.map(step => ({
      ...step,
      client_name: step.clients?.name
    })) || [];
  } catch (error) {
    console.error('Exception in fetchNextSteps:', error);
    // Return empty array instead of throwing to prevent query from entering error state
    return [];
  }
};

// Create a unique ID for each item to assist with deduplication and tracking
const createUniqueId = (type: string, id: string) => `${type}-${id}`;

export const usePriorityData = (category?: string, refreshKey?: number) => {
  // Sanitize the category input to prevent confusion
  const sanitizedCategory = typeof category === 'string' ? category : undefined;
  
  console.log('usePriorityData called with category:', sanitizedCategory, 'refreshKey:', refreshKey);
  
  const tasksQuery = useQuery({
    queryKey: ['generalTasks', sanitizedCategory, refreshKey],
    queryFn: () => fetchGeneralTasks(sanitizedCategory),
    staleTime: 30000, // 30 seconds stale time
    gcTime: 60000,    // 1 minute cache time
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3,
  });

  const nextStepsQuery = useQuery({
    queryKey: ['clientNextSteps', refreshKey],
    queryFn: fetchNextSteps,
    staleTime: 30000, // 30 seconds stale time
    gcTime: 60000,    // 1 minute cache time
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 3,
  });

  // Make sure we have arrays even if the query returns null/undefined
  const tasks = tasksQuery.data || [];
  const nextSteps = nextStepsQuery.data || [];

  // Create a deduplication map to ensure we don't have duplicate items
  const deduplicationMap = new Map<string, PriorityItem>();
  
  // Add tasks to the map
  tasks.forEach(task => {
    const key = createUniqueId('task', task.id);
    deduplicationMap.set(key, {
      type: 'task',
      date: task.next_due_date,
      data: task
    });
  });
  
  // Add next steps to the map
  nextSteps.forEach(step => {
    const key = createUniqueId('next_step', step.id);
    deduplicationMap.set(key, {
      type: 'next_step',
      date: step.due_date,
      data: step
    });
  });
  
  // Convert the map values to an array
  const allItems: PriorityItem[] = Array.from(deduplicationMap.values())
    .sort((a, b) => {
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

  console.log('Priority Actions - final items:', allItems.length, allItems);
  
  return {
    allItems,
    isLoading: tasksQuery.isLoading || nextStepsQuery.isLoading,
    error: tasksQuery.error || nextStepsQuery.error,
    refetch: () => {
      console.log('Manually refetching priority data');
      return Promise.all([tasksQuery.refetch(), nextStepsQuery.refetch()]);
    }
  };
};
