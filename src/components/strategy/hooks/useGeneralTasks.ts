import logger from '@/utils/logger';

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Task } from "@/types/task";
import { queryKeys } from "@/lib/queryKeys";
import { mapTaskRowToTask, SupabaseTaskRow } from "@/components/crm/priority-actions/hooks/taskTypes";

export const useGeneralTasks = (category: string, refreshTrigger: number) => {
  return useQuery({
    queryKey: [...queryKeys.tasks.general(), category, refreshTrigger],
    queryFn: async (): Promise<Task[]> => {
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
      const rows = (tasks || []) as SupabaseTaskRow[];
      const formattedTasks = rows.map(mapTaskRowToTask);

      logger.info('Strategy - formatted tasks count:', formattedTasks.length);
      return formattedTasks;
    },
    staleTime: 3000, // Add 3 seconds stale time to prevent immediate refetches 
    gcTime: 60000,   // Keep unused data for 1 minute
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true // Always refetch when window gets focus
  });
};
