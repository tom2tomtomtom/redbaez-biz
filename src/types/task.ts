
/**
 * Centralized Task type definition
 */

// Define the task type as a proper union type
export type TaskType = 'task' | 'next_step' | 'idea';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  client_id?: number | null;
  client?: { name: string } | null;
  client_name?: string | null;
  due_date?: string | null;
  urgent: boolean;
  status?: string;
  completed_at?: string | null;
  category?: string | null;
  type?: TaskType;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  source_table?: 'tasks' | 'general_tasks' | 'client_next_steps';
  next_due_date?: string | null; // Added for backward compatibility
}
