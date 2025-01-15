import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DashboardHeaderProps {
  showClientList: boolean;
  onToggleClientList: () => void;
  onNewTaskClick: () => void;
}

export function DashboardHeader({
  onNewTaskClick,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="flex items-center gap-4">
        <Button onClick={onNewTaskClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Task
        </Button>
      </div>
    </div>
  );
}