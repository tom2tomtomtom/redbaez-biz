import { MonthlyForecast } from '../types/MonthlyForecast';

export const generateMonthlyForecasts = (client: any): MonthlyForecast[] => [
  { month: 'Jan', amount: client.forecast_jan || 0 },
  { month: 'Feb', amount: client.forecast_feb || 0 },
  { month: 'Mar', amount: client.forecast_mar || 0 },
  { month: 'Apr', amount: client.forecast_apr || 0 },
  { month: 'May', amount: client.forecast_may || 0 },
  { month: 'Jun', amount: client.forecast_jun || 0 },
  { month: 'Jul', amount: client.forecast_jul || 0 },
  { month: 'Aug', amount: client.forecast_aug || 0 },
  { month: 'Sep', amount: client.forecast_sep || 0 },
  { month: 'Oct', amount: client.forecast_oct || 0 },
  { month: 'Nov', amount: client.forecast_nov || 0 },
  { month: 'Dec', amount: client.forecast_dec || 0 },
];

export const generateRevenueData = (annualRevenue: number | null) => {
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(new Date().getFullYear(), new Date().getMonth() + i);
    const month = date.toLocaleString('default', { month: 'short' });
    return {
      month,
      value: annualRevenue ? annualRevenue / 12 : 0
    };
  });
};

export const createForecastFormData = (formData: any, currentForecasts: MonthlyForecast[], client: any) => {
  return {
    ...formData,
    forecast_jan: currentForecasts.find(f => f.month === 'Jan')?.amount || client.forecast_jan || 0,
    forecast_feb: currentForecasts.find(f => f.month === 'Feb')?.amount || client.forecast_feb || 0,
    forecast_mar: currentForecasts.find(f => f.month === 'Mar')?.amount || client.forecast_mar || 0,
    forecast_apr: currentForecasts.find(f => f.month === 'Apr')?.amount || client.forecast_apr || 0,
    forecast_may: currentForecasts.find(f => f.month === 'May')?.amount || client.forecast_may || 0,
    forecast_jun: currentForecasts.find(f => f.month === 'Jun')?.amount || client.forecast_jun || 0,
    forecast_jul: currentForecasts.find(f => f.month === 'Jul')?.amount || client.forecast_jul || 0,
    forecast_aug: currentForecasts.find(f => f.month === 'Aug')?.amount || client.forecast_aug || 0,
    forecast_sep: currentForecasts.find(f => f.month === 'Sep')?.amount || client.forecast_sep || 0,
    forecast_oct: currentForecasts.find(f => f.month === 'Oct')?.amount || client.forecast_oct || 0,
    forecast_nov: currentForecasts.find(f => f.month === 'Nov')?.amount || client.forecast_nov || 0,
    forecast_dec: currentForecasts.find(f => f.month === 'Dec')?.amount || client.forecast_dec || 0,
  };
};