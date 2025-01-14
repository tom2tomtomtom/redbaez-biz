interface Client {
  forecast_jan?: number;
  forecast_feb?: number;
  forecast_mar?: number;
  forecast_apr?: number;
  forecast_may?: number;
  forecast_jun?: number;
  forecast_jul?: number;
  forecast_aug?: number;
  forecast_sep?: number;
  forecast_oct?: number;
  forecast_nov?: number;
  forecast_dec?: number;
  actual_jan?: number;
  actual_feb?: number;
  actual_mar?: number;
  actual_apr?: number;
  actual_may?: number;
  actual_jun?: number;
  actual_jul?: number;
  actual_aug?: number;
  actual_sep?: number;
  actual_oct?: number;
  actual_nov?: number;
  actual_dec?: number;
}

export const calculateRevenueData = (clients: Client[]) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const forecastData = months.map(month => {
    const monthLower = month.toLowerCase();
    const total = clients.reduce((sum, client) => {
      return sum + (client[`forecast_${monthLower}` as keyof Client] as number || 0);
    }, 0);
    return { month, amount: total };
  });

  const achievedData = months.map(month => {
    const monthLower = month.toLowerCase();
    const total = clients.reduce((sum, client) => {
      return sum + (client[`actual_${monthLower}` as keyof Client] as number || 0);
    }, 0);
    return { month, amount: total };
  });

  return { forecastData, achievedData };
};