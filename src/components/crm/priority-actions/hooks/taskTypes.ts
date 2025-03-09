
import { supabase } from '@/lib/supabase';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  client_id?: number | null;
  client?: { name: string } | null;
  next_due_date?: string | null;
  due_date?: string | null; // For compatibility with different data sources
  urgent: boolean;
  status?: string;
  completed_at?: string | null;
  category?: string | null;
  source?: string; // Indicates where the task came from
}

// Helper for creating typed supabase queries
export const tasksTable = () => supabase.from('general_tasks');
