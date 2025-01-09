export type ClientEmailRow = {
  id: string
  client_id: number | null
  gmail_id: string | null
  subject: string | null
  snippet: string | null
  thread_id: string | null
  date: string | null
  from_email: string | null
  to_emails: string[] | null
  created_at: string | null
}

export type ClientEmailInsert = Partial<ClientEmailRow>
export type ClientEmailUpdate = Partial<ClientEmailRow>