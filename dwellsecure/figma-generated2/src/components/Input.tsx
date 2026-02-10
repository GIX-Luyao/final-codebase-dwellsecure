import React from 'react';
import './Input.css';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel';
  required?: boolean;
  multiline?: boolean;
  rows?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
  multiline = false,
  rows = 3
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      {multiline ? (
        <textarea
          className="input-field textarea"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          rows={rows}
          required={required}
        />
      ) : (
        <input
          type={type}
          className="input-field"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          required={required}
        />
      )}
    </div>
  );
};
