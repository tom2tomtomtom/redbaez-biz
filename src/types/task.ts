
/**
 * Unified Task type definition - Single task type for all use cases
 */

// Priority levels for tasks (replaces the complex type system)
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

// Task status
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

// Unified Task interface
export interface Task {
  id: string;
  title: string;
  description?: string | null;
  client_id?: number | null;
  client?: { name: string } | null;
  client_name?: string | null;
  due_date?: string | null;
  priority: TaskPriority; // Replaces 'urgent' boolean with priority levels
  status: TaskStatus;
  completed_at?: string | null;
  category?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;

  // Legacy support for existing data
  urgent?: boolean; // Will map to priority 'urgent' vs 'normal'
}
