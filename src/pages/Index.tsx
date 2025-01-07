import { Suspense } from "react";
import { CRMDashboard } from "@/components/crm/CRMDashboard";
import { ClientDetails } from "@/components/crm/ClientDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { PriorityActions } from "@/components/crm/priority-actions/PriorityActions";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/50">
      <div className="container mx-auto py-8 space-y-8">
        <PriorityActions />
        <Suspense fallback={<Skeleton className="w-full h-screen" />}>
          <CRMDashboard />
        </Suspense>
      </div>
    </div>
  );
};

export default Index;