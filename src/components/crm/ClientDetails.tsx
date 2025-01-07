import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, Mail, Phone, Star, Edit, MoreHorizontal } from 'lucide-react';

export const ClientDetails = () => {
  // Dummy data - will be replaced with real data later
  const clientData = {
    id: "CL-2024-001",
    name: "TechCorp Solutions",
    status: "Active Client",
    yearStarted: 2022,
    revenueYTD: "$450,000",
    contacts: [
      { name: "Sarah Chen", title: "CTO", email: "schen@techcorp.com", phone: "415-555-0123" },
      { name: "Michael Ross", title: "Procurement Manager", email: "mross@techcorp.com", phone: "415-555-0124" }
    ],
    interactions: [
      { date: "2024-01-05", type: "Meeting", description: "Quarterly review - Discussed new project timeline", team: "Alex, Sarah" },
      { date: "2023-12-20", type: "Email", description: "Sent proposal for Q1 2024 projects", team: "Sarah" },
      { date: "2023-12-15", type: "Call", description: "Technical requirements discussion", team: "Alex, John" }
    ]
  };

  const revenueData = [
    { month: 'Jan', value: 45000 },
    { month: 'Feb', value: 52000 },
    { month: 'Mar', value: 48000 },
    { month: 'Apr', value: 51000 },
    { month: 'May', value: 53000 },
    { month: 'Jun', value: 60000 }
  ];

  return (
    <div className="flex flex-col space-y-6 p-8 w-full max-w-7xl mx-auto bg-gray-50/50 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start bg-white p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
        <div>
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-800">{clientData.name}</h1>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {clientData.status}
            </span>
          </div>
          <p className="text-gray-500 mt-1">Client since {clientData.yearStarted} · ID: {clientData.id}</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button variant="outline" className="flex items-center gap-2 transition-all duration-300">
            <Edit size={16} />
            Edit
          </Button>
          <Button variant="outline" className="flex items-center gap-2 transition-all duration-300">
            <MoreHorizontal size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Key Metrics */}
        <Card className="col-span-12 lg:col-span-4 transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg transition-all duration-300 hover:bg-primary/10">
                <p className="text-sm text-primary font-medium">Revenue YTD</p>
                <p className="text-2xl font-semibold text-primary">{clientData.revenueYTD}</p>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacts */}
        <Card className="col-span-12 lg:col-span-8 transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Contacts</CardTitle>
            <Button variant="outline" size="sm" className="transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientData.contacts.map((contact, index) => (
                <div key={index} className="p-4 border border-gray-100 rounded-lg hover:border-primary/20 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{contact.name}</h3>
                      <p className="text-sm text-gray-500">{contact.title}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="transition-all duration-300">
                      <Star size={16} />
                    </Button>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail size={14} className="mr-2" />
                      {contact.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone size={14} className="mr-2" />
                      {contact.phone}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interaction History */}
        <Card className="col-span-12 transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Recent Interactions</CardTitle>
            <Button variant="outline" size="sm" className="transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" />
              Log Interaction
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientData.interactions.map((interaction, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border-b last:border-b-0 hover:bg-gray-50/50 transition-all duration-300">
                  <div className="flex-shrink-0">
                    <Calendar size={20} className="text-primary" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{interaction.type}</p>
                        <p className="text-sm text-gray-500">{interaction.date}</p>
                      </div>
                      <span className="text-sm text-gray-500">Team: {interaction.team}</span>
                    </div>
                    <p className="mt-2 text-gray-600">{interaction.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};