import { Suspense } from "react";
import { CRMDashboard } from "@/components/crm/CRMDashboard";
import { ClientDetails } from "@/components/crm/ClientDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { PriorityActions } from "@/components/crm/priority-actions/PriorityActions";
import { ClientSearch } from "@/components/crm/client-search/ClientSearch";
import { IntelSearch } from "@/components/crm/intel-search/IntelSearch";
import { useState } from "react";

const Index = () => {
  const [searchInput, setSearchInput] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50">
      <div className="container mx-auto py-8 space-y-8">
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