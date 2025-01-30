import React, { useState } from 'react';
import { ClientForm } from './client-form/ClientForm';
import { IntelSearch } from './intel-search/IntelSearch';
import { ClientSearch } from './client-search/ClientSearch';
import { BusinessSummary } from './business-summary/BusinessSummary';
import { CalendarView } from '../calendar/CalendarView';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface CRMDashboardProps {
  onClientAdded?: () => void;
}

export const CRMDashboard = ({ onClientAdded }: CRMDashboardProps) => {
  const [contacts, setContacts] = useState([{ 
    firstName: '', 
    lastName: '', 
    title: '', 
    email: '', 
    address: '', 
    phone: '' 
  }]);
  const [nextSteps, setNextSteps] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleClientAdded = () => {
    toast({
      title: "Success",
      description: "Client added successfully",
    });
    
    // Reset form
    setContacts([{ 
      firstName: '', 
      lastName: '', 
      title: '', 
      email: '', 
      address: '', 
      phone: '' 
    }]);
    setNextSteps('');
    setNextDueDate('');
    
    // Call parent callback if provided
    if (onClientAdded) {
      onClientAdded();
    }

    // Navigate to the clients list
    navigate('/');
  };

  return (
    <div className="flex flex-col space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 gap-4">
        <ClientForm
          contacts={contacts}
          nextSteps={nextSteps}
          nextDueDate={nextDueDate}
          onContactsChange={setContacts}
          onNextStepsChange={setNextSteps}
          onNextDueDateChange={setNextDueDate}
          onClientAdded={handleClientAdded}
        />
      </div>
    </div>
  );
};