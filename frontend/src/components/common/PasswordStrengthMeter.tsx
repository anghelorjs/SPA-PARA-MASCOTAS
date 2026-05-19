import { useEffect, useState } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

interface StrengthLevel {
  score: number;
  label: string;
  color: string;
  bgColor: string;
}

const checkStrength = (password: string): StrengthLevel => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 2) {
    return { score, label: 'Muy débil', color: '#ef4444', bgColor: 'bg-red-500' };
  } else if (score <= 4) {
    return { score, label: 'Débil', color: '#f97316', bgColor: 'bg-orange-500' };
  } else if (score <= 6) {
    return { score, label: 'Media', color: '#eab308', bgColor: 'bg-yellow-500' };
  } else if (score <= 8) {
    return { score, label: 'Fuerte', color: '#22c55e', bgColor: 'bg-green-500' };
  } else {
    return { score, label: 'Muy fuerte', color: '#10b981', bgColor: 'bg-emerald-500' };
  }
};

export const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  const [strength, setStrength] = useState<StrengthLevel>({ score: 0, label: 'Muy débil', color: '#ef4444', bgColor: 'bg-red-500' });
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    setStrength(checkStrength(password));
    setRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    });
  }, [password]);

  const percentage = (strength.score / 10) * 100;

  return (
    <div className="mt-2 space-y-2">
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${strength.bgColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">Fortaleza:</span>
        <span className="text-xs font-medium" style={{ color: strength.color }}>
          {strength.label}
        </span>
      </div>
      
      <div className="text-xs space-y-1 mt-2">
        <p className="font-medium text-gray-600 mb-1">Requisitos:</p>
        <div className="grid grid-cols-2 gap-1">
          <Requirement met={requirements.length} text="Mínimo 8 caracteres" />
          <Requirement met={requirements.uppercase} text="Al menos 1 mayúscula" />
          <Requirement met={requirements.lowercase} text="Al menos 1 minúscula" />
          <Requirement met={requirements.number} text="Al menos 1 número" />
          <Requirement met={requirements.special} text="Al menos 1 símbolo" />
        </div>
      </div>
    </div>
  );
};

const Requirement = ({ met, text }: { met: boolean; text: string }) => (
  <div className="flex items-center gap-1.5">
    {met ? (
      <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )}
    <span className={met ? 'text-green-600' : 'text-gray-400'}>{text}</span>
  </div>
);