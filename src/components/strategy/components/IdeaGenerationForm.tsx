import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";

interface IdeaGenerationFormProps {
  isGenerating: boolean;
  onGenerate: (prompt: string) => void;
}

export const IdeaGenerationForm = ({ isGenerating, onGenerate }: IdeaGenerationFormProps) => {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Add any specific focus areas or constraints..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="min-h-[100px]"
      />
      <Button 
        onClick={() => onGenerate(prompt)} 
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