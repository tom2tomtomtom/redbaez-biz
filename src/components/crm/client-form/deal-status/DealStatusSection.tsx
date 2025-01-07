import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DealStatusSectionProps {
  status: string;
  likelihood: string;
  projectRevenue: string;
  revenue: string;
  projectRevenueSignedOff: boolean;
  projectRevenueForecast: boolean;
  annualRevenueSignedOff: string;
  annualRevenueForecast: string;
  onStatusChange: (value: string) => void;
  onLikelihoodChange: (value: string) => void;
  onProjectRevenueChange: (value: string) => void;
  onRevenueChange: (value: string) => void;
  onProjectRevenueSignedOffChange: (checked: boolean) => void;
  onProjectRevenueForecastChange: (checked: boolean) => void;
  onAnnualRevenueSignedOffChange: (value: string) => void;
  onAnnualRevenueForecastChange: (value: string) => void;
}

export const DealStatusSection = ({
  status,
  likelihood,
  projectRevenue,
  revenue,
  projectRevenueSignedOff,
  projectRevenueForecast,
  annualRevenueSignedOff,
  annualRevenueForecast,
  onStatusChange,
  onLikelihoodChange,
  onProjectRevenueChange,
  onRevenueChange,
  onProjectRevenueSignedOffChange,
  onProjectRevenueForecastChange,
  onAnnualRevenueSignedOffChange,
  onAnnualRevenueForecastChange,
}: DealStatusSectionProps) => {
  return (
    <>
      <div>
        <Label>Status</Label>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="transition-all duration-300">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="prospect">Prospect</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="negotiation">In Negotiation</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Likelihood (%)</Label>
        <Input 
          type="number" 
          placeholder="Enter %" 
          value={likelihood}
          onChange={(e) => onLikelihoodChange(e.target.value)}
          className="transition-all duration-300" 
        />
      </div>

      <div className="space-y-4">
        <div>
          <Label>Project Revenue ($)</Label>
          <Input 
            type="number" 
            placeholder="Enter project revenue" 
            value={projectRevenue}
            onChange={(e) => onProjectRevenueChange(e.target.value)}
            className="transition-all duration-300" 
          />
        </div>
        
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="projectRevenueSignedOff"
              checked={projectRevenueSignedOff}
              onCheckedChange={onProjectRevenueSignedOffChange}
            />
            <Label htmlFor="projectRevenueSignedOff">Signed Off</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="projectRevenueForecast"
              checked={projectRevenueForecast}
              onCheckedChange={onProjectRevenueForecastChange}
            />
            <Label htmlFor="projectRevenueForecast">Forecast</Label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Annual Revenue ($)</Label>
          <Input 
            type="number" 
            placeholder="Enter annual revenue" 
            value={revenue}
            onChange={(e) => onRevenueChange(e.target.value)}
            className="transition-all duration-300" 
          />
        </div>
        
        <div className="space-y-2">
          <div>
            <Label>Signed Off Amount ($)</Label>
            <Input 
              type="number" 
              placeholder="Enter signed off amount" 
              value={annualRevenueSignedOff}
              onChange={(e) => onAnnualRevenueSignedOffChange(e.target.value)}
              className="transition-all duration-300" 
            />
          </div>
          
          <div>
            <Label>Forecast Amount ($)</Label>
            <Input 
              type="number" 
              placeholder="Enter forecast amount" 
              value={annualRevenueForecast}
              onChange={(e) => onAnnualRevenueForecastChange(e.target.value)}
              className="transition-all duration-300" 
            />
          </div>
        </div>
      </div>
    </>
  );
};