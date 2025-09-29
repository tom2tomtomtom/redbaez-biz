
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return useQuery({
    queryKey: ['tasks', { category, showCompleted }],
    queryFn: async (): Promise<Task[]> => {
      logger.info(`Fetching tasks with category: ${category}, showCompleted: ${showCompleted}`);

      // Check authentication status first - REQUIRED for RLS
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        logger.error('Session error:', sessionError);
        throw new Error('Authentication check failed');
      }

      if (!session) {
        logger.warn('❌ No authentication session - cannot query tasks due to RLS policies');
        throw new Error('Authentication required to access tasks');
      }

      logger.info('✅ Authenticated user:', session.user.email);

      try {
        // Build query for tasks table with explicit parameters
        let query = supabase
          .from('tasks')
          .select('*, clients(name)')

        // Filter by completion status
        if (showCompleted) {
          query = query.eq('status', 'completed');
        } else {
          query = query.not('status', 'eq', 'completed');
        }
        
        // Add category filter if specified
        if (category && category !== 'All') {
          query = query.ilike('category', `%${category}%`);
        }

        // Execute query with explicit ordering
        const { data, error } = await query
          .order('urgent', { ascending: false })
          .order('due_date', { ascending: true });

        // Log the complete response for debugging
        logResponse({ data }, error, 'useTaskData');

        if (error) {
          logger.error('Error fetching tasks:', error);

          // Check for common RLS/auth errors
          if (error.code === '42501' || error.message.includes('row-level security')) {
            logger.error('RLS Policy Error: User may not be authenticated or have permissions');
          }

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
        
        logger.info(`Processed ${tasks.length} tasks with status: ${showCompleted ? 'completed' : 'incomplete'}`);
        logger.info(`Processed ${tasks.length} tasks with status: ${showCompleted ? 'completed' : 'incomplete'}`);
        
        return tasks;
      } catch (error) {
        logger.error('Exception in useTaskData:', error);
        logger.error('Exception in useTaskData:', error);
        throw error;
      }
    },
    enabled: isAuthenticated, // Only run query when authenticated
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 300000, // Keep data for 5 minutes after component unmounts
    refetchOnWindowFocus: true, // Auto refetch on window focus
    refetchOnMount: true, // Refetch on mount
    retry: (failureCount, error) => {
      // Don't retry authentication errors
      if (error.message.includes('Authentication required')) {
        return false;
      }
      return failureCount < 2;
    }
  });
};
