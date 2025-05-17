
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

export const useIdeaGeneration = (category: string, onIdeasGenerated: () => void) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateIdeas = async (prompt: string) => {
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

      let recommendations = fallbackRecommendations;
      
      try {
        // Add small timeout to ensure the previous operation completed
        await new Promise(resolve => setTimeout(resolve, 100));
        
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

        if (data?.recommendations && Array.isArray(data.recommendations)) {
          recommendations = data.recommendations;
        } else {
          console.log('Invalid response format, using fallback recommendations');
        }
      } catch (functionError) {
        console.error('Error generating ideas:', functionError);
        toast({
          title: "Using default recommendations",
          description: "Could not connect to the idea generator service. Using default recommendations instead.",
          variant: "destructive",
        });
        // Fallback is already set
      }

      // Convert recommendations to tasks
      const taskPromises = recommendations.map(rec => {
        return supabase.from('tasks').insert({
          title: rec.suggestion,
          description: `Type: ${rec.type}\nPriority: ${rec.priority}`,
          category: category,
          status: 'incomplete',
          due_date: null
        });
      });
      
      try {
        const results = await Promise.allSettled(taskPromises);
        
        // Check for rejected promises and log them
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Error inserting task ${index}:`, result.reason);
          } else {
            console.log(`Successfully inserted task ${index}`);
          }
        });
        
        // If at least one insert succeeded, show success toast
        if (results.some(result => result.status === 'fulfilled')) {
          toast({
            title: "Ideas Generated",
            description: "Click on any idea to convert it into a task.",
          });
          
          // Call the callback to refresh the ideas list
          onIdeasGenerated();
        } else {
          toast({
            title: "Error",
            description: "Ideas couldn't be saved. Please try again.",
            variant: "destructive",
          });
        }
      } catch (insertError) {
        console.error('Error inserting tasks:', insertError);
        toast({
          title: "Error",
          description: "Some ideas couldn't be saved. Please try again.",
          variant: "destructive",
        });
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

  return {
    isGenerating,
    generateIdeas
  };
};
