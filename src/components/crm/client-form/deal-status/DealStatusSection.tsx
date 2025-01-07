import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  onStatusChange: (value: string) => void;
  onLikelihoodChange: (value: string) => void;
  onProjectRevenueChange: (value: string) => void;
  onRevenueChange: (value: string) => void;
}

export const DealStatusSection = ({
  status,
  likelihood,
  projectRevenue,
  revenue,
  onStatusChange,
  onLikelihoodChange,
  onProjectRevenueChange,
  onRevenueChange,
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
    </>
  );
};