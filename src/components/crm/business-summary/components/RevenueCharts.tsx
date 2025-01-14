import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartsProps {
  forecastData: Array<{ month: string; amount: number }>;
  achievedData: Array<{ month: string; amount: number }>;
}

export const RevenueCharts = ({ forecastData, achievedData }: RevenueChartsProps) => {
  const combinedData = forecastData.map((item, index) => ({
    month: item.month,
    forecast: item.amount,
    achieved: achievedData[index]?.amount || 0
  }));

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={combinedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="forecast" fill="hsl(var(--primary)/0.5)" name="Forecast Revenue" />
          <Bar dataKey="achieved" fill="#1A1F2C" name="Achieved Revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};