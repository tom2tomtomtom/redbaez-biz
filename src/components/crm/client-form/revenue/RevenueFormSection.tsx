import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface RevenueFormSectionProps {
  projectRevenue: string;
  annualRevenue: string;
  onProjectRevenueChange: (value: string) => void;
  onAnnualRevenueChange: (value: string) => void;
}

export const RevenueFormSection: React.FC<RevenueFormSectionProps> = ({
  projectRevenue,
  annualRevenue,
  onProjectRevenueChange,
  onAnnualRevenueChange,
}) => {
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
            onChange={(e) => onProjectRevenueChange(e.target.value)}
            className="transition-all duration-300" 
          />
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
            onChange={(e) => onAnnualRevenueChange(e.target.value)}
            className="transition-all duration-300" 
          />
        </div>
      </div>
    </div>
  );
};