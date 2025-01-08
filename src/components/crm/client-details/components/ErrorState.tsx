import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const ErrorState = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-red-500 mb-4">Error loading client details</p>
      <Button onClick={() => navigate('/')}>Back to Home</Button>
    </div>
  );
};