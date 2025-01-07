import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Search, Send, Plus } from 'lucide-react';

export const CRMDashboard = () => {
  const [activeTab, setActiveTab] = useState('newClient');
  const [contacts, setContacts] = useState([{ name: '', title: '' }]);
  const [nextSteps, setNextSteps] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const addContact = () => {
    setContacts([...contacts, { name: '', title: '' }]);
  };

  const removeContact = (index: number) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter((_, i) => i !== index));
    }
  };

  const handleContactChange = (index: number, field: string, value: string) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setContacts(newContacts);
  };

  return (
    <div className="flex flex-col space-y-4 p-4 animate-fade-in">
      {/* Top Navigation */}
      <div className="flex space-x-4">
        <Button 
          onClick={() => setActiveTab('newClient')}
          variant={activeTab === 'newClient' ? 'default' : 'outline'}
          className="transition-all duration-300"
        >
          New Client Entry
        </Button>
        <Button 
          onClick={() => setActiveTab('search')}
          variant={activeTab === 'search' ? 'default' : 'outline'}
          className="transition-all duration-300"
        >
          Client Search
        </Button>
        <Button 
          onClick={() => setActiveTab('priorities')}
          variant={activeTab === 'priorities' ? 'default' : 'outline'}
          className="transition-all duration-300"
        >
          Priorities
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Panel - Client Form */}
        <div className="lg:col-span-8">
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle>New Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Company Name</Label>
                  <Input placeholder="Enter company name" className="transition-all duration-300" />
                </div>

                <div className="col-span-2">
                  <Label>Contacts</Label>
                  <div className="space-y-4">
                    {contacts.map((contact, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Input 
                          placeholder="Contact Name"
                          value={contact.name}
                          onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                          className="transition-all duration-300"
                        />
                        <Input 
                          placeholder="Title"
                          value={contact.title}
                          onChange={(e) => handleContactChange(index, 'title', e.target.value)}
                          className="transition-all duration-300"
                        />
                        <Button 
                          variant="destructive"
                          onClick={() => removeContact(index)}
                          className="transition-all duration-300"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      onClick={addContact}
                      className="w-full transition-all duration-300"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Contact
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select>
                    <SelectTrigger className="transition-all duration-300">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="negotiation">In Negotiation</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Likelihood (%)</Label>
                  <Input type="number" placeholder="Enter %" className="transition-all duration-300" />
                </div>

                <div className="col-span-2">
                  <Label>Next Steps</Label>
                  <textarea 
                    className="w-full h-24 p-3 rounded-lg border border-gray-200 transition-all duration-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter next steps..."
                    value={nextSteps}
                    onChange={(e) => setNextSteps(e.target.value)}
                  />
                </div>

                <div className="col-span-2">
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                    <Label className="text-primary font-medium">Next Step Due Date</Label>
                    <div className="relative mt-2">
                      <Input
                        type="date"
                        value={nextDueDate}
                        onChange={(e) => setNextDueDate(e.target.value)}
                        className="pr-10 transition-all duration-300"
                      />
                      <Calendar className="absolute right-3 top-2.5 text-primary" size={16} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 border-t pt-6">
                <Button 
                  className="w-full py-6 text-lg font-medium transition-all duration-300 hover:scale-[1.01]"
                  onClick={() => {
                    console.log('Saving client information...');
                  }}
                >
                  Save Client Information
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Intel Search & Priorities */}
        <div className="lg:col-span-4 space-y-4">
          {/* Intel Search */}
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search size={18} />
                Intel Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search for intel..."
                  className="transition-all duration-300"
                />
                <Button className="transition-all duration-300">
                  <Send size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Priority Actions */}
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle>Priority Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg border border-red-100 transition-all duration-300 hover:shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                        H
                      </div>
                      <div>
                        <span className="font-medium">Follow up with ABC Corp</span>
                        <p className="text-sm text-gray-600 mt-1">Review Q4 proposal</p>
                      </div>
                    </div>
                    <span className="text-sm bg-red-100 px-2 py-1 rounded-full text-red-600">Due Today</span>
                  </div>
                  <div className="mt-2 text-sm flex items-center gap-2">
                    <Calendar size={14} />
                    Due: Jan 7, 2025
                  </div>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 transition-all duration-300 hover:shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                        M
                      </div>
                      <div>
                        <span className="font-medium">Schedule XYZ Inc meeting</span>
                        <p className="text-sm text-gray-600 mt-1">Product demo</p>
                      </div>
                    </div>
                    <span className="text-sm bg-orange-100 px-2 py-1 rounded-full text-orange-600">Tomorrow</span>
                  </div>
                  <div className="mt-2 text-sm flex items-center gap-2">
                    <Calendar size={14} />
                    Due: Jan 8, 2025
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};