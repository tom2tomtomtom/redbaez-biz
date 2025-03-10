
export type TaskRow = {
  id: string
  title: string
  description: string | null
  category: string | null
  status: 'completed' | 'incomplete'
  due_date: string | null
  created_at: string | null
  updated_at: string | null
  urgent: boolean
  client_id: number | null
  created_by: string | null
  updated_by: string | null
}

export type TaskInsert = Omit<TaskRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type TaskUpdate = Partial<TaskInsert>
