
import { useQuery } from '@tanstack/react-query';
import { supabase, logResponse } from '@/lib/supabaseClient';
import { Task } from '@/types/task';
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
    queryKey: ['tasks', { category, showCompleted, timestamp: Date.now() }],
    queryFn: async (): Promise<Task[]> => {
      logger.info(`Fetching tasks with category: ${category}, showCompleted: ${showCompleted}`);
      logger.info(`DEBUG: Fetching tasks with category: ${category}, showCompleted: ${showCompleted}`);
      
      try {
        // Build query for general_tasks table with explicit parameters
        let query = supabase
          .from('general_tasks')
          .select('*, clients(name)')
          .eq('status', showCompleted ? 'completed' : 'incomplete');
        
        // Add category filter if specified
        if (category && category !== 'All') {
          query = query.ilike('category', `%${category}%`);
        }

        // Execute query with explicit ordering
        const { data, error } = await query
          .order('urgent', { ascending: false })
          .order('next_due_date', { ascending: true });

        // Log the complete response for debugging
        logResponse({ data }, error, 'useTaskData');

        if (error) {
          logger.error('Error fetching tasks:', error);
          logger.error('Error fetching tasks:', error);
          throw error;
        }

        // Log the raw data for debugging
        logger.info(`Raw tasks data: ${JSON.stringify(data?.slice(0, 2))}`);
        if (data && data.length > 0) {
          logger.info('Raw tasks data sample:', data.slice(0, 2));
        } else {
          logger.info('No tasks data returned from query');
        }

        // Map the data to our Task type
        const tasks: Task[] = (data || []).map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          client_id: task.client_id,
          client: task.clients,
          client_name: task.clients?.name,
          due_date: task.next_due_date || task.due_date,
          urgent: task.urgent || false,
          status: task.status,
          category: task.category,
          created_at: task.created_at,
          updated_at: task.updated_at,
          created_by: task.created_by,
          updated_by: task.updated_by,
          type: 'task' // Set default type
        }));
        
        logger.info(`Processed ${tasks.length} tasks with status: ${showCompleted ? 'completed' : 'incomplete'}`);
        logger.info(`Processed ${tasks.length} tasks with status: ${showCompleted ? 'completed' : 'incomplete'}`);
        
        return tasks;
      } catch (error) {
        logger.error('Exception in useTaskData:', error);
        logger.error('Exception in useTaskData:', error);
        throw error;
      }
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 60000, // Keep data for 1 minute after component unmounts
    refetchOnWindowFocus: true, // Auto refetch on window focus
    refetchOnMount: true, // Refetch on mount
  });
};
