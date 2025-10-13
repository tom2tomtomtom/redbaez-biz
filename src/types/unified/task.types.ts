export { Task, TaskPriority, TaskStatus } from '../task';

import { Task, TaskPriority, TaskStatus } from '../task';

export type TaskCategory = 'Marketing' | 'Business Admin' | 'Product Development' | 'Partnerships' | string;

export interface UnifiedTask extends Task {
  source_table?: 'tasks' | 'general_tasks' | 'client_next_steps';
}

export type TaskRow = Omit<UnifiedTask, 'client' | 'client_name' | 'notes' | 'next_due_date' | 'source_table'>;

export type TaskInsert = Omit<TaskRow, 'id' | 'created_at' | 'updated_at' | 'completed_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
};

export type TaskUpdate = Partial<TaskInsert>;

export const convertToUnifiedTask = (source: any): UnifiedTask => {
  const dueDate = source.due_date || source.next_due_date || null;
  const priority: TaskPriority = source.priority
    ? source.priority
    : source.urgent
      ? 'urgent'
      : 'normal';

  return {
    id: source.id,
    title: source.title || '',
    description: source.description || source.notes || null,
    category: source.category || null,
    status: (source.status || 'incomplete') as TaskStatus,
    urgent: Boolean(source.urgent || priority === 'urgent'),
    priority,
    due_date: dueDate,
    next_due_date: dueDate,
    created_at: source.created_at || null,
    updated_at: source.updated_at || null,
    completed_at: source.completed_at || null,
    client_id: source.client_id || null,
    client: source.client || (source.client_name ? { name: source.client_name } : null),
    client_name: source.client_name || source.client?.name || null,
    created_by: source.created_by || null,
    updated_by: source.updated_by || null,
    notes: source.notes || source.description || null,
    source_table: source.source_table || 'tasks'
  };
};
