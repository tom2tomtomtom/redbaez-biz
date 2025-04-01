
/**
 * Centralized definition of Task-related types to ensure consistency across the application.
 * This unifies the previously inconsistent definitions from:
 * - src/components/crm/priority-actions/hooks/taskTypes.ts
 * - src/hooks/useTaskDeletion.ts
 */

// Define the task type as a proper union type
export type TaskType = 'task' | 'next_step';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  client_id?: number | null;
  client?: { name: string } | null;
  client_name?: string | null;
  due_date?: string | null;
  next_due_date?: string | null;
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
}

// Define the priority item interface that's used across components
export interface PriorityItem {
  type: 'task' | 'next_step';
  data: {
    id: string;
    title: string;
    description?: string | null;
    client_id?: number | null;
    client?: { name: string } | null;
    client_name?: string | null;
    category?: string | null;
    due_date?: string | null;
    next_due_date?: string | null;
    urgent: boolean;
    status?: string;
    notes?: string | null;
    completed_at?: string | null;
  };
}
