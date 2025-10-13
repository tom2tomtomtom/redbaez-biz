
import { supabase } from '@/lib/supabaseClient';
import { Task, TaskPriority, TaskStatus } from '@/types/task';

export type PriorityItem = Task;

export interface SupabaseTaskRow {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: TaskStatus | 'incomplete';
  due_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  urgent: boolean;
  client_id: number | null;
  created_by: string | null;
  updated_by: string | null;
  completed_at?: string | null;
  priority?: TaskPriority | null;
  notes?: string | null;
  next_due_date?: string | null;
  clients?: { name: string } | null;
}

export const mapTaskRowToTask = (row: SupabaseTaskRow): Task => {
  const priority = row.priority ?? (row.urgent ? 'urgent' : 'normal');

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    status: (row.status ?? 'incomplete') as TaskStatus,
    due_date: row.due_date,
    next_due_date: row.next_due_date ?? row.due_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
    completed_at: row.completed_at ?? null,
    client_id: row.client_id ?? undefined,
    client: row.clients ?? null,
    client_name: row.clients?.name ?? null,
    created_by: row.created_by ?? null,
    updated_by: row.updated_by ?? null,
    priority,
    urgent: priority === 'urgent' ? true : row.urgent,
    notes: row.notes ?? row.description ?? null
  };
};

export const tasksTable = {
  unified: () => supabase.from('tasks')
};
