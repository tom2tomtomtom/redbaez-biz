import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2 } from 'lucide-react';
import { MonthlyForecast } from '../types/MonthlyForecast';

interface RevenueChartProps {
  revenueData: Array<{ month: string; value: number }>;
  monthlyForecasts: MonthlyForecast[];
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
  const [localForecasts, setLocalForecasts] = useState<{ [key: string]: string }>({});
  const [chartData, setChartData] = useState(revenueData);

  useEffect(() => {
    const initialForecasts = monthlyForecasts.reduce((acc, forecast) => {
      acc[forecast.month] = forecast.amount ? forecast.amount.toString() : '';
      return acc;
    }, {} as { [key: string]: string });
    
    setLocalForecasts(initialForecasts);
    updateChartData(monthlyForecasts);
  }, [monthlyForecasts]);

  const updateChartData = (forecasts: MonthlyForecast[]) => {
    const newChartData = revenueData.map(item => ({
      month: item.month,
      value: item.value,
      forecast: forecasts.find(f => f.month === item.month)?.amount ?? 0
    }));
    setChartData(newChartData);
  };

  const handleForecastChange = (month: string, value: string) => {
    console.log('Raw input value:', value);
    console.log('Input value type:', typeof value);
    
    // Update local state immediately for responsive UI
    setLocalForecasts(prev => ({
      ...prev,
      [month]: value
    }));

    // Parse and validate the number
    const numericValue = value === '' ? 0 : parseFloat(value);
    console.log('Parsed number:', numericValue);

    if (!isNaN(numericValue) && onForecastUpdate) {
      onForecastUpdate(month, numericValue);
    }
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const calculateAnnualRevenue = () => {
    return Object.values(localForecasts).reduce((total, value) => {
      const amount = parseFloat(value) || 0;
      return total + amount;
    }, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Monthly Revenue & Forecast</p>
          <p className="text-sm text-gray-600">
            Annual Total: {formatCurrency(calculateAnnualRevenue())}
          </p>
        </div>
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
            {revenueData.map((item) => (
              <div key={item.month} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {item.month}
                </label>
                <Input
                  type="number"
                  value={localForecasts[item.month] || ''}
                  onChange={(e) => handleForecastChange(item.month, e.target.value)}
                  className="w-full"
                  placeholder="Enter amount"
                  min="0"
                  step="any"
                />
                <div className="text-xs text-gray-500">
                  {localForecasts[item.month] ? 
                    formatCurrency(localForecasts[item.month]) : 
                    '$0'}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
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