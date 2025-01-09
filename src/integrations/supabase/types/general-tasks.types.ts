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
}

export type GeneralTaskInsert = Partial<GeneralTaskRow>
export type GeneralTaskUpdate = Partial<GeneralTaskRow>