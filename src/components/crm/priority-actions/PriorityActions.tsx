import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

const fetchPriorityClients = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(2);
    
  if (error) throw error;
  return data;
};

export const PriorityActions = () => {
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['priorityClients'],
    queryFn: fetchPriorityClients,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Priority Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Priority Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-red-50 rounded-lg">
            Error loading priority actions
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle>Priority Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {clients?.map((client) => (
            <Link 
              key={client.id} 
              to={`/client/${client.id}`}
              className="block"
            >
              <div className={`p-3 ${
                client.status === 'incomplete' ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'
              } rounded-lg border`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <div className={`h-6 w-6 rounded-full ${
                      client.status === 'incomplete' ? 'bg-red-500' : 'bg-orange-500'
                    } flex items-center justify-center text-white text-xs font-bold`}>
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium">{client.name}</span>
                      <p className="text-sm text-gray-600 mt-1">
                        {client.missing_fields?.length 
                          ? `Missing: ${client.missing_fields.join(', ')}` 
                          : 'All fields complete'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    client.status === 'incomplete' 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-orange-100 text-orange-600'
                  }`}>
                    {client.status === 'incomplete' ? 'Incomplete' : 'Review'}
                  </span>
                </div>
                <div className="mt-2 text-sm flex items-center gap-2">
                  <Calendar size={14} />
                  Added: {new Date(client.created_at).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}

          {(!clients || clients.length === 0) && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-gray-600 text-center">No priority actions found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};