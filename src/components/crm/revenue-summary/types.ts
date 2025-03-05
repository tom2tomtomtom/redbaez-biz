
export interface ClientDetail {
  name: string;
  amount: number;
  type: 'actual' | 'forecast';
}

export interface MonthlyData {
  month: string;
  actual: number;
  forecast: number;
  actualClients: ClientDetail[];
  forecastClients: ClientDetail[];
}

export interface AnnualTotals {
  confirmed: number;
  forecast: number;
}

export interface RevenueData {
  monthlyData: MonthlyData[];
  annualTotals: AnnualTotals;
  clients?: any[]; // Adding the clients property that was missing
}
