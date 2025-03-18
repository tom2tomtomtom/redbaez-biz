
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/hooks/useTaskDeletion';
import { TaskType } from './taskTypes';
import logger from '@/utils/logger';

export type PriorityItem = {
  type: TaskType;
  date: string | null;
  data: Task;
};

const fetchTasks = async (category?: string) => {
  logger.info('Fetching tasks', { category });
  
  try {
    let query = supabase
      .from('tasks')
      .select('*, clients(name)')
      .order('urgent', { ascending: false })
      .order('updated_at', { ascending: false });
      
    if (category && category !== 'All') {
      query = query.ilike('category', `%${category}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      logger.error('Error fetching tasks:', error);
      throw error;
    }
    
    logger.info(`Fetched ${data?.length} tasks`);
    return data || [];
  } catch (error) {
    logger.error('Exception in fetchTasks:', error);
    throw error;
  }
};

// Create a unique ID for each item to assist with tracking
const createUniqueId = (type: string, id: string | number) => `${type}-${id}`;

export const usePriorityData = (category?: string) => {
  const tasksQuery = useQuery({
    queryKey: ['tasks', category], 
    queryFn: () => fetchTasks(category),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  // Ensure we have arrays even if queries return null/undefined
  const tasks = tasksQuery.data || [];

  // Create a map to ensure we don't have duplicates
  const itemsMap = new Map<string, PriorityItem>();
  
  // Add tasks to the map
  tasks.forEach(task => {
    if (task && task.id) {
      const key = createUniqueId('task', task.id);
      itemsMap.set(key, {
        type: 'task',
        date: task.due_date,
        data: {
          id: task.id,
          title: task.title,
          description: task.description,
          client_id: task.client_id,
          client: task.clients,
          client_name: task.clients?.name,
          due_date: task.due_date,
          next_due_date: task.due_date,
          notes: task.description,
          urgent: task.urgent || false,
          status: task.status as 'completed' | 'incomplete',
          category: task.category || 'general',
          created_at: task.created_at,
          updated_at: task.updated_at,
          created_by: task.created_by,
          updated_by: task.updated_by,
          completed_at: task.status === 'completed' ? task.updated_at : null,
          type: 'task' as TaskType
        }
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

  logger.info('Priority items processed', { count: allItems.length });
  
  return {
    allItems,
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    refetch: async () => {
      logger.info('Manually refetching priority data');
      await tasksQuery.refetch();
    }
  };
};
