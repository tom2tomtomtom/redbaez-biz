import React, { useState } from 'react';
import { CRMNavigation } from './navigation/CRMNavigation';
import { ClientForm } from './client-form/ClientForm';
import { IntelSearch } from './intel-search/IntelSearch';
import { PriorityActions } from './priority-actions/PriorityActions';

export const CRMDashboard = () => {
  const [activeTab, setActiveTab] = useState('newClient');
  const [contacts, setContacts] = useState([{ name: '', title: '' }]);
  const [nextSteps, setNextSteps] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [searchInput, setSearchInput] = useState('');

  return (
    <div className="flex flex-col space-y-4 p-4 animate-fade-in">
      <CRMNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

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