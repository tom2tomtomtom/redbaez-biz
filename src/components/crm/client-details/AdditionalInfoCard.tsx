import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useClientUpdate } from './useClientUpdate';
import { toast } from '@/components/ui/use-toast';

interface AdditionalInfoCardProps {
  industry: string | null;
  website: string | null;
  notes: string | null;
  background: string | null;
  clientId: number;
}

export const AdditionalInfoCard = ({ 
  industry, 
  website, 
  notes,
  background,
  clientId
}: AdditionalInfoCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedIndustry, setEditedIndustry] = useState(industry || '');
  const [editedWebsite, setEditedWebsite] = useState(website || '');
  const [editedNotes, setEditedNotes] = useState(notes || '');
  const [editedBackground, setEditedBackground] = useState(background || '');

  const updateMutation = useClientUpdate(clientId.toString(), () => {
    setIsEditing(false);
    toast({
      title: "Success",
      description: "Additional information updated successfully",
    });
  });

  const handleSave = () => {
    updateMutation.mutate({
      formData: {
        industry: editedIndustry,
        website: editedWebsite,
        notes: editedNotes,
        background: editedBackground
      },
      contacts: [] // Maintain existing contacts array structure
    });
  };

  return (
    <Card className="col-span-12 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Additional Information</CardTitle>
        {!isEditing && (
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(true)}
            className="ml-auto"
          >
            Edit Additional Info
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isEditing ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">Industry</label>
                  <Input
                    value={editedIndustry}
                    onChange={(e) => setEditedIndustry(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Website</label>
                  <Input
                    type="url"
                    value={editedWebsite}
                    onChange={(e) => setEditedWebsite(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <Textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Background</label>
                  <Textarea
                    value={editedBackground}
                    onChange={(e) => setEditedBackground(e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button onClick={handleSave} className="w-full">
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm font-medium text-gray-500">Industry</p>
                  <p className="mt-1">{industry || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Website</p>
                  <p className="mt-1">
                    {website ? (
                      <a href={website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {website}
                      </a>
                    ) : 'Not specified'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="mt-1 whitespace-pre-wrap">{notes || 'No notes available'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Background</p>
                  <p className="mt-1 whitespace-pre-wrap">{background || 'No background information available'}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};