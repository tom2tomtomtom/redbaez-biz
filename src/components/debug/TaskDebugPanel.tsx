import logger from '@/utils/logger';

import { useState } from 'react';
import { Task } from '@/types/task';
import { useTaskData } from '@/components/crm/priority-actions/hooks/useTaskData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Bug, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export const TaskDebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { data: tasks = [] } = useTaskData();
  
  const fetchRawData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .limit(10);
        
      if (error) throw error;
      
      setRawData(data || []);
    } catch (err: any) {
      logger.error('Error fetching raw task data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        <Bug className="mr-2 h-4 w-4" />
        Debug Tasks
      </Button>
    );
  }
  
  return (
    <div className="fixed bottom-0 right-0 w-full md:w-[500px] h-[400px] bg-white border rounded-t-lg shadow-lg z-50 flex flex-col">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <div className="flex items-center">
          <Database className="h-5 w-5 mr-2 text-gray-500" />
          <h3 className="font-medium">Task Debug Panel</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div>
            <Badge variant="outline" className="mr-2">
              React Tasks: {tasks.length}
            </Badge>
            <Badge variant="outline">
              Raw DB Tasks: {rawData.length}
            </Badge>
          </div>
          <Button 
            onClick={fetchRawData} 
            size="sm" 
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Fetch Raw Data'}
          </Button>
        </div>
        
        {error && (
          <div className="p-2 bg-red-50 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-1">React Task Data:</h4>
          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-[100px]">
            {JSON.stringify(tasks.slice(0, 2), null, 2)}
          </pre>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-1">Raw Database Data:</h4>
          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-[100px]">
            {JSON.stringify(rawData.slice(0, 2), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
