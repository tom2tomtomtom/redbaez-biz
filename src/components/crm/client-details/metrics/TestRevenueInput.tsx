import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export const TestRevenueInput = () => {
  const [value, setValue] = useState('');
  const [showDebug, setShowDebug] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Raw input value:', e.target.value);
    console.log('Input value type:', typeof e.target.value);
    setValue(e.target.value);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Test Revenue Input</label>
        <Input
          type="number"
          value={value}
          onChange={handleChange}
          className="w-full max-w-xs"
          placeholder="Enter amount"
          min="0"
          step="any"
        />
      </div>
      
      {showDebug && (
        <div className="text-sm space-y-1 p-2 bg-gray-50 rounded">
          <p>Current value: {value}</p>
          <p>Value type: {typeof value}</p>
          <p>Parsed as number: {Number(value)}</p>
          <p>Is valid number: {!isNaN(Number(value)) ? 'Yes' : 'No'}</p>
        </div>
      )}
    </Card>
  );
};