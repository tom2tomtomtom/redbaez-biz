import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useCallback, useRef } from 'react';

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
  const [activeMonth, setActiveMonth] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

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

  const handleMouseDown = useCallback((data: any) => {
    if (!isEditing) return;
    setIsDragging(true);
    setActiveMonth(data.month);
  }, [isEditing]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !isEditing || !activeMonth || !onForecastUpdate || !chartRef.current) return;

    const chartRect = chartRef.current.getBoundingClientRect();
    const mouseY = e.clientY - chartRect.top;
    const chartHeight = chartRect.height - 40; // Adjust for padding
    
    // Convert mouse position to value (invert Y axis)
    const maxValue = Math.max(...combinedData.map(d => Math.max(d.value, d.forecast))) * 1.2;
    const newValue = Math.max(0, maxValue * (1 - mouseY / chartHeight));
    
    // Round to nearest 1000
    const roundedValue = Math.round(newValue / 1000) * 1000;
    
    onForecastUpdate(activeMonth, roundedValue);
  }, [isDragging, isEditing, activeMonth, combinedData, onForecastUpdate]);

  const stopDragging = useCallback(() => {
    setIsDragging(false);
    setActiveMonth(null);
  }, []);

  return (
    <div 
      className="h-48" 
      ref={chartRef}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
    >
      <p className="text-sm text-gray-600 mb-2">
        Monthly Revenue & Forecast
        {isEditing && <span className="text-xs ml-2 text-muted-foreground">(Click and drag forecast bars to adjust)</span>}
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={combinedData}>
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
            onMouseDown={(data) => handleMouseDown(data)}
            className={isEditing ? 'cursor-ns-resize' : ''}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};