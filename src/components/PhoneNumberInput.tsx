import { useState, useEffect } from 'react';

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  error?: string;
}

const countryCodes = [
  { code: '+91', country: 'India' },
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+61', country: 'Australia' },
  { code: '+86', country: 'China' },
  { code: '+81', country: 'Japan' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+39', country: 'Italy' },
  { code: '+34', country: 'Spain' },
];

export default function PhoneNumberInput({ 
  value, 
  onChange, 
  required = false,
  className = '',
  error
}: PhoneNumberInputProps) {
  const [countryCode, setCountryCode] = useState('+91');
  const [number, setNumber] = useState('');

  useEffect(() => {
    if (value) {
      // Extract country code and number from the full value
      const code = countryCodes.find(cc => value.startsWith(cc.code))?.code || '+91';
      const num = value.slice(code.length);
      setCountryCode(code);
      setNumber(num);
    }
  }, [value]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/\D/g, '').slice(0, 10);
    setNumber(newNumber);
    onChange(countryCode + newNumber);
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setCountryCode(newCode);
    onChange(newCode + number);
  };

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <select
          value={countryCode}
          onChange={handleCountryCodeChange}
          className={`px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
        >
          {countryCodes.map(({ code, country }) => (
            <option key={code} value={code}>
              {code} ({country})
            </option>
          ))}
        </select>
        <input
          type="tel"
          value={number}
          onChange={handleNumberChange}
          required={required}
          placeholder="Enter phone number"
          className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
} 