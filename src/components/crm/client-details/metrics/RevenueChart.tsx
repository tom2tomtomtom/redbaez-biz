import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect, useRef } from 'react';

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
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Combine regular revenue data with forecasts
  const combinedData = revenueData.map(item => {
    const forecast = monthlyForecasts?.find(f => f.month === item.month);
    return {
      month: item.month,
      value: item.value,
      forecast: forecast?.amount || 0
    };
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !isEditing || !activeMonth || !onForecastUpdate || !chartContainerRef.current) return;

      const chartRect = chartContainerRef.current.getBoundingClientRect();
      const mouseY = e.clientY - chartRect.top;
      const chartHeight = chartRect.height;
      
      // Calculate the relative position (0 to 1)
      const relativePosition = Math.max(0, Math.min(1, 1 - (mouseY / chartHeight)));
      
      // Get the maximum value for scaling
      const maxValue = Math.max(...combinedData.map(d => Math.max(d.value, d.forecast))) * 1.2;
      
      // Convert relative position to value
      let newValue = maxValue * relativePosition;
      
      // Round to nearest 1000
      newValue = Math.max(0, Math.round(newValue / 1000) * 1000);
      
      onForecastUpdate(activeMonth, newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setActiveMonth(null);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isEditing, activeMonth, onForecastUpdate, combinedData]);

  const handleBarMouseDown = (data: any) => {
    if (!isEditing) return;
    setIsDragging(true);
    setActiveMonth(data.month);
  };

  return (
    <div 
      ref={chartContainerRef}
      className="h-48 relative"
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
            onMouseDown={(data) => handleBarMouseDown(data)}
            className={isEditing ? 'cursor-ns-resize' : ''}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};