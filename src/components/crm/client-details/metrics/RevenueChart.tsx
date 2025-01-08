import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RevenueChartProps {
  revenueData: Array<{ 
    month: string; 
    forecast: number;
    actual: number;
  }>;
}

export const RevenueChart = ({
  revenueData,
}: RevenueChartProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">Monthly Revenue</p>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="actual" 
              fill="hsl(var(--primary))" 
              name="Actual Revenue"
            />
            <Bar 
              dataKey="forecast" 
              fill="hsl(var(--primary)/0.5)" 
              name="Forecast Revenue"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};