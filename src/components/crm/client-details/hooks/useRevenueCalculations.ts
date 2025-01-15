interface RevenueData {
  month: string;
  actual: number;
  forecast: number;
}

export const useRevenueCalculations = (client: any) => {
  if (!client) {
    console.log('No client data provided to useRevenueCalculations');
    return { revenueData: [], totalActualRevenue: 0 };
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const revenueData = months.map((month): RevenueData => {
    const monthLower = month.toLowerCase();
    const actualKey = `actual_${monthLower}`;
    const forecastKey = `forecast_${monthLower}`;
    
    const actualRevenue = client[actualKey] || 0;
    const forecastRevenue = client[forecastKey] || 0;
    
    return {
      month,
      actual: actualRevenue,
      forecast: forecastRevenue
    };
  });

  const totalActualRevenue = revenueData.reduce((sum, data) => sum + data.actual, 0);

  console.log('Revenue data calculated:', revenueData);
  console.log('Total actual revenue:', totalActualRevenue);

  return {
    revenueData,
    totalActualRevenue
  };
};