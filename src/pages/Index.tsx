import { Suspense, useState } from "react";
import { CRMDashboard } from "@/components/crm/CRMDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { PriorityActions } from "@/components/crm/priority-actions/PriorityActions";
import { ClientSearch } from "@/components/crm/client-search/ClientSearch";
import { IntelSearch } from "@/components/crm/intel-search/IntelSearch";
import { RevenueSummary } from "@/components/crm/revenue-summary/RevenueSummary";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { TaskDialog } from "@/components/crm/priority-actions/TaskDialog";

const Index = () => {
  const [searchInput, setSearchInput] = useState('');
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [showClientList, setShowClientList] = useState(false);
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50">
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">RedBaez Biz</h1>
          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={() => setShowClientList(!showClientList)}
            >
              <Users className="mr-2 h-4 w-4" />
              {showClientList ? 'Hide Clients' : 'View All Clients'}
            </Button>
            <Dialog open={isNewClientOpen} onOpenChange={setIsNewClientOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Client
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                  <DialogDescription>
                    Enter the client's information below
                  </DialogDescription>
                </DialogHeader>
                <CRMDashboard onClientAdded={() => setIsNewClientOpen(false)} />
              </DialogContent>
            </Dialog>
            <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                  <DialogDescription>
                    Enter the task details below
                  </DialogDescription>
                </DialogHeader>
                <TaskDialog 
                  isOpen={isNewTaskOpen} 
                  onOpenChange={setIsNewTaskOpen}
                  task={null}
                  onSaved={() => setIsNewTaskOpen(false)}
                />
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
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
          <>
            <PriorityActions hideAddButton />
            <RevenueSummary />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ClientSearch />
              <IntelSearch 
                searchInput={searchInput}
                onSearchInputChange={setSearchInput}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;