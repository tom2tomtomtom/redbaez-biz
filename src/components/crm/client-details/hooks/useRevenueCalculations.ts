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
    
    // Ensure we're getting numeric values
    const actualRevenue = Number(client?.[actualKey] || 0);
    const forecastRevenue = Number(client?.[forecastKey] || 0);
    
    console.log(`Month: ${month}, Actual: ${actualRevenue}, Forecast: ${forecastRevenue}`);
    
    return {
      month,
      actual: actualRevenue,
      forecast: forecastRevenue
    };
  });

  const totalActualRevenue = revenueData.reduce((sum, data) => sum + data.actual, 0);

  console.log('Revenue data array:', revenueData);
  console.log('Total actual revenue:', totalActualRevenue);

  return {
    revenueData,
    totalActualRevenue
  };
};