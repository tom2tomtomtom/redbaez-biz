
import { supabase } from '@/lib/supabase';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  client_id?: number | null;
  client?: { name: string } | null;
  due_date?: string | null;
  urgent: boolean;
  status?: string;
  completed_at?: string | null;
  category?: string | null;
  type: 'task' | 'next_step';
  source_table: 'general_tasks' | 'client_next_steps';
}

// Helper for accessing the appropriate table based on task type
export const getTaskTable = (sourceTable: 'general_tasks' | 'client_next_steps') => {
  return supabase.from(sourceTable);
};
