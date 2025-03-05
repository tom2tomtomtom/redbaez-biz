
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
  onBarClick?: (month: string, type: 'actual' | 'forecast') => void;
}

export const RevenueChart = ({ monthlyData, onBarClick }: RevenueChartProps) => {
  const handleClick = (data: any, index: number, type: 'actual' | 'forecast') => {
    if (onBarClick) {
      onBarClick(data.month, type);
    }
  };

  return (
    <div className="h-[300px]">
      <div className="mb-2 text-sm text-gray-500">
        Click on any column to edit the revenue for that month
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="actual" 
            fill="#1A1F2C" 
            name="Actual Revenue" 
            onClick={(data, index) => handleClick(data, index, 'actual')}
            style={{ cursor: 'pointer' }}
          />
          <Bar 
            dataKey="forecast" 
            fill="hsl(var(--primary)/0.5)" 
            name="Forecast Revenue" 
            onClick={(data, index) => handleClick(data, index, 'forecast')}
            style={{ cursor: 'pointer' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
