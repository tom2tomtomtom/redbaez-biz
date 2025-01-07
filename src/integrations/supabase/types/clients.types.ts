export type ClientRow = {
  annual_revenue: number | null
  company_size: string | null
  contact_email: string | null
  contact_name: string | null
  contact_phone: string | null
  created_at: string
  id: number
  industry: string | null
  likelihood: number | null
  missing_fields: string[] | null
  name: string
  notes: string | null
  status: string | null
  type: string
  website: string | null
  project_revenue: number | null
  background: string | null
  next_due_date: string | null
}

export type ClientInsert = {
  annual_revenue?: number | null
  company_size?: string | null
  contact_email?: string | null
  contact_name?: string | null
  contact_phone?: string | null
  created_at?: string
  id?: number
  industry?: string | null
  likelihood?: number | null
  missing_fields?: string[] | null
  name: string
  notes?: string | null
  status?: string | null
  type: string
  website?: string | null
  project_revenue?: number | null
  background?: string | null
  next_due_date?: string | null
}

export type ClientUpdate = {
  annual_revenue?: number | null
  company_size?: string | null
  contact_email?: string | null
  contact_name?: string | null
  contact_phone?: string | null
  created_at?: string
  id?: number
  industry?: string | null
  likelihood?: number | null
  missing_fields?: string[] | null
  name?: string
  notes?: string | null
  status?: string | null
  type?: string
  website?: string | null
  project_revenue?: number | null
  background?: string | null
  next_due_date?: string | null
}