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
      
      const { data, error } = await supabase.functions.invoke('analyze-client', {
        body: { category, prompt: prompt || undefined }
      });

      if (error) throw error;

      if (data?.recommendations) {
        // Convert recommendations to tasks
        for (const rec of data.recommendations) {
          await supabase.from('general_tasks').insert({
            title: rec.title || 'New Strategic Task',
            description: rec.description,
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