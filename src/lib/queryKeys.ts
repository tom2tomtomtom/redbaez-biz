
/**
 * Centralized query key definitions for React Query
 * This ensures consistency across the application
 */

export const queryKeys = {
  tasks: {
    all: () => ['tasks'],
    list: (params?: { category?: string, showCompleted?: boolean }) => 
      ['tasks-list', params?.category, params?.showCompleted],
    client: (clientId?: string | number) => 
      clientId ? ['client-tasks', String(clientId)] : ['client-tasks']
  },
  clients: {
    all: (refreshTrigger?: number) => ['clients', refreshTrigger],
    detail: (id?: string | number) => id ? ['client', String(id)] : ['client']
  },
  revenue: {
    monthly: () => ['monthly-revenue']
  },
  intel: {
    search: (query?: string) => ['intel-search', query]
  }
};
