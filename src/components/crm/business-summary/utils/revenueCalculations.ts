export const calculateRevenueData = (clients: any[]) => {
  const forecastData = [];
  const achievedData = [];
  
  // Group by month
  const monthlyData = clients.reduce((acc: any, client: any) => {
    const date = new Date(client.created_at);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        forecast: 0,
        achieved: 0
      };
    }
    
    // Sum up forecast revenue (annual_revenue * likelihood)
    if (client.annual_revenue && client.likelihood) {
      acc[monthYear].forecast += (client.annual_revenue * (client.likelihood / 100));
    }
    
    // Sum up achieved revenue (for clients with status = 'customer')
    if (client.status === 'customer' && client.annual_revenue) {
      acc[monthYear].achieved += client.annual_revenue;
    }
    
    return acc;
  }, {});
  
  // Convert to array format for charts
  Object.entries(monthlyData).forEach(([month, data]: [string, any]) => {
    forecastData.push({
      month,
      revenue: Math.round(data.forecast)
    });
    
    achievedData.push({
      month,
      revenue: Math.round(data.achieved)
    });
  });
  
  return { forecastData, achievedData };
};