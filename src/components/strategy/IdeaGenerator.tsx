import logger from '@/utils/logger';

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

  const handleGenerateIdeas = (prompt: string) => {
    logger.info("Generating ideas with prompt:", prompt);
    generateIdeas(prompt);
  };

  return (
    <div className="space-y-4">
      <IdeaGenerationForm 
        isGenerating={isGenerating}
        onGenerate={handleGenerateIdeas}
      />

      <IdeaTaskManager
        category={category}
        onTaskSaved={onIdeaGenerated}
      />
    </div>
  );
};
