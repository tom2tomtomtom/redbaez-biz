import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { CustomTooltip } from './CustomTooltip';
import { MonthlyData } from '../types';

interface RevenueChartProps {
  monthlyData: MonthlyData[];
}

export const RevenueChart = ({ monthlyData }: RevenueChartProps) => {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="actual" fill="#1A1F2C" name="Actual Revenue" />
          <Bar dataKey="forecast" fill="hsl(var(--primary)/0.5)" name="Forecast Revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};