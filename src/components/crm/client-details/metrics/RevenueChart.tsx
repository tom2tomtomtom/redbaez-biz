import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  revenueData: Array<{ month: string; value: number }>;
  monthlyForecasts?: Array<{ month: string; amount: number }>;
}

export const RevenueChart = ({ revenueData, monthlyForecasts }: RevenueChartProps) => {
  // Combine regular revenue data with forecasts
  const combinedData = revenueData.map(item => {
    const forecast = monthlyForecasts?.find(f => f.month.endsWith(item.month));
    return {
      month: item.month,
      value: item.value,
      forecast: forecast?.amount || 0
    };
  });

  return (
    <div className="h-48">
      <p className="text-sm text-gray-600 mb-2">Monthly Revenue & Forecast</p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={combinedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Bar dataKey="value" fill="hsl(var(--primary))" name="Revenue" />
          <Bar dataKey="forecast" fill="hsl(var(--primary)/0.5)" name="Forecast" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};