
import { useState } from "react";
import { IdeaGenerationForm } from "./components/IdeaGenerationForm";
import { IdeaTaskManager } from "./components/IdeaTaskManager";
import { useIdeaGeneration } from "./hooks/useIdeaGeneration";

interface IdeaGeneratorProps {
  category: string;
  onIdeaGenerated: () => void;
}

export const IdeaGenerator = ({ category, onIdeaGenerated }: IdeaGeneratorProps) => {
  const [selectedIdea, setSelectedIdea] = useState<{
    suggestion: string;
    priority: string;
    type: string;
  } | null>(null);
  
  const { isGenerating, generateIdeas } = useIdeaGeneration(category, onIdeaGenerated);

  const handleCreateTask = (idea: { suggestion: string; priority: string; type: string }) => {
    setSelectedIdea(idea);
  };

  return (
    <div className="space-y-4">
      <IdeaGenerationForm 
        isGenerating={isGenerating}
        onGenerate={generateIdeas}
      />

      <IdeaTaskManager
        category={category}
        onTaskSaved={onIdeaGenerated}
      />
    </div>
  );
};
