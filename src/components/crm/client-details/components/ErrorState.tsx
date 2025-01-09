import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ErrorStateProps {
  message?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message = 'Error loading client details' }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-red-500 mb-4">{message}</p>
      <Button onClick={() => navigate('/')}>Back to Home</Button>
    </div>
  );
};