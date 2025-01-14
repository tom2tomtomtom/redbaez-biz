import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TaskDialog } from "@/components/crm/priority-actions/TaskDialog";
import { IdeaGenerationForm } from "./components/IdeaGenerationForm";
import { CreateTaskDialog } from "./components/CreateTaskDialog";

interface IdeaGeneratorProps {
  category: string;
  onIdeaGenerated: () => void;
}

export const IdeaGenerator = ({ category, onIdeaGenerated }: IdeaGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<{
    suggestion: string;
    priority: string;
    type: string;
  } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const generateIdea = async (prompt: string) => {
    try {
      setIsGenerating(true);
      console.log('Generating ideas for category:', category);

      const { data, error } = await supabase.functions.invoke('analyze-client', {
        body: { 
          prompt: prompt || undefined,
          category,
          type: 'strategy'
        }
      });

      console.log('Response from Edge Function:', data, error);

      if (error) {
        console.error('Error from Edge Function:', error);
        throw error;
      }

      if (data?.recommendations) {
        console.log('Processing recommendations:', data.recommendations);
        
        // Convert recommendations to tasks
        for (const rec of data.recommendations) {
          const { error: insertError } = await supabase.from('general_tasks').insert({
            title: rec.suggestion,
            description: `Type: ${rec.type}\nPriority: ${rec.priority}`,
            category: category,
            status: 'incomplete',
            next_due_date: null // Create as ideas first
          });

          if (insertError) {
            console.error('Error inserting task:', insertError);
            throw insertError;
          }
        }

        toast({
          title: "Ideas Generated",
          description: "Click on any idea to convert it into a task.",
        });

        onIdeaGenerated();
      } else {
        throw new Error('No recommendations received from the API');
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      toast({
        title: "Error",
        description: "Failed to generate ideas. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateTask = (idea: { suggestion: string; priority: string; type: string }) => {
    setSelectedIdea(idea);
    setShowConfirmDialog(true);
  };

  return (
    <div className="space-y-4">
      <IdeaGenerationForm 
        isGenerating={isGenerating}
        onGenerate={generateIdea}
      />

      <CreateTaskDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={() => {
          setShowConfirmDialog(false);
          setIsTaskDialogOpen(true);
        }}
      />

      <TaskDialog
        isOpen={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        task={selectedIdea ? {
          id: '',
          title: selectedIdea.suggestion,
          description: `Type: ${selectedIdea.type}\nPriority: ${selectedIdea.priority}`,
          category: category,
          status: 'incomplete',
          next_due_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          urgent: false,
          client_id: null
        } : null}
        onSaved={() => {
          setIsTaskDialogOpen(false);
          onIdeaGenerated();
        }}
      />
    </div>
  );
};