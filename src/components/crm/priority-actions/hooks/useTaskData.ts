
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase, logResponse } from '@/lib/supabaseClient';
import { Task, TaskPriority, TaskStatus } from '@/types/task';
import logger from '@/utils/logger';

/**
 * Unified hook to fetch all tasks from the database
 * Replaces the complex priority/task/next_step system with a simple unified approach
 *
 * @param options Filter options for tasks
 * @returns Query result with unified task data
 */
interface UseTaskDataOptions {
  category?: string;
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  clientId?: number;
}

export const useTaskData = (options: UseTaskDataOptions = {}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { category, status = 'all', priority = 'all', clientId } = options;

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
    queryKey: ['unified-tasks', { category, status, priority, clientId }],
    queryFn: async (): Promise<Task[]> => {
      logger.info(`Fetching unified tasks with filters:`, { category, status, priority, clientId });

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
        // Build query for tasks table
        let query = supabase
          .from('tasks')
          .select('*, clients(name)')

        // Apply filters - by default exclude completed tasks unless specifically requested
        if (status === 'completed') {
          query = query.eq('status', 'completed');
        } else if (status !== 'all') {
          query = query.eq('status', status);
        } else {
          // Default: show only non-completed tasks
          query = query.not('status', 'eq', 'completed');
        }

        if (category && category !== 'All') {
          query = query.ilike('category', `%${category}%`);
        }

        if (clientId) {
          query = query.eq('client_id', clientId);
        }

        // Execute query with priority-based ordering
        const { data, error } = await query
          .order('urgent', { ascending: false }) // Urgent tasks first
          .order('due_date', { ascending: true }); // Then by due date

        logResponse({ data }, error, 'useTaskData');

        if (error) {
          logger.error('Error fetching tasks:', error);
          if (error.code === '42501' || error.message.includes('row-level security')) {
            logger.error('RLS Policy Error: User may not be authenticated or have permissions');
          }
          throw error;
        }

        // Map database rows to unified Task interface
        const tasks: Task[] = (data || []).map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          client_id: task.client_id,
          client: task.clients,
          client_name: task.clients?.name,
          due_date: task.due_date,
          // Map legacy urgent boolean to priority system
          priority: task.urgent ? 'urgent' as TaskPriority : 'normal' as TaskPriority,
          status: task.status as TaskStatus,
          category: task.category,
          created_at: task.created_at,
          updated_at: task.updated_at,
          created_by: task.created_by,
          updated_by: task.updated_by,
          completed_at: task.completed_at,
          // Keep legacy urgent for backward compatibility
          urgent: task.urgent || false
        }));

        // Apply priority filter if specified (client-side since DB still uses boolean)
        let filteredTasks = tasks;
        if (priority !== 'all') {
          filteredTasks = tasks.filter(task => task.priority === priority);
        }

        logger.info(`Processed ${filteredTasks.length} unified tasks`);

        return filteredTasks;
      } catch (error) {
        logger.error('Exception in useTaskData:', error);
        throw error;
      }
    },
    enabled: isAuthenticated, // Only run query when authenticated
    staleTime: 30000,
    gcTime: 300000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      if (error.message.includes('Authentication required')) {
        return false;
      }
      return failureCount < 2;
    }
  });
};
