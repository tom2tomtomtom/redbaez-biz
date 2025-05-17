import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

interface AdditionalInfoCardProps {
  industry: string;
  website: string;
  type: string;
  clientId: number;
}

export const AdditionalInfoCard: React.FC<AdditionalInfoCardProps> = ({
  industry: initialIndustry,
  website: initialWebsite,
  type: initialType,
  clientId
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [industry, setIndustry] = useState(initialIndustry);
  const [website, setWebsite] = useState(initialWebsite);
  const [type, setType] = useState(initialType);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          industry,
          website,
          type
        })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Additional information updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating additional information:', error);
      toast({
        title: "Error",
        description: "Failed to update additional information",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Additional Information</h3>
        {!isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Industry</p>
          {isEditing ? (
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="real-estate">Real Estate</SelectItem>
                <SelectItem value="energy">Energy</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="advertising">Advertising</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm capitalize">{industry || 'Not specified'}</p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Website</p>
          {isEditing ? (
            <Input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Enter website URL"
              className="w-full"
            />
          ) : (
            <p className="text-sm">
              {website ? (
                <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {website}
                </a>
              ) : (
                'Not specified'
              )}
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Type</p>
          {isEditing ? (
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="non-profit">Non-Profit</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm capitalize">{type}</p>
          )}
        </div>
      </div>
    </Card>
  );
};
