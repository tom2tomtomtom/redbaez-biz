import { Task } from '@/hooks/useTaskDeletion';

export type GeneralTaskRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: 'completed' | 'incomplete';
  next_due_date: string | null;
  due_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  urgent: boolean;
  client_id: number | null;
  updated_by: string | null;
  created_by: string | null;
  completed_at: string | null;
  notes: string | null;
  client_name?: string | null;
  type?: 'task' | 'next_step'; // Add type property for compatibility
}

export type GeneralTaskInsert = Omit<GeneralTaskRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

export type GeneralTaskUpdate = Partial<GeneralTaskInsert>

// Conversion utilities for backward compatibility
export const taskToGeneralTaskRow = (task: Task): GeneralTaskRow => {
  return {
    id: task.id,
    title: task.title || '',
    description: task.description || null,
    category: task.category || 'general',
    status: task.status,
    next_due_date: task.due_date || null,
    due_date: task.due_date || null,
    created_at: task.created_at || null,
    updated_at: task.updated_at || null,
    urgent: task.urgent,
    client_id: task.client_id || null,
    updated_by: task.updated_by || null,
    created_by: task.created_by || null,
    completed_at: task.status === 'completed' ? task.updated_at : null,
    notes: task.description || null,
    client_name: task.client?.name || null,
    type: task.type || 'task'
  };
};

// Convert from GeneralTaskRow to Task for backward compatibility
export const generalTaskRowToTask = (row: GeneralTaskRow): Task => {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    status: row.status,
    due_date: row.due_date || row.next_due_date,
    urgent: row.urgent,
    client_id: row.client_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_by: row.created_by,
    updated_by: row.updated_by,
    notes: row.notes || row.description,
    next_due_date: row.next_due_date,
    completed_at: row.completed_at,
    client_name: row.client_name,
    client: row.client_name ? { name: row.client_name } : null,
    type: row.type || 'task'
  };
};

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  client_id?: number | null;
  client?: { name: string } | null;
  due_date?: string | null;
  urgent: boolean;
  status: "incomplete" | "completed";
  completed_at?: string | null;
  category?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  type?: string;
  source_table?: string;
}
