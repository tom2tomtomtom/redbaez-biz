import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RevenueState } from '../hooks/useRevenueState';

interface RevenueFormSectionProps extends RevenueState {
  onProjectRevenueChange: (value: string) => void;
  onAnnualRevenueChange: (value: string) => void;
  onProjectRevenueSignedOffChange: (checked: boolean) => void;
  onProjectRevenueForecastChange: (checked: boolean) => void;
  onAnnualRevenueSignedOffChange: (value: string) => void;
  onAnnualRevenueForecastChange: (value: string) => void;
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
}) => {
  console.log('RevenueFormSection render with props:', {
    projectRevenue,
    annualRevenue,
    projectRevenueSignedOff,
    projectRevenueForecast,
    annualRevenueSignedOff,
    annualRevenueForecast,
  });

  const handleNumericInput = (value: string, onChange: (value: string) => void) => {
    if (value === '' || !isNaN(Number(value))) {
      onChange(value);
    }
  };

  const handleCheckboxChange = (checked: boolean, onChange: (checked: boolean) => void) => {
    console.log('Checkbox changed:', checked);
    onChange(checked);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900">Project Revenue</h3>
        <div>
          <Label>Total Amount ($)</Label>
          <Input 
            type="number" 
            placeholder="Enter project revenue" 
            value={projectRevenue}
            onChange={(e) => handleNumericInput(e.target.value, onProjectRevenueChange)}
            className="transition-all duration-300" 
          />
        </div>
        
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="projectRevenueSignedOff"
              checked={projectRevenueSignedOff}
              onCheckedChange={(checked) => 
                handleCheckboxChange(checked as boolean, onProjectRevenueSignedOffChange)
              }
              className="data-[state=checked]:bg-green-500"
            />
            <Label htmlFor="projectRevenueSignedOff">Signed Off</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="projectRevenueForecast"
              checked={projectRevenueForecast}
              onCheckedChange={(checked) => 
                handleCheckboxChange(checked as boolean, onProjectRevenueForecastChange)
              }
              className="data-[state=checked]:bg-blue-500"
            />
            <Label htmlFor="projectRevenueForecast">Forecast</Label>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900">Annual Revenue</h3>
        <div>
          <Label>Total Amount ($)</Label>
          <Input 
            type="number" 
            placeholder="Enter annual revenue" 
            value={annualRevenue}
            onChange={(e) => handleNumericInput(e.target.value, onAnnualRevenueChange)}
            className="transition-all duration-300" 
          />
        </div>
        
        <div className="space-y-4">
          <div>
            <Label>Signed Off Amount ($)</Label>
            <Input 
              type="number" 
              placeholder="Enter signed off amount" 
              value={annualRevenueSignedOff}
              onChange={(e) => handleNumericInput(e.target.value, onAnnualRevenueSignedOffChange)}
              className="transition-all duration-300" 
            />
          </div>
          
          <div>
            <Label>Forecast Amount ($)</Label>
            <Input 
              type="number" 
              placeholder="Enter forecast amount" 
              value={annualRevenueForecast}
              onChange={(e) => handleNumericInput(e.target.value, onAnnualRevenueForecastChange)}
              className="transition-all duration-300" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};