import React from 'react';
import { Input } from '@/components/ui/input';

interface ContactFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}

export const ContactField = ({
  value,
  onChange,
  placeholder,
  type = 'text'
}: ContactFieldProps) => {
  return (
    <Input 
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="transition-all duration-300"
    />
  );
};