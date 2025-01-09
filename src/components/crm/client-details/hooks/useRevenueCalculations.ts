interface RevenueData {
  month: string;
  actual: number;
  forecast: number;
}

export const useRevenueCalculations = (client: any) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const revenueData = months.map((month) => {
    const monthLower = month.toLowerCase();
    return {
      month,
      actual: client[`actual_${monthLower}`] || 0,
      forecast: client[`forecast_${monthLower}`] || 0
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