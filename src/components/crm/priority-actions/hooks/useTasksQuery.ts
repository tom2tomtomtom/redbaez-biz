
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Task, tasksTable } from './taskTypes';
import { supabaseDiagnostics } from '@/integrations/supabase/client';

export const useTasksQuery = (category?: string, showCompleted = false) => {
  const fetchTasks = async (): Promise<Task[]> => {
    // Log query execution with timestamp for debugging
    supabaseDiagnostics.logQuery('tasks', 'fetching');
    console.log(`[${new Date().toISOString()}] Fetching tasks with category: ${category}, showCompleted: ${showCompleted}`);

    // Prepare query builder for general_tasks table
    let query = tasksTable().select('*, clients(name)');

    // Apply completed filter
    if (showCompleted) {
      query = query.eq('status', 'completed');
    } else {
      query = query.not('status', 'eq', 'completed');
    }

    // Apply category filter if provided
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    // Execute query with order
    const { data, error } = await query.order('urgent', { ascending: false }).order('next_due_date', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error fetching tasks',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }

    console.log(`[${new Date().toISOString()}] Fetched ${data?.length} tasks`);
    console.log('Tasks data:', data);
    
    // Map the returned data to our Task interface
    const tasks = (data || []).map(task => ({
      ...task,
      source: 'general_tasks',
    }));
    
    return tasks;
  };

  return useQuery({
    queryKey: ['tasks', category, showCompleted, Date.now()], // Add Date.now() to force refresh
    queryFn: fetchTasks,
    staleTime: 0, // Always consider data stale to ensure fresh fetches
    gcTime: 0, // No cache
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });
};
