import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useCallback } from 'react';

interface RevenueChartProps {
  revenueData: Array<{ month: string; value: number }>;
  monthlyForecasts?: Array<{ month: string; amount: number }>;
  onForecastUpdate?: (month: string, amount: number) => void;
  isEditing?: boolean;
}

export const RevenueChart = ({ 
  revenueData, 
  monthlyForecasts, 
  onForecastUpdate,
  isEditing = false 
}: RevenueChartProps) => {
  const [isDragging, setIsDragging] = useState(false);

  // Combine regular revenue data with forecasts
  const combinedData = revenueData.map(item => {
    const forecast = monthlyForecasts?.find(f => f.month === item.month);
    return {
      month: item.month,
      value: item.value,
      forecast: forecast?.amount || 0
    };
  });

  const handleMouseMove = useCallback((e: any) => {
    if (!isDragging || !isEditing || !e.activeTooltipIndex || !onForecastUpdate) return;

    const chartData = combinedData[e.activeTooltipIndex];
    if (!chartData) return;

    // Calculate new forecast value based on mouse position
    const svgElement = e.currentTarget;
    const svgRect = svgElement.getBoundingClientRect();
    const mouseY = e.nativeEvent.clientY - svgRect.top;
    const chartHeight = svgRect.height - 40; // Adjust for padding
    
    // Convert mouse position to value (invert Y axis)
    const maxValue = Math.max(...combinedData.map(d => Math.max(d.value, d.forecast))) * 1.2;
    const newValue = Math.max(0, maxValue * (1 - mouseY / chartHeight));
    
    // Round to nearest 1000
    const roundedValue = Math.round(newValue / 1000) * 1000;
    
    onForecastUpdate(chartData.month, roundedValue);
  }, [isDragging, isEditing, combinedData, onForecastUpdate]);

  return (
    <div className="h-48">
      <p className="text-sm text-gray-600 mb-2">
        Monthly Revenue & Forecast
        {isEditing && <span className="text-xs ml-2 text-muted-foreground">(Drag forecast bars to adjust)</span>}
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={combinedData}
          onMouseMove={handleMouseMove}
          onMouseDown={() => isEditing && setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Bar dataKey="value" fill="hsl(var(--primary))" name="Revenue" />
          <Bar 
            dataKey="forecast" 
            fill="hsl(var(--primary)/0.5)" 
            name="Forecast"
            cursor={isEditing ? 'ns-resize' : undefined}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};