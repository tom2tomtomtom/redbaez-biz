
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useGeneralTasks = (category: string, refreshTrigger: number) => {
  return useQuery({
    queryKey: ['generalTasks', category, refreshTrigger],
    queryFn: async () => {
      console.log('Fetching tasks for category:', category);

      // Fetch tasks from the unified tasks table
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*, clients(name)')
        .ilike('category', `%${category}%`);

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      console.log('Strategy - fetched tasks:', tasks?.length);
      
      // Format tasks for display
      const formattedTasks = tasks?.map(task => ({
        ...task,
        type: 'task',
        source_table: 'tasks',
        next_due_date: task.due_date, // Map due_date to next_due_date for backward compatibility
        original_data: task // Store the full original object for reference
      })) || [];

      console.log('Strategy - formatted tasks count:', formattedTasks.length);
      return formattedTasks;
    },
    staleTime: 3000, // Add 3 seconds stale time to prevent immediate refetches 
    gcTime: 60000,   // Keep unused data for 1 minute
    refetchOnMount: false, // Don't refetch when component mounts
    refetchOnWindowFocus: false // Don't refetch when window gets focus
  });
};
