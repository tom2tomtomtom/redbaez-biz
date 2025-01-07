import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

interface NextStepsSectionProps {
  nextSteps: string;
  nextDueDate: string;
  onNextStepsChange: (steps: string) => void;
  onNextDueDateChange: (date: string) => void;
}

export const NextStepsSection = ({
  nextSteps,
  nextDueDate,
  onNextStepsChange,
  onNextDueDateChange,
}: NextStepsSectionProps) => {
  return (
    <>
      <div className="col-span-2">
        <Label>Next Steps</Label>
        <textarea 
          className="w-full h-24 p-3 rounded-lg border border-gray-200 transition-all duration-300 focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Enter next steps..."
          value={nextSteps}
          onChange={(e) => onNextStepsChange(e.target.value)}
        />
      </div>

      <div className="col-span-2">
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
          <Label className="text-primary font-medium">Next Step Due Date</Label>
          <div className="relative mt-2">
            <Input
              type="date"
              value={nextDueDate}
              onChange={(e) => onNextDueDateChange(e.target.value)}
              className="pr-10 transition-all duration-300"
            />
            <Calendar className="absolute right-3 top-2.5 text-primary" size={16} />
          </div>
        </div>
      </div>
    </>
  );
};