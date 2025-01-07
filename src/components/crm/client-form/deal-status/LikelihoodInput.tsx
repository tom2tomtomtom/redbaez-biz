import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface LikelihoodInputProps {
  likelihood: string;
  onLikelihoodChange: (value: string) => void;
}

export const LikelihoodInput = ({ likelihood, onLikelihoodChange }: LikelihoodInputProps) => {
  return (
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
  );
};