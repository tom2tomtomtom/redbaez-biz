import { Suspense, useState } from "react";
import { MainNav } from "@/components/ui/main-nav";
import { CRMDashboard } from "@/components/crm/CRMDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { PriorityActions } from "@/components/crm/priority-actions/PriorityActions";
import { ClientSearch } from "@/components/crm/client-search/ClientSearch";
import { IntelSearch } from "@/components/crm/intel-search/IntelSearch";
import { RevenueSummary } from "@/components/crm/revenue-summary/RevenueSummary";
import { Users, Plus, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "@/components/crm/priority-actions/TaskDialog";

const Index = () => {
  const [searchInput, setSearchInput] = useState('');
  const [showClientList, setShowClientList] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50">
      <MainNav />
      <div className="container mx-auto px-4 py-4 md:py-8 space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Redbaez Biz</h1>
            <div className="flex gap-4">
              <Button 
                variant="outline"
                onClick={() => setShowClientList(!showClientList)}
              >
                <Users className="mr-2 h-4 w-4" />
                {showClientList ? 'Hide Clients' : 'View All Clients'}
              </Button>
              <Link to="/client/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Client
                </Button>
              </Link>
              <Button 
                variant="secondary" 
                className="gap-2"
                onClick={() => setIsNewTaskOpen(true)}
              >
                <FileText className="h-4 w-4" />
                Add New Task
              </Button>
            </div>
          </div>

          {!showClientList && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ClientSearch />
              <IntelSearch 
                searchInput={searchInput}
                onSearchInputChange={setSearchInput}
              />
            </div>
          )}
        </div>

        {showClientList ? (
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
                  {clients?.map((client) => (
                    <Link 
                      key={client.id}
                      to={`/client/${client.id}`}
                      className="block p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{client.name}</h3>
                          <p className="text-sm text-gray-500">
                            {client.industry || 'No industry specified'} · {client.type}
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
                  {clients?.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      No clients found. Add a new client to get started.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <PriorityActions hideAddButton />
            <RevenueSummary />
          </div>
        )}
      </div>

      <TaskDialog 
        isOpen={isNewTaskOpen}
        onOpenChange={setIsNewTaskOpen}
        task={null}
        onSaved={() => {
          setIsNewTaskOpen(false);
        }}
      />
    </div>
  );
};

export default Index;