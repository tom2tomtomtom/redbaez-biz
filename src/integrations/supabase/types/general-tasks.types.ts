export type GeneralTaskRow = {
  id: string
  title: string
  description: string | null
  category: string
  status: string | null
  next_due_date: string | null
  created_at: string | null
  updated_at: string | null
  urgent: boolean | null
  client_id: number | null
  updated_by: string | null
}

export type GeneralTaskInsert = Omit<GeneralTaskRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type GeneralTaskUpdate = Partial<GeneralTaskInsert>