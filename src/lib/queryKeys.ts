
/**
 * Centralized query key definitions for React Query
 * This ensures consistency across the application
 */

export const queryKeys = {
  tasks: {
    all: () => ['tasks'],
    unified: (params?: { category?: string, showCompleted?: boolean }) => 
      ['unified-tasks', params?.category, params?.showCompleted],
    general: (category?: string) => 
      ['generalTasks', category],
    clientNextSteps: () => ['clientNextSteps'],
    clientItems: (clientId?: string | number) => 
      clientId ? ['client-items', String(clientId)] : ['client-items']
  },
  clients: {
    all: (refreshTrigger?: number) => ['clients', refreshTrigger],
    detail: (id?: string | number) => id ? ['client', String(id)] : ['client']
  }
};
