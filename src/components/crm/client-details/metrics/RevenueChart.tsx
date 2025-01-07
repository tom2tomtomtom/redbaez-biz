import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2 } from 'lucide-react';

interface RevenueChartProps {
  revenueData: Array<{ month: string; value: number }>;
  monthlyForecasts: Array<{ month: string; amount: number }>;
  isEditing?: boolean;
  onForecastUpdate?: (month: string, amount: number) => void;
}

export const RevenueChart = ({
  revenueData,
  monthlyForecasts,
  isEditing = false,
  onForecastUpdate
}: RevenueChartProps) => {
  const [showTable, setShowTable] = useState(false);

  // Combine regular revenue data with forecasts
  const combinedData = revenueData.map(item => {
    const forecast = monthlyForecasts.find(f => f.month === item.month);
    return {
      month: item.month,
      value: item.value,
      forecast: forecast ? forecast.amount : item.value
    };
  });

  const handleForecastChange = (month: string, value: string) => {
    if (!onForecastUpdate) return;
    const numericValue = value === '' ? 0 : Number(value);
    if (!isNaN(numericValue)) {
      onForecastUpdate(month, numericValue);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">Monthly Revenue & Forecast</p>
        {isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTable(!showTable)}
            className="flex items-center gap-2"
          >
            <Edit2 className="h-4 w-4" />
            {showTable ? 'Show Chart' : 'Edit Forecasts'}
          </Button>
        )}
      </div>

      {showTable && isEditing ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50">
            {combinedData.map((item, index) => (
              <div key={item.month} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {item.month}
                </label>
                <Input
                  type="number"
                  value={item.forecast}
                  onChange={(e) => handleForecastChange(item.month, e.target.value)}
                  className="w-full"
                  placeholder="Enter forecast"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={combinedData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="value" 
                fill="hsl(var(--primary))" 
                name="Actual"
              />
              <Bar 
                dataKey="forecast" 
                fill="hsl(var(--primary)/0.5)" 
                name="Forecast"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};