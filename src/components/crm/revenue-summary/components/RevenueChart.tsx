
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
  console.log('RevenueChart rendering with data:', {
    dataLength: monthlyData?.length || 0,
    firstThreeMonths: monthlyData?.slice(0, 3).map(m => ({
      month: m.month,
      actual: m.actual,
      forecast: m.forecast
    })) || []
  });

  const handleClick = (data: any, index: number, type: 'actual' | 'forecast') => {
    if (onBarClick) {
      onBarClick(data.month, type);
    }
  };

  // Check if we have valid data to work with
  const validData = Array.isArray(monthlyData) && monthlyData.length > 0;
  
  // Check if there's any non-zero revenue data
  const hasRevenueData = validData && monthlyData.some(
    m => (m.actual > 0 || m.forecast > 0)
  );

  console.log('RevenueChart data validation:', {
    validData,
    hasRevenueData
  });

  // If we don't have valid data or all revenue values are zero, show a message
  if (!validData || !hasRevenueData) {
    console.log('RevenueChart showing empty state - no valid revenue data');
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        <p>No revenue data available to display</p>
      </div>
    );
  }

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
