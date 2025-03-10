
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Task } from '@/hooks/useTaskDeletion';
import { queryKeys } from '@/lib/queryKeys';

export const useTaskData = (category?: string, showCompleted = false) => {
  return useQuery({
    queryKey: queryKeys.tasks.list({ category, showCompleted }),
    queryFn: async (): Promise<Task[]> => {
      console.log(`Fetching tasks with category: ${category}, showCompleted: ${showCompleted}`);
      
      // Build query for tasks table
      let query = supabase
        .from('tasks')
        .select('*, clients(name)')
        .eq('status', showCompleted ? 'completed' : 'incomplete')
        .order('urgent', { ascending: false })
        .order('due_date', { ascending: true });
        
      // Add category filter if specified
      if (category && category !== 'All') {
        query = query.ilike('category', `%${category}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      // Map the data to our Task type
      const tasks: Task[] = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        client_id: task.client_id,
        client: task.clients,
        due_date: task.due_date,
        urgent: task.urgent || false,
        status: task.status,
        category: task.category,
        created_at: task.created_at,
        updated_at: task.updated_at
      }));
      
      console.log(`Fetched ${tasks.length} tasks`);
      return tasks;
    },
    staleTime: 5000, // 5 seconds before refetching
    gcTime: 60000,   // Keep data for 1 minute after component unmounts
    refetchOnWindowFocus: false, // Don't automatically refetch on window focus
    refetchOnMount: true, // Refetch on mount
  });
};
