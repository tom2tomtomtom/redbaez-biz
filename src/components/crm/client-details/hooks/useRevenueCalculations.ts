interface RevenueData {
  month: string;
  actual: number;
  forecast: number;
}

export const useRevenueCalculations = (client: any) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const revenueData = months.map((month) => {
    const monthLower = month.toLowerCase();
    const actualRevenue = client[`actual_${monthLower}`] || 0;
    
    // If there's actual revenue, set forecast to 0
    const forecastRevenue = actualRevenue > 0 ? 0 : (client[`forecast_${monthLower}`] || 0);
    
    return {
      month,
      actual: actualRevenue,
      forecast: forecastRevenue
    };
  });

  const totalActualRevenue = Object.entries(client)
    .filter(([key]) => key.startsWith('actual_'))
    .reduce((sum, [_, value]) => sum + (Number(value) || 0), 0);

  return {
    revenueData,
    totalActualRevenue
  };
};