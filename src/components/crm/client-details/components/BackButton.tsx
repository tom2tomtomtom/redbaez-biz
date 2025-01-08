import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BackButton = () => {
  const navigate = useNavigate();
  
  return (
    <Button
      variant="ghost"
      className="w-fit flex items-center gap-2"
      onClick={() => navigate('/')}
    >
      <ArrowLeft size={16} />
      Back to Home
    </Button>
  );
};