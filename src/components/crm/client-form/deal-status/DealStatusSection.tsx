import { StatusSelect } from './StatusSelect';
import { LikelihoodInput } from './LikelihoodInput';

interface DealStatusSectionProps {
  status: string;
  likelihood: string;
  onStatusChange: (value: string) => void;
  onLikelihoodChange: (value: string) => void;
}

export const DealStatusSection = ({
  status,
  likelihood,
  onStatusChange,
  onLikelihoodChange,
}: DealStatusSectionProps) => {
  return (
    <>
      <StatusSelect status={status} onStatusChange={onStatusChange} />
      <LikelihoodInput likelihood={likelihood} onLikelihoodChange={onLikelihoodChange} />
    </>
  );
};