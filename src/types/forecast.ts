export interface MonthlyForecast {
  id: string;
  client_id: number;
  month: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface ForecastUpdate {
  month: string;
  amount: number;
}