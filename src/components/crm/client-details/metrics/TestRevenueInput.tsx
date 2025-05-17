import logger from '@/utils/logger';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export const TestRevenueInput = () => {
  const [value, setValue] = useState('');
  const [showDebug, setShowDebug] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    logger.info('Raw input value:', e.target.value);
    logger.info('Input value type:', typeof e.target.value);
    logger.info('Parsed number:', parseFloat(e.target.value));
    setValue(e.target.value);
  };

  return (
    <Card className="p-4 space-y-4 mb-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Revenue Input Test</label>
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
          <p>Raw value: {value}</p>
          <p>Value type: {typeof value}</p>
          <p>Parsed as float: {parseFloat(value) || 'NaN'}</p>
          <p>Is valid number: {!isNaN(parseFloat(value)) ? 'Yes' : 'No'}</p>
          <p>Formatted: ${parseFloat(value).toLocaleString() || '0'}</p>
        </div>
      )}
    </Card>
  );
};