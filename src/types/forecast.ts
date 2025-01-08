export interface MonthlyForecast {
  id: string;
  client_id: number;
  month: Date;
  amount: number;
  created_at: Date;
  updated_at: Date;
}

export interface ForecastUpdate {
  month: Date;
  amount: number;
}