import React from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Client {
  id: number;
  name: string;
  industry?: string | null;
  type?: string | null;
  status?: string | null;
  // Additional fields that might be in the database
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  created_at?: string | null;
}

interface ClientListSectionProps {
  clients: Client[] | undefined;
  isLoading: boolean;
}

export const ClientListSection: React.FC<ClientListSectionProps> = ({
  clients,
  isLoading,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Clients</CardTitle>
        <CardDescription>A complete list of all clients</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="space-y-2">
            {Array.isArray(clients) && clients.map((client) => (
              <Link 
                key={client.id}
                to={`/client/${client.id}`}
                className="block p-4 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{client.name}</h3>
                    <p className="text-sm text-gray-500">
                      {client.industry || client.contact_person || 'No details'} 
                      {client.type && ` · ${client.type}`}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    client.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {client.status || 'New'}
                  </span>
                </div>
              </Link>
            ))}
            {(!clients || clients.length === 0) && (
              <p className="text-center text-gray-500 py-4">
                No clients found. Add a new client to get started.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};