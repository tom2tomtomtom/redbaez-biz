import React, { useState } from 'react';
import { ClientForm } from './client-form/ClientForm';
import { IntelSearch } from './intel-search/IntelSearch';
import { ClientSearch } from './client-search/ClientSearch';
import { PriorityActions } from './priority-actions/PriorityActions';

export const CRMDashboard = () => {
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

  return (
    <div className="flex flex-col space-y-4 p-4 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <ClientForm
            contacts={contacts}
            nextSteps={nextSteps}
            nextDueDate={nextDueDate}
            onContactsChange={setContacts}
            onNextStepsChange={setNextSteps}
            onNextDueDateChange={setNextDueDate}
          />
        </div>

        <div className="lg:col-span-4 space-y-4">
          <ClientSearch />
          <IntelSearch
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
          />
          <PriorityActions />
        </div>
      </div>
    </div>
  );
};