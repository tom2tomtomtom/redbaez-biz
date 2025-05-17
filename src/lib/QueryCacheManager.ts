
/**
 * Centralized query cache manager for consistent cache invalidation across the application.
 * This replaces the previous scattered invalidation code in multiple components.
 */
import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import logger from '@/utils/logger';

export class QueryCacheManager {
  private static instance: QueryCacheManager;
  private queryClient: QueryClient | null = null;

  private constructor() {}

  /**
   * Get the singleton instance of QueryCacheManager
   */
  public static getInstance(): QueryCacheManager {
    if (!QueryCacheManager.instance) {
      QueryCacheManager.instance = new QueryCacheManager();
    }
    return QueryCacheManager.instance;
  }

  /**
   * Set the QueryClient instance to use
   */
  public setQueryClient(queryClient: QueryClient): void {
    this.queryClient = queryClient;
  }

  /**
   * Invalidate and refetch all task-related queries
   */
  public async invalidateTaskQueries(clientId?: number | null): Promise<boolean> {
    if (!this.queryClient) {
      logger.error('QueryCacheManager: No QueryClient set');
      return false;
    }

    try {
      logger.info(`[CACHE] Invalidating task queries at ${new Date().toISOString()}`);
      
      // Cancel any ongoing queries to prevent race conditions
      this.queryClient.cancelQueries();
      
      // Remove cached data to force clean refetches
      this.queryClient.removeQueries({ queryKey: queryKeys.tasks.unified() });
      this.queryClient.removeQueries({ queryKey: ['unified-tasks'] });
      this.queryClient.removeQueries({ queryKey: ['tasks'] });
      
      // Invalidate all task-related queries
      await Promise.all([
        this.queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all() }),
        this.queryClient.invalidateQueries({ queryKey: queryKeys.tasks.list() }),
        this.queryClient.invalidateQueries({ queryKey: queryKeys.tasks.clientItems(null) }),
        this.queryClient.invalidateQueries({ queryKey: ['tasks'] }),
      ]);
      
      // If client ID provided, refresh client-specific data
      if (clientId) {
        logger.info(`[CACHE] Refreshing client ${clientId} data`);
        
        await Promise.all([
          this.queryClient.refetchQueries({ 
            queryKey: queryKeys.clients.detail(clientId) 
          }),
          
          this.queryClient.refetchQueries({ 
            queryKey: queryKeys.tasks.clientItems(clientId) 
          })
        ]);
      }
      
      logger.info('[CACHE] Task query invalidation complete');
      return true;
    } catch (error) {
      logger.error('[CACHE] Error during task query invalidation:', error);
      return false;
    }
  }

  /**
   * Invalidate and refetch all client-related queries
   */
  public async invalidateClientQueries(clientId?: number): Promise<boolean> {
    if (!this.queryClient) {
      logger.error('QueryCacheManager: No QueryClient set');
      return false;
    }

    try {
      logger.info(`[CACHE] Invalidating client queries at ${new Date().toISOString()}`);
      
      if (clientId) {
        // Invalidate specific client
        await this.queryClient.invalidateQueries({ 
          queryKey: queryKeys.clients.detail(clientId) 
        });
      } else {
        // Invalidate all clients
        await this.queryClient.invalidateQueries({ 
          queryKey: queryKeys.clients.all()
        });
      }
      
      logger.info('[CACHE] Client query invalidation complete');
      return true;
    } catch (error) {
      logger.error('[CACHE] Error during client query invalidation:', error);
      return false;
    }
  }

  /**
   * Invalidate and refetch all revenue-related queries
   */
  public async invalidateRevenueQueries(): Promise<boolean> {
    if (!this.queryClient) {
      logger.error('QueryCacheManager: No QueryClient set');
      return false;
    }

    try {
      logger.info(`[CACHE] Invalidating revenue queries at ${new Date().toISOString()}`);
      
      await Promise.all([
        this.queryClient.invalidateQueries({ queryKey: queryKeys.revenue.monthly() }),
        this.queryClient.invalidateQueries({ queryKey: queryKeys.revenue.forecast() }),
      ]);
      
      logger.info('[CACHE] Revenue query invalidation complete');
      return true;
    } catch (error) {
      logger.error('[CACHE] Error during revenue query invalidation:', error);
      return false;
    }
  }

  /**
   * Invalidate and refetch all queries (global refresh)
   */
  public async invalidateAllQueries(): Promise<boolean> {
    if (!this.queryClient) {
      logger.error('QueryCacheManager: No QueryClient set');
      return false;
    }

    try {
      logger.info(`[CACHE] Invalidating all queries at ${new Date().toISOString()}`);
      
      // First remove specific cached data
      this.queryClient.removeQueries({ queryKey: queryKeys.tasks.unified() });
      this.queryClient.removeQueries({ queryKey: ['unified-tasks'] });
      this.queryClient.removeQueries({ queryKey: ['tasks'] });
      this.queryClient.removeQueries({ queryKey: ['monthly-revenue'] });
      
      // Then invalidate everything
      await this.queryClient.invalidateQueries();
      
      logger.info('[CACHE] Global query invalidation complete');
      return true;
    } catch (error) {
      logger.error('[CACHE] Error during global query invalidation:', error);
      return false;
    }
  }
}

