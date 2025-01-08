import { Suspense } from "react";
import { CRMDashboard } from "@/components/crm/CRMDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { PriorityActions } from "@/components/crm/priority-actions/PriorityActions";
import { ClientSearch } from "@/components/crm/client-search/ClientSearch";
import { IntelSearch } from "@/components/crm/intel-search/IntelSearch";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [searchInput, setSearchInput] = useState('');
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
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>

        <PriorityActions />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ClientSearch />
          <IntelSearch 
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
          />
        </div>

        <Suspense fallback={<Skeleton className="w-full h-screen" />}>
          <CRMDashboard />
        </Suspense>
      </div>
    </div>
  );
};

export default Index;