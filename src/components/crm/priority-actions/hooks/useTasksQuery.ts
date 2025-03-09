
import { useQuery } from '@tanstack/react-query';
import { Task, tasksTable } from './taskTypes';
import { supabase, logQuery } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export const useTasksQuery = (category?: string, showCompleted = false) => {
  const fetchTasks = async (): Promise<Task[]> => {
    // Log query execution with timestamp for debugging
    logQuery('tasks', 'fetching');
    console.log(`Fetching tasks with category: ${category}, showCompleted: ${showCompleted}`);

    try {
      // Prepare query builder for general_tasks table
      let query = tasksTable.general().select('*, clients(name)');

      // Apply completed filter
      if (showCompleted) {
        query = query.eq('status', 'completed');
      } else {
        query = query.not('status', 'eq', 'completed');
      }

      // Apply category filter if provided
      if (category && category !== 'All') {
        query = query.ilike('category', `%${category}%`);
      }

      // Execute query with order
      const { data, error } = await query
        .order('urgent', { ascending: false })
        .order('next_due_date', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: 'Error fetching tasks',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      console.log(`Fetched ${data?.length} tasks`);
      
      // Map the returned data to our Task interface
      const tasks = (data || []).map(task => ({
        ...task,
        type: 'task' as const,
        source_table: 'general_tasks' as const
      }));
      
      return tasks;
    } catch (e) {
      console.error('Exception in fetchTasks:', e);
      return [];
    }
  };

  return useQuery({
    queryKey: ['tasks', category, showCompleted],
    queryFn: fetchTasks,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
    gcTime: 0
  });
};
