import { useState } from "react";
import { Card } from "@/components/ui/card";
import { IdeaGenerator } from "./IdeaGenerator";
import { TaskList } from "./TaskList";
import { useGeneralTasks } from "./hooks/useGeneralTasks";
import { TaskDialog } from "@/components/crm/priority-actions/TaskDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StrategyDashboardProps {
  category: "marketing" | "partnerships" | "product development";
}

export const StrategyDashboard = ({ category }: StrategyDashboardProps) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  
  const { data: allTasks, isLoading } = useGeneralTasks(category, refreshTrigger);
  
  const activeTasks = allTasks?.filter(task => task.status !== 'completed' && task.next_due_date) || [];
  const completedTasks = allTasks?.filter(task => task.status === 'completed') || [];
  const generatedIdeas = allTasks?.filter(task => task.status !== 'completed' && !task.next_due_date) || [];

  const handleIdeaGenerated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Generate Ideas</h2>
        </div>
        <IdeaGenerator 
          category={category} 
          onIdeaGenerated={handleIdeaGenerated}
        />
        {generatedIdeas.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Generated Ideas</h3>
            <TaskList 
              tasks={generatedIdeas}
              isLoading={isLoading}
              onTasksUpdated={handleIdeaGenerated}
            />
          </div>
        )}
      </Card>
      
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Tasks & Action Items</h2>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="active">Active Tasks ({activeTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Task History ({completedTasks.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <TaskList 
              tasks={activeTasks}
              isLoading={isLoading} 
              onTasksUpdated={handleIdeaGenerated}
            />
          </TabsContent>
          <TabsContent value="completed">
            <TaskList 
              tasks={completedTasks} 
              isLoading={isLoading} 
              onTasksUpdated={handleIdeaGenerated}
              isHistory
            />
          </TabsContent>
        </Tabs>
      </Card>

      <TaskDialog 
        isOpen={isNewTaskOpen}
        onOpenChange={setIsNewTaskOpen}
        task={null}
        onSaved={() => {
          setIsNewTaskOpen(false);
          handleIdeaGenerated();
        }}
        defaultCategory={category}
      />
    </div>
  );
};