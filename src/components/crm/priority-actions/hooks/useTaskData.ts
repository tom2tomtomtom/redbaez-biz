
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Task } from '@/types/task';
import { queryKeys } from '@/lib/queryKeys';
import logger from '@/utils/logger';

/**
 * Custom hook to fetch task data from the Supabase database
 * 
 * @param category Optional category filter
 * @param showCompleted Whether to show completed tasks or active tasks
 * @returns Query result with task data
 */
export const useTaskData = (category?: string, showCompleted = false) => {
  return useQuery({
    queryKey: queryKeys.tasks.list({ category, showCompleted }),
    queryFn: async (): Promise<Task[]> => {
      logger.info(`Fetching tasks with category: ${category}, showCompleted: ${showCompleted}`);
      console.log(`DEBUG: Fetching tasks with category: ${category}, showCompleted: ${showCompleted}`);
      
      // Build query for tasks table
      let query = supabase
        .from('tasks')
        .select('*, clients(name)')
        .eq('status', showCompleted ? 'completed' : 'incomplete');
      
      // Add category filter if specified
      if (category && category !== 'All') {
        query = query.ilike('category', `%${category}%`);
      }

      const { data, error } = await query
        .order('urgent', { ascending: false })
        .order('due_date', { ascending: true });

      if (error) {
        logger.error('Error fetching tasks:', error);
        console.error('Error fetching tasks:', error);
        throw error;
      }

      // Log the raw data for debugging
      logger.info(`Raw tasks data from database: ${JSON.stringify(data?.slice(0, 2))}`);
      console.log('Raw tasks data:', data);

      // Map the data to our Task type
      const tasks: Task[] = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        client_id: task.client_id,
        client: task.clients,
        client_name: task.clients?.name,
        due_date: task.due_date,
        urgent: task.urgent || false,
        status: task.status,
        category: task.category,
        created_at: task.created_at,
        updated_at: task.updated_at,
        created_by: task.created_by,
        updated_by: task.updated_by,
        type: 'task' // Set default type
      }));
      
      logger.info(`Fetched ${tasks.length} tasks with status: ${showCompleted ? 'completed' : 'incomplete'}`);
      console.log(`Fetched ${tasks.length} tasks with status: ${showCompleted ? 'completed' : 'incomplete'}`);
      return tasks;
    },
    staleTime: 5000, // 5 seconds before refetching
    gcTime: 60000,   // Keep data for 1 minute after component unmounts
    refetchOnWindowFocus: true, // Auto refetch on window focus
    refetchOnMount: true, // Refetch on mount
  });
};
