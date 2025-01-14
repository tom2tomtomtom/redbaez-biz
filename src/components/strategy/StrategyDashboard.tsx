import { useState } from "react";
import { Card } from "@/components/ui/card";
import { IdeaGenerator } from "./IdeaGenerator";
import { TaskList } from "./TaskList";
import { useGeneralTasks } from "./hooks/useGeneralTasks";
import { TaskDialog } from "@/components/crm/priority-actions/TaskDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface StrategyDashboardProps {
  category: "marketing" | "partnerships" | "product development";
}

export const StrategyDashboard = ({ category }: StrategyDashboardProps) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  
  const { data: allTasks, isLoading } = useGeneralTasks(category, refreshTrigger);
  
  console.log('All tasks before filtering:', allTasks); // Debug log
  
  // Separate tasks into distinct groups - tasks with due dates are active, without are ideas
  const activeTasks = allTasks?.filter(task => {
    const isActive = task.status !== 'completed';
    console.log('Task:', task.id, 'isActive:', isActive, 'status:', task.status, 'next_due_date:', task.next_due_date);
    return isActive;
  }) || [];
  
  const completedTasks = allTasks?.filter(task => 
    task.status === 'completed'
  ) || [];
  
  const generatedIdeas = allTasks?.filter(task => 
    task.status !== 'completed' && task.next_due_date === null
  ) || [];

  console.log('Filtered tasks:', {
    active: activeTasks,
    completed: completedTasks,
    ideas: generatedIdeas
  }); // Debug log

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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Tasks & Action Items</h2>
          <Button onClick={() => setIsNewTaskOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
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