interface RevenueData {
  month: string;
  actual: number;
  forecast: number;
}

export const useRevenueCalculations = (client: any) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const revenueData = months.map((month): RevenueData => {
    const monthLower = month.toLowerCase();
    const actualKey = `actual_${monthLower}`;
    const forecastKey = `forecast_${monthLower}`;
    
    // Get actual and forecast values, defaulting to 0 if undefined
    const actualRevenue = client?.[actualKey] || 0;
    const forecastRevenue = client?.[forecastKey] || 0;
    
    return {
      month,
      actual: Number(actualRevenue),
      forecast: Number(forecastRevenue)
    };
  });

  const totalActualRevenue = Object.entries(client || {})
    .filter(([key]) => key.startsWith('actual_'))
    .reduce((sum, [_, value]) => sum + (Number(value) || 0), 0);

  console.log('Calculated revenue data:', { revenueData, totalActualRevenue });

  return {
    revenueData,
    totalActualRevenue
  };
};