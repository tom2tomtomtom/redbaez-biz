import { Suspense, useState } from "react";
import { CRMDashboard } from "@/components/crm/CRMDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { PriorityActions } from "@/components/crm/priority-actions/PriorityActions";
import { ClientSearch } from "@/components/crm/client-search/ClientSearch";
import { IntelSearch } from "@/components/crm/intel-search/IntelSearch";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Index = () => {
  const [searchInput, setSearchInput] = useState('');
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50">
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-4">
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
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <PriorityActions />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ClientSearch />
            <IntelSearch 
              searchInput={searchInput}
              onSearchInputChange={setSearchInput}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;