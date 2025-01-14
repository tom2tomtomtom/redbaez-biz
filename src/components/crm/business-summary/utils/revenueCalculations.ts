import { Tables } from '@/integrations/supabase/types';

type Client = Tables<'clients'>;

export const calculateRevenueData = (clients: Client[]) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const forecastData = months.map((month, index) => ({
    name: month,
    value: clients.reduce((sum, client) => {
      const monthKey = `forecast_${month.toLowerCase()}` as keyof Client;
      return sum + (Number(client[monthKey]) || 0);
    }, 0),
  }));

  const achievedData = months.map((month, index) => ({
    name: month,
    value: clients.reduce((sum, client) => {
      const monthKey = `actual_${month.toLowerCase()}` as keyof Client;
      return sum + (Number(client[monthKey]) || 0);
    }, 0),
  }));

  return { forecastData, achievedData };
};