import logger from '@/utils/logger';

interface RevenueData {
  month: string;
  actual: number;
  forecast: number;
}

export const useRevenueCalculations = (client: any) => {
  if (!client) {
    logger.info('No client data provided to useRevenueCalculations');
    return { revenueData: [], totalActualRevenue: 0, totalForecastRevenue: 0 };
  }

  logger.info('Processing client data for revenue calculations:', client);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const revenueData = months.map((month): RevenueData => {
    const monthLower = month.toLowerCase();
    const actualKey = `actual_${monthLower}`;
    const forecastKey = `forecast_${monthLower}`;
    
    // Parse values and ensure they're numeric
    const actualRevenue = client[actualKey] !== null && client[actualKey] !== undefined 
      ? Number(client[actualKey]) : 0;
    const forecastRevenue = client[forecastKey] !== null && client[forecastKey] !== undefined 
      ? Number(client[forecastKey]) : 0;
    
    return {
      month,
      actual: actualRevenue,
      forecast: forecastRevenue
    };
  });

  // Calculate total revenues
  const totalActualRevenue = revenueData.reduce((sum, data) => sum + data.actual, 0);
  const totalForecastRevenue = revenueData.reduce((sum, data) => sum + data.forecast, 0);

  logger.info('Revenue data calculated:', {
    revenueData,
    totalActualRevenue,
    totalForecastRevenue
  });

  return {
    revenueData,
    totalActualRevenue,
    totalForecastRevenue
  };
};
