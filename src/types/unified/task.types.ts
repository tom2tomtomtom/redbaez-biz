// Define a single source of truth for task types
export type TaskStatus = 'completed' | 'incomplete';
export type TaskType = 'task' | 'next_step' | 'idea';
export type TaskCategory = 'Marketing' | 'Business Admin' | 'Product Development' | 'Partnerships' | string;

export interface Task {
  // Core properties
  id: string;
  title: string;
  description: string | null;
  category: TaskCategory | null;
  status: TaskStatus;
  urgent: boolean;
  
  // Dates
  due_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  completed_at: string | null;
  
  // Relations
  client_id: number | null;
  client?: { name: string } | null;
  client_name?: string | null;
  
  // Metadata
  created_by: string | null;
  updated_by: string | null;
  type: TaskType;
  source_table?: 'tasks' | 'general_tasks' | 'client_next_steps';
  
  // Backward compatibility
  notes?: string | null;
  next_due_date?: string | null;
}

// Database-specific types
export type TaskRow = Omit<Task, 'client' | 'client_name' | 'notes' | 'next_due_date' | 'source_table'>;

export type TaskInsert = Omit<TaskRow, 'id' | 'created_at' | 'updated_at' | 'completed_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
};

export type TaskUpdate = Partial<TaskInsert>;

// Conversion utilities
export const convertToUnifiedTask = (source: any): Task => {
  return {
    id: source.id,
    title: source.title || '',
    description: source.description || source.notes || null,
    category: source.category || null,
    status: source.status || 'incomplete',
    urgent: Boolean(source.urgent),
    due_date: source.due_date || source.next_due_date || null,
    created_at: source.created_at || null,
    updated_at: source.updated_at || null,
    completed_at: source.completed_at || null,
    client_id: source.client_id || null,
    client: source.client || (source.client_name ? { name: source.client_name } : null),
    client_name: source.client_name || source.client?.name || null,
    created_by: source.created_by || null,
    updated_by: source.updated_by || null,
    type: source.type || 'task',
    source_table: source.source_table || 'tasks',
    notes: source.notes || source.description || null,
    next_due_date: source.next_due_date || source.due_date || null
  };
};
