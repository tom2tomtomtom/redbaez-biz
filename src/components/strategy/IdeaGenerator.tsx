
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
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

      // First, delete existing incomplete tasks for this category
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('category', category)
        .is('due_date', null)
        .eq('status', 'incomplete');

      if (deleteError) {
        console.error('Error deleting existing tasks:', deleteError);
        throw deleteError;
      }

      // Define some local fallback recommendations in case the edge function fails
      const fallbackRecommendations = [
        {
          suggestion: `Create a content strategy for ${category}`,
          priority: "high",
          type: "opportunity"
        },
        {
          suggestion: `Develop a monthly ${category} newsletter`,
          priority: "medium",
          type: "engagement" 
        },
        {
          suggestion: `Research current trends in ${category}`,
          priority: "medium",
          type: "opportunity"
        }
      ];

      let recommendations;
      
      try {
        // Try to call the edge function
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

        recommendations = data?.recommendations;
        
        if (!recommendations || !Array.isArray(recommendations)) {
          console.log('Invalid response format, using fallback');
          recommendations = fallbackRecommendations;
        }
      } catch (functionError) {
        console.error('Error generating ideas:', functionError);
        toast({
          title: "Using default recommendations",
          description: "Could not connect to the idea generator service. Using default recommendations instead.",
          variant: "destructive",
        });
        recommendations = fallbackRecommendations;
      }

      // Convert recommendations to tasks
      for (const rec of recommendations) {
        const { error: insertError } = await supabase.from('tasks').insert({
          title: rec.suggestion,
          description: `Type: ${rec.type}\nPriority: ${rec.priority}`,
          category: category,
          status: 'incomplete',
          due_date: null // Create as ideas first
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

      // Only trigger refresh after all operations are complete
      onIdeaGenerated();
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
          due_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          urgent: false,
          client_id: null,
          updated_by: null,
          created_by: null,
          type: 'task'
        } : null}
        onSaved={() => {
          setIsTaskDialogOpen(false);
          onIdeaGenerated();
        }}
      />
    </div>
  );
};
