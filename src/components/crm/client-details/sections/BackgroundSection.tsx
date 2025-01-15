import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface BackgroundSectionProps {
  clientId: number;
  background: string | null;
}

export const BackgroundSection = ({ clientId, background }: BackgroundSectionProps) => {
  const [isEditingBackground, setIsEditingBackground] = useState(false);
  const [editedBackground, setEditedBackground] = useState(background || '');
  const queryClient = useQueryClient();

  const handleSaveBackground = async () => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ background: editedBackground })
        .eq('id', clientId);

      if (error) throw error;

      // Invalidate and refetch client data
      await queryClient.invalidateQueries({ queryKey: ['client', clientId] });

      toast({
        title: "Success",
        description: "Background updated successfully",
      });
      setIsEditingBackground(false);
    } catch (error) {
      console.error('Error updating background:', error);
      toast({
        title: "Error",
        description: "Failed to update background",
        variant: "destructive",
      });
    }
  };

  const formatText = (text: string) => {
    if (!text) return '';
    const paragraphs = text.split(/\n\n+/);
    return paragraphs
      .map(para => 
        para
          .split(/\n/)
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .join('\n')
      )
      .filter(para => para.length > 0)
      .join('\n\n');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Background</h3>
        {!isEditingBackground ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditingBackground(true)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={handleSaveBackground}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        )}
      </div>
      
      {isEditingBackground ? (
        <Textarea
          value={editedBackground}
          onChange={(e) => setEditedBackground(e.target.value)}
          className="min-h-[150px] mb-4"
          placeholder="Enter client background information..."
        />
      ) : (
        <div className="text-gray-700 whitespace-pre-line">
          {formatText(background || 'No background information available.')}
        </div>
      )}
    </div>
  );
};