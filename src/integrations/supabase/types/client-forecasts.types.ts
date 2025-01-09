export type ClientForecastRow = {
  id: string
  client_id: number | null
  month: string
  amount: number
  created_at: string | null
  updated_at: string | null
}

export type ClientForecastInsert = Partial<ClientForecastRow>
export type ClientForecastUpdate = Partial<ClientForecastRow>