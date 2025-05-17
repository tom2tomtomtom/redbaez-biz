import logger from '@/utils/logger';
import { useParams } from 'react-router-dom';

export const useClientValidation = () => {
  const { id } = useParams();
  const numericId = id ? parseInt(id, 10) : null;

  if (!numericId || isNaN(numericId)) {
    logger.error('Invalid client ID:', id);
    return { isValid: false, clientId: null };
  }

  return { isValid: true, clientId: numericId };
};