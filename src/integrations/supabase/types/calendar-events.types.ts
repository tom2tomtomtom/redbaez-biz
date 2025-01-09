export type CalendarEventRow = {
  id: string
  client_id: number | null
  google_event_id: string | null
  summary: string | null
  description: string | null
  start_time: string | null
  end_time: string | null
  created_at: string | null
  updated_at: string | null
}

export type CalendarEventInsert = Partial<CalendarEventRow>
export type CalendarEventUpdate = Partial<CalendarEventRow>