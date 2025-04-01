
/**
 * Central repository of query keys used throughout the application
 * This helps avoid typos and ensures consistency in cache management
 */

export const queryKeys = {
  // Client related queries
  clients: {
    all: () => ['clients'],
    lists: () => [...queryKeys.clients.all(), 'list'],
    list: (filters: any = {}) => [...queryKeys.clients.lists(), filters],
    details: () => [...queryKeys.clients.all(), 'detail'],
    detail: (id: number) => [...queryKeys.clients.details(), id],
  },
  
  // Task related queries
  tasks: {
    all: () => ['tasks'],
    unified: () => ['unified-tasks'],
    general: () => ['generalTasks'],
    next: () => ['nextSteps'],
    list: (params: { category?: string, showCompleted?: boolean } = {}) => 
      [...queryKeys.tasks.all(), params],
    clientItems: (clientId: number | null) => 
      [...queryKeys.tasks.all(), 'client', clientId],
  },
  
  // Revenue related queries
  revenue: {
    all: () => ['revenue'],
    monthly: () => ['monthly-revenue'],
    annual: () => ['annual-revenue'],
    forecast: () => ['forecast'],
  }
};
