
import React from 'react';

interface PasswordStrengthMeterProps {
  password?: string;
}

// You can enhance this logic in lib/validators.ts
const calculateStrength = (password: string) => {
  let score = 0;
  if (!password) return score;
  if (password.length > 8) score++;
  if (password.match(/[a-z]/)) score++;
  if (password.match(/[A-Z]/)) score++;
  if (password.match(/[0-9]/)) score++;
  if (password.match(/[^a-zA-Z0-9]/)) score++;
  return score;
};

const STRENGTH_LEVELS = [
  { label: 'Too weak', color: 'bg-red-500' },
  { label: 'Too weak', color: 'bg-red-500' },
  { label: 'Weak', color: 'bg-orange-500' },
  { label: 'Medium', color: 'bg-yellow-500' },
  { label: 'Strong', color: 'bg-green-500' },
  { label: 'Very Strong', color: 'bg-green-700' },
];

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password = '' }) => {
  const strength = calculateStrength(password);
  const level = STRENGTH_LEVELS[strength];

  if (!password) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${level.color}`}
          style={{ width: `${(strength / 5) * 100}%` }}
        ></div>
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-28 text-right">
        {level.label}
      </span>
    </div>
  );
};
