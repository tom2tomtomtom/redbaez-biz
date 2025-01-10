import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface IdeaGeneratorProps {
  category: string;
  onIdeaGenerated: () => void;
}

export const IdeaGenerator = ({ category, onIdeaGenerated }: IdeaGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");

  const generateIdea = async () => {
    try {
      setIsGenerating(true);
      console.log('Generating ideas for category:', category);

      // Delete existing tasks for this category that were auto-generated
      const { error: deleteError } = await supabase
        .from('general_tasks')
        .delete()
        .eq('category', category)
        .is('client_id', null); // Only delete tasks that aren't associated with a client

      if (deleteError) {
        console.error('Error deleting existing tasks:', deleteError);
        throw deleteError;
      }

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
          await supabase.from('general_tasks').insert({
            title: rec.suggestion || 'New Strategic Task',
            description: `Priority: ${rec.priority}\nType: ${rec.type}\n\n${rec.suggestion}`,
            category: category,
            status: 'incomplete',
            next_due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Default to 1 week
          });
        }

        toast({
          title: "Ideas Generated",
          description: "New strategic tasks have been created based on the generated ideas.",
        });

        setPrompt("");
        onIdeaGenerated();
      } else {
        throw new Error('No recommendations received from the API');
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      toast({
        title: "Error",
        description: "Failed to generate ideas. Please check the browser console and Edge Function logs for details.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder={`Add any specific focus areas or constraints for ${category} ideas...`}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="min-h-[100px]"
      />
      <Button 
        onClick={generateIdea} 
        disabled={isGenerating}
        className="w-full"
        variant="default"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Ideas...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Strategic Ideas
          </>
        )}
      </Button>
    </div>
  );
};