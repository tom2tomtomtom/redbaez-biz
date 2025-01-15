import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RevenueData {
  month: string;
  actual: number;
  forecast: number;
}

interface RevenueChartProps {
  revenueData: RevenueData[];
}

export const RevenueChart = ({
  revenueData,
}: RevenueChartProps) => {
  console.log('Revenue chart data:', revenueData);
  
  const formatYAxis = (value: number) => {
    return `$${value.toLocaleString()}`;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">Monthly Revenue</p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={revenueData} 
            margin={{ top: 20, right: 30, left: 65, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              angle={-45}
              textAnchor="end"
              height={60}
              tickMargin={20}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              width={80}
            />
            <Tooltip 
              formatter={(value) => [`$${Number(value).toLocaleString()}`, value === 'actual' ? 'Actual Revenue' : 'Forecast Revenue']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px'
              }}
            />
            <Legend 
              verticalAlign="top"
              height={36}
            />
            <Bar 
              dataKey="actual" 
              fill="#4338ca" // Changed to a more visible indigo color
              name="Actual Revenue"
              minPointSize={3}
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="forecast" 
              fill="#60a5fa" // Changed to a lighter blue for forecast
              name="Forecast Revenue"
              minPointSize={3}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};