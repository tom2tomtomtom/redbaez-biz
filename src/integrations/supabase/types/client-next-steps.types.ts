export interface ClientNextStepRow {
  id: string;
  client_id: number | null;
  notes: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  urgent: boolean | null;
}

export interface ClientNextStepInsert {
  id?: string;
  client_id?: number | null;
  notes?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  urgent?: boolean | null;
}

export interface ClientNextStepUpdate {
  id?: string;
  client_id?: number | null;
  notes?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  urgent?: boolean | null;
}