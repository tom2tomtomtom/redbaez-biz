import { useState } from "react";
import { Card } from "@/components/ui/card";
import { IdeaGenerator } from "./IdeaGenerator";
import { TaskList } from "./TaskList";
import { useGeneralTasks } from "./hooks/useGeneralTasks";

interface StrategyDashboardProps {
  category: "marketing" | "partnerships" | "product development";
}

export const StrategyDashboard = ({ category }: StrategyDashboardProps) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { data: tasks, isLoading } = useGeneralTasks(category, refreshTrigger);

  const handleIdeaGenerated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Generate Ideas</h2>
        <IdeaGenerator 
          category={category} 
          onIdeaGenerated={handleIdeaGenerated}
        />
      </Card>
      
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Tasks & Action Items</h2>
        <TaskList 
          tasks={tasks || []} 
          isLoading={isLoading} 
          onTasksUpdated={handleIdeaGenerated}
        />
      </Card>
    </div>
  );
};