import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

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
      <LineChart
        width={800}
        height={300}
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
    </div>
  );
};