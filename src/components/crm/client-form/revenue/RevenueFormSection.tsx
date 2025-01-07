import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { MonthlyForecast } from '../../client-details/types/MonthlyForecast';

interface RevenueFormSectionProps {
  projectRevenue: string;
  annualRevenue: string;
  projectRevenueSignedOff: boolean;
  projectRevenueForecast: boolean;
  annualRevenueSignedOff: number;
  annualRevenueForecast: number;
  onProjectRevenueChange: (value: string) => void;
  onAnnualRevenueChange: (value: string) => void;
  onProjectRevenueSignedOffChange: (value: boolean) => void;
  onProjectRevenueForecastChange: (value: boolean) => void;
  onAnnualRevenueSignedOffChange: (value: number) => void;
  onAnnualRevenueForecastChange: (value: number) => void;
  onMonthlyForecastsChange?: (forecasts: MonthlyForecast[]) => void;
}

export const RevenueFormSection: React.FC<RevenueFormSectionProps> = ({
  projectRevenue,
  annualRevenue,
  projectRevenueSignedOff,
  projectRevenueForecast,
  annualRevenueSignedOff,
  annualRevenueForecast,
  onProjectRevenueChange,
  onAnnualRevenueChange,
  onProjectRevenueSignedOffChange,
  onProjectRevenueForecastChange,
  onAnnualRevenueSignedOffChange,
  onAnnualRevenueForecastChange,
  onMonthlyForecastsChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Project Revenue</h3>
        <div>
          <Label>Amount ($)</Label>
          <Input 
            type="number" 
            placeholder="Enter project revenue" 
            value={projectRevenue}
            onChange={(e) => onProjectRevenueChange(e.target.value)}
            className="transition-all duration-300" 
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Signed Off</Label>
          <Switch
            checked={projectRevenueSignedOff}
            onCheckedChange={onProjectRevenueSignedOffChange}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Forecast</Label>
          <Switch
            checked={projectRevenueForecast}
            onCheckedChange={onProjectRevenueForecastChange}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Annual Revenue</h3>
        <div>
          <Label>Amount ($)</Label>
          <Input 
            type="number" 
            placeholder="Enter annual revenue" 
            value={annualRevenue}
            onChange={(e) => onAnnualRevenueChange(e.target.value)}
            className="transition-all duration-300" 
          />
        </div>
        <div>
          <Label>Signed Off Amount ($)</Label>
          <Input 
            type="number" 
            placeholder="Enter signed off amount" 
            value={annualRevenueSignedOff}
            onChange={(e) => onAnnualRevenueSignedOffChange(Number(e.target.value))}
            className="transition-all duration-300" 
          />
        </div>
        <div>
          <Label>Forecast Amount ($)</Label>
          <Input 
            type="number" 
            placeholder="Enter forecast amount" 
            value={annualRevenueForecast}
            onChange={(e) => onAnnualRevenueForecastChange(Number(e.target.value))}
            className="transition-all duration-300" 
          />
        </div>
      </div>
    </div>
  );
};