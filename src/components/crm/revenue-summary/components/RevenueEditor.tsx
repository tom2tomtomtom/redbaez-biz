
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface RevenueEditorProps {
  clients: any[];
  month: string;
  type: 'actual' | 'forecast';
  onSave: (updatedClients: any[]) => void;
  onCancel: () => void;
}

export const RevenueEditor = ({ clients, month, type, onSave, onCancel }: RevenueEditorProps) => {
  const [editableClients, setEditableClients] = useState<any[]>([]);
  const columnName = `${type}_${month.toLowerCase()}`;
  
  useEffect(() => {
    // Transform clients data to include editable amounts
    const transformed = clients.map(client => ({
      id: client.id,
      name: client.name,
      amount: client[columnName] || 0
    }));
    setEditableClients(transformed);
  }, [clients, month, type, columnName]);

  const handleAmountChange = (id: number, value: string) => {
    const numericValue = value === '' ? 0 : Number(value);
    setEditableClients(prev => 
      prev.map(client => 
        client.id === id ? { ...client, amount: numericValue } : client
      )
    );
  };

  const handleSave = () => {
    onSave(editableClients);
  };

  // Filter to only show clients with values or where the amount is editable
  const displayClients = editableClients.filter(client => client.amount > 0 || true);

  return (
    <div className="space-y-4">
      <div className="max-h-[60vh] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead className="text-right">Amount ($)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayClients.map(client => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    value={client.amount}
                    onChange={(e) => handleAmountChange(client.id, e.target.value)}
                    className="w-32 ml-auto"
                    min="0"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};
