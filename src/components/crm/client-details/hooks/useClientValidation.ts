import { useParams, Navigate } from 'react-router-dom';

export const useClientValidation = () => {
  const { id } = useParams();
  const numericId = id ? parseInt(id, 10) : null;

  if (!numericId || isNaN(numericId)) {
    console.error('Invalid client ID:', id);
    return { isValid: false, clientId: null };
  }

  return { isValid: true, clientId: numericId };
};