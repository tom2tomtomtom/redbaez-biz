export interface MonthlyForecast {
  id: string;
  client_id: number;
  month: string;
  amount: number;
  created_at: string;
  updated_at: string;
  is_actual: boolean;
}

export interface ForecastUpdate {
  month: string;
  amount: number;
  isActual?: boolean;
}