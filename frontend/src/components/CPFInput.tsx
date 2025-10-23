import React, { useState, useEffect } from 'react';

interface CPFInputProps {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

function sanitizeCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}


function formatCPF(cpf: string): string {
  const sanitized = sanitizeCPF(cpf);
  
  if (sanitized.length <= 3) {
    return sanitized;
  } else if (sanitized.length <= 6) {
    return `${sanitized.slice(0, 3)}.${sanitized.slice(3)}`;
  } else if (sanitized.length <= 9) {
    return `${sanitized.slice(0, 3)}.${sanitized.slice(3, 6)}.${sanitized.slice(6)}`;
  } else {
    return `${sanitized.slice(0, 3)}.${sanitized.slice(3, 6)}.${sanitized.slice(6, 9)}-${sanitized.slice(9, 11)}`;
  }
}


function validarCPF(cpf: string): boolean {
  const sanitized = sanitizeCPF(cpf);
  
  if (sanitized.length !== 11) {
    return false;
  }
  
 
  if (/^(\d)\1{10}$/.test(sanitized)) {
    return false;
  }
  

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(sanitized.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digitoVerificador1 = resto >= 10 ? 0 : resto;
  
  if (digitoVerificador1 !== parseInt(sanitized.charAt(9))) {
    return false;
  }
  

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(sanitized.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digitoVerificador2 = resto >= 10 ? 0 : resto;
  
  if (digitoVerificador2 !== parseInt(sanitized.charAt(10))) {
    return false;
  }
  
  return true;
}


export const CPFInput: React.FC<CPFInputProps> = ({
  value,
  onChange,
  name = 'cpf',
  label = 'CPF',
  required = true,
  disabled = false,
  error: externalError,
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [internalError, setInternalError] = useState('');
  const [touched, setTouched] = useState(false);


  useEffect(() => {
    setDisplayValue(formatCPF(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const sanitized = sanitizeCPF(input);
    

    if (sanitized.length > 11) {
      return;
    }
    

    setDisplayValue(formatCPF(input));
    

    onChange(sanitized);
    

    if (internalError) {
      setInternalError('');
    }
  };

  const handleBlur = () => {
    setTouched(true);
    
    const sanitized = sanitizeCPF(value);
    
    if (!sanitized && required) {
      setInternalError('CPF é obrigatório');
      return;
    }
    
    if (sanitized && sanitized.length > 0 && sanitized.length < 11) {
      setInternalError('CPF incompleto');
      return;
    }
    
    if (sanitized && !validarCPF(sanitized)) {
      setInternalError('CPF inválido');
      return;
    }
    
    setInternalError('');
  };

  const errorToShow = externalError || (touched ? internalError : '');
  const hasError = !!errorToShow;

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={name}
        name={name}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder="000.000.000-00"
        maxLength={14} 
        className={`
          w-full px-4 py-2 rounded-lg border
          bg-gray-700 text-white
          focus:outline-none focus:ring-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          ${hasError 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
          }
        `}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : undefined}
      />
      
      {hasError && (
        <p
          id={`${name}-error`}
          className="mt-1 text-sm text-red-500"
          role="alert"
        >
          {errorToShow}
        </p>
      )}
      

      {!hasError && touched && displayValue && (
        <p className="mt-1 text-xs text-gray-400">
          O CPF é protegido pela LGPD e usado apenas para fins administrativos
        </p>
      )}
    </div>
  );
};

export default CPFInput;
export { sanitizeCPF, formatCPF, validarCPF };
