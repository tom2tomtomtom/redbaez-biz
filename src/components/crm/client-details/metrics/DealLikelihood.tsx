import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useQueryClient } from '@tanstack/react-query';

interface DealLikelihoodProps {
  likelihood: number | null;
  clientId: number;
}

export const DealLikelihood = ({ likelihood, clientId }: DealLikelihoodProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(likelihood?.toString() || '');
  const queryClient = useQueryClient();

  const handleSave = async () => {
    const numericValue = parseFloat(value);
    
    if (isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
      toast({
        title: "Invalid value",
        description: "Please enter a number between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .update({ likelihood: numericValue })
        .eq('id', clientId);

      if (error) throw error;

      // Invalidate and refetch queries that depend on this client's data
      await queryClient.invalidateQueries({ queryKey: ['client', clientId] });

      toast({
        title: "Success",
        description: "Deal likelihood updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating likelihood:', error);
      toast({
        title: "Error",
        description: "Failed to update deal likelihood",
        variant: "destructive",
      });
    }
  };

  // Update local state when prop changes
  useEffect(() => {
    setValue(likelihood?.toString() || '');
  }, [likelihood]);

  if (isEditing) {
    return (
      <div className="p-4 bg-primary/5 rounded-lg transition-all duration-300 hover:bg-primary/10">
        <div className="flex flex-col space-y-2">
          <p className="text-sm text-primary font-medium">Deal Likelihood</p>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              min="0"
              max="100"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-24"
            />
            <span className="text-sm text-gray-500">%</span>
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-primary/5 rounded-lg transition-all duration-300 hover:bg-primary/10 cursor-pointer" onClick={() => setIsEditing(true)}>
      <div className="flex justify-between items-center">
        <p className="text-sm text-primary font-medium">Deal Likelihood</p>
        <span className={`px-2 py-1 rounded-full text-sm ${
          likelihood && likelihood > 70 ? 'bg-green-100 text-green-800' :
          likelihood && likelihood > 30 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {likelihood ? `${likelihood}%` : 'N/A'}
        </span>
      </div>
    </div>
  );
};