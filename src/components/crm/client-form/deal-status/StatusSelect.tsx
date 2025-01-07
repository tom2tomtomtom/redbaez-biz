import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StatusSelectProps {
  status: string;
  onStatusChange: (value: string) => void;
}

export const StatusSelect = ({ status, onStatusChange }: StatusSelectProps) => {
  return (
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
  );
};