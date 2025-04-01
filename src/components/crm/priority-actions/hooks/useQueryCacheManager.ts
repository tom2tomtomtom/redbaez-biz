
/**
 * @deprecated Use @/hooks/useQueryManager instead
 * This file is maintained for backward compatibility but will be removed in a future update.
 */
import { useQueryManager } from '@/hooks/useQueryManager';

/**
 * Legacy query cache manager for backward compatibility
 */
export const useQueryCacheManager = () => {
  const queryManager = useQueryManager();
  
  return {
    invalidateQueries: queryManager.invalidateAllQueries
  };
};
