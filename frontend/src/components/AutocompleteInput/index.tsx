import { useState, useRef, useEffect } from 'react';

interface AutocompleteOption {
  id: string;
  nome: string;
  matricula: string;
  polo?: string;
}

interface AutocompleteInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  options: AutocompleteOption[];
  onSelect: (option: AutocompleteOption) => void;
  onChange: (value: string) => void;
  required?: boolean;
}

export const AutocompleteInput = ({
  id,
  label,
  placeholder,
  value,
  options,
  onSelect,
  onChange,
  required = false,
}: AutocompleteInputProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const filteredOptions = value.trim() === '' 
    ? [] 
    : options.filter(option => 
        option.nome.toLowerCase().includes(value.toLowerCase()) || 
        (option.matricula && option.matricula.toLowerCase().includes(value.toLowerCase()))
      ).slice(0, 5);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowDropdown(true);
  };

  const handleSelect = (option: AutocompleteOption) => {
    onSelect(option);
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={id} className="block text-gray-300 text-sm font-semibold mb-2">
        {label} {required && '*'}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
        placeholder={placeholder}
        autoComplete="off"
        required={required}
        aria-required={required}
      />
      
      {showDropdown && filteredOptions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-gray-700 rounded-lg shadow-xl border border-gray-600 max-h-60 overflow-y-auto scrollbar-styled z-50">
          {filteredOptions.map(option => (
            <button
              key={option.id}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-gray-600 text-white transition-colors border-b border-gray-600 last:border-b-0"
              onClick={() => handleSelect(option)}
            >
              <div className="font-semibold">{option.nome}</div>
              <div className="text-xs text-gray-300">Matrícula: {option.matricula}</div>
              {option.polo && <div className="text-xs text-gray-400">Polo: {option.polo}</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
