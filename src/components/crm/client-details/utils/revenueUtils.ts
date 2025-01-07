import { MonthlyForecast } from '../types/MonthlyForecast';

export const generateRevenueData = (annualRevenue: number | null) => {
  const currentDate = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i);
    const month = date.toLocaleString('default', { month: 'short' });
    return {
      month,
      value: annualRevenue ? annualRevenue / 12 : 0
    };
  });
};

export const parseMonthlyForecasts = (forecasts: any): MonthlyForecast[] => {
  return Array.isArray(forecasts) 
    ? forecasts.map((forecast: any) => ({
        month: String(forecast.month),
        amount: Number(forecast.amount)
      }))
    : [];
};