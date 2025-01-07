import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientForm } from '../client-form/ClientForm';
import { Contact } from './ContactInfoCard';

interface ClientEditModeProps {
  client: any;
  contacts: Contact[];
  nextSteps: string;
  nextDueDate: string;
  onCancel: () => void;
  onSave: (formData: any) => void;
  onContactsChange: (contacts: Contact[]) => void;
  onNextStepsChange: (steps: string) => void;
  onNextDueDateChange: (date: string) => void;
}

export const ClientEditMode = ({
  client,
  contacts,
  nextSteps,
  nextDueDate,
  onCancel,
  onSave,
  onContactsChange,
  onNextStepsChange,
  onNextDueDateChange,
}: ClientEditModeProps) => {
  return (
    <div className="p-8 w-full max-w-7xl mx-auto bg-gray-50/50">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={onCancel}
        >
          <X size={16} />
          Cancel Editing
        </Button>
      </div>
      <ClientForm
        initialData={client}
        onSave={onSave}
        isEditing={true}
        contacts={contacts}
        nextSteps={nextSteps}
        nextDueDate={nextDueDate}
        onContactsChange={onContactsChange}
        onNextStepsChange={onNextStepsChange}
        onNextDueDateChange={onNextDueDateChange}
      />
    </div>
  );
};