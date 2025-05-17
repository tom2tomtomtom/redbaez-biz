import logger from '@/utils/logger';

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Task } from "@/hooks/useTaskDeletion";
import { queryKeys } from "@/lib/queryKeys";

export const useGeneralTasks = (category: string, refreshTrigger: number) => {
  return useQuery({
    queryKey: [...queryKeys.tasks.general(), category, refreshTrigger],
    queryFn: async () => {
      logger.info('Fetching tasks for category:', category);

      // Fetch tasks from the unified tasks table
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*, clients(name)')
        .ilike('category', `%${category}%`);

      if (error) {
        logger.error('Error fetching tasks:', error);
        throw error;
      }

      logger.info('Strategy - fetched tasks:', tasks?.length);
      
      // Format tasks for display
      const formattedTasks = tasks?.map(task => ({
        ...task,
        type: 'task' as const,
        source_table: 'tasks',
        next_due_date: task.due_date, // Map due_date to next_due_date for backward compatibility
        notes: task.description, // Map description to notes for backward compatibility
        client_name: task.clients?.name, // Add client_name for compatibility 
        original_data: task // Store the full original object for reference
      })) || [];

      logger.info('Strategy - formatted tasks count:', formattedTasks.length);
      return formattedTasks;
    },
    staleTime: 3000, // Add 3 seconds stale time to prevent immediate refetches 
    gcTime: 60000,   // Keep unused data for 1 minute
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true // Always refetch when window gets focus
  });
};
