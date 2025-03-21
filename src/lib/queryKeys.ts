
export const queryKeys = {
  clients: {
    all: () => ['clients'],
    lists: () => ['clients', 'list'],
    details: (id: string) => ['clients', 'detail', id],
    detail: (id: number) => ['clients', 'detail', id.toString()]
  },
  contacts: {
    all: () => ['contacts'],
    lists: () => ['contacts', 'list'],
    details: (id: string) => ['contacts', 'detail', id]
  },
  deals: {
    all: () => ['deals'],
    lists: () => ['deals', 'list'],
    details: (id: string) => ['deals', 'detail', id]
  },
  quotes: {
    all: () => ['quotes'],
    lists: () => ['quotes', 'list'],
    details: (id: string) => ['quotes', 'detail', id]
  },
  invoices: {
    all: () => ['invoices'],
    lists: () => ['invoices', 'list'],
    details: (id: string) => ['invoices', 'detail', id]
  },
  tasks: {
    // Unified query key for all tasks
    unified: () => ['tasks', 'unified'],
    
    // Tasks list with filters
    list: (filters?: { category?: string; showCompleted?: boolean }) => 
      ['tasks', 'list', filters?.category || 'all', filters?.showCompleted ? 'completed' : 'active'],
    
    // All tasks 
    all: () => ['tasks', 'all'],
    
    // Single task by ID
    detail: (id: string) => ['tasks', 'detail', id],
    
    // Tasks for a specific client
    clientItems: (clientId: number | null) => ['tasks', 'client', clientId?.toString() || 'none'],
    
    // General tasks (for strategy section)
    general: () => ['tasks', 'general'],
    
    // Add a client method to fix the error
    client: (clientId?: number | null) => ['tasks', 'client', clientId?.toString() || 'none']
  },
  settings: {
    all: () => ['settings'],
    user: () => ['settings', 'user'],
  }
};

export default queryKeys;
