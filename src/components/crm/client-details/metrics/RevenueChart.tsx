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
  monthlyForecasts = [], 
  onForecastUpdate,
  isEditing = false 
}: RevenueChartProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  console.log('RevenueChart isEditing:', isEditing);
  console.log('RevenueChart monthlyForecasts:', monthlyForecasts);

  // Combine regular revenue data with forecasts
  const combinedData = revenueData.map(item => {
    const forecast = monthlyForecasts?.find(f => f.month === item.month);
    return {
      month: item.month,
      value: item.value,
      forecast: forecast?.amount || 0
    };
  });

  const handleMouseDown = useCallback((data: any, index: number) => {
    if (!isEditing) return;
    setIsDragging(true);
    setActiveIndex(index);
  }, [isEditing]);

  const handleMouseMove = useCallback((e: any) => {
    if (!isDragging || !isEditing || activeIndex === null || !onForecastUpdate) return;

    const chartData = combinedData[activeIndex];
    if (!chartData) return;

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
  }, [isDragging, isEditing, activeIndex, combinedData, onForecastUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setActiveIndex(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setActiveIndex(null);
  }, []);

  return (
    <div className="h-48">
      <p className="text-sm text-gray-600 mb-2">
        Monthly Revenue & Forecast
        {isEditing && <span className="text-xs ml-2 text-muted-foreground">(Click and drag forecast bars to adjust)</span>}
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={combinedData}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
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
          <Bar 
            dataKey="value" 
            fill="hsl(var(--primary))" 
            name="Revenue" 
          />
          <Bar 
            dataKey="forecast" 
            fill="hsl(var(--primary)/0.5)" 
            name="Forecast"
            cursor={isEditing ? 'ns-resize' : undefined}
            onMouseDown={(data, index) => handleMouseDown(data, index)}
            className={isEditing ? 'cursor-ns-resize' : ''}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};