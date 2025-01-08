import { Navigate } from 'react-router-dom';

export const useClientValidation = (id: string | undefined) => {
  const numericId = id ? parseInt(id, 10) : null;
  
  if (!numericId || isNaN(numericId)) {
    console.error('Invalid client ID:', id);
    return { isValid: false, numericId: null };
  }

  return { isValid: true, numericId };
};