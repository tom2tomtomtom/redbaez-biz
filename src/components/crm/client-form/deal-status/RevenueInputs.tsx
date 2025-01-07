import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface RevenueInputsProps {
  projectRevenue: string;
  revenue: string;
  projectRevenueSignedOff: boolean;
  projectRevenueForecast: boolean;
  annualRevenueSignedOff: string;
  annualRevenueForecast: string;
  onProjectRevenueChange: (value: string) => void;
  onRevenueChange: (value: string) => void;
  onProjectRevenueSignedOffChange: (checked: boolean) => void;
  onProjectRevenueForecastChange: (checked: boolean) => void;
  onAnnualRevenueSignedOffChange: (value: string) => void;
  onAnnualRevenueForecastChange: (value: string) => void;
}

export const RevenueInputs = ({
  projectRevenue,
  revenue,
  projectRevenueSignedOff,
  projectRevenueForecast,
  annualRevenueSignedOff,
  annualRevenueForecast,
  onProjectRevenueChange,
  onRevenueChange,
  onProjectRevenueSignedOffChange,
  onProjectRevenueForecastChange,
  onAnnualRevenueSignedOffChange,
  onAnnualRevenueForecastChange,
}: RevenueInputsProps) => {
  console.log('RevenueInputs render with props:', {
    projectRevenue,
    revenue,
    projectRevenueSignedOff,
    projectRevenueForecast,
    annualRevenueSignedOff,
    annualRevenueForecast
  });

  return (
    <div className="space-y-6">
      {/* Project Revenue Section */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900">Project Revenue</h3>
        <div>
          <Label>Total Amount ($)</Label>
          <Input 
            type="number" 
            placeholder="Enter project revenue" 
            value={projectRevenue}
            onChange={(e) => {
              console.log('Project revenue changed:', e.target.value);
              onProjectRevenueChange(e.target.value);
            }}
            className="transition-all duration-300" 
          />
        </div>
        
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="projectRevenueSignedOff"
              checked={projectRevenueSignedOff}
              onCheckedChange={(checked) => {
                console.log('Project revenue signed off changed:', checked);
                onProjectRevenueSignedOffChange(checked as boolean);
              }}
            />
            <Label htmlFor="projectRevenueSignedOff">Signed Off</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="projectRevenueForecast"
              checked={projectRevenueForecast}
              onCheckedChange={(checked) => {
                console.log('Project revenue forecast changed:', checked);
                onProjectRevenueForecastChange(checked as boolean);
              }}
            />
            <Label htmlFor="projectRevenueForecast">Forecast</Label>
          </div>
        </div>
      </div>

      {/* Annual Revenue Section */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900">Annual Revenue</h3>
        <div>
          <Label>Total Amount ($)</Label>
          <Input 
            type="number" 
            placeholder="Enter annual revenue" 
            value={revenue}
            onChange={(e) => {
              console.log('Annual revenue changed:', e.target.value);
              onRevenueChange(e.target.value);
            }}
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
              onChange={(e) => {
                console.log('Annual revenue signed off changed:', e.target.value);
                onAnnualRevenueSignedOffChange(e.target.value);
              }}
              className="transition-all duration-300" 
            />
          </div>
          
          <div>
            <Label>Forecast Amount ($)</Label>
            <Input 
              type="number" 
              placeholder="Enter forecast amount" 
              value={annualRevenueForecast}
              onChange={(e) => {
                console.log('Annual revenue forecast changed:', e.target.value);
                onAnnualRevenueForecastChange(e.target.value);
              }}
              className="transition-all duration-300" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};