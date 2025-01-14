import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueChartsProps {
  forecastData: Array<{ month: string; amount: number }>;
  achievedData: Array<{ month: string; amount: number }>;
}

export const RevenueCharts = ({ forecastData, achievedData }: RevenueChartsProps) => {
  const combinedData = forecastData.map((item, index) => ({
    month: item.month,
    forecast: item.amount,
    achieved: achievedData[index]?.amount || 0,
  }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={combinedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="forecast" stroke="#8884d8" name="Forecast Revenue" />
          <Line type="monotone" dataKey="achieved" stroke="#82ca9d" name="Achieved Revenue" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};