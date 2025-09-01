import React from 'react';

interface Option {
  codigo: string;
  nome: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

const Select: React.FC<SelectProps> = ({
  label,
  value,
  options,
  onChange,
  disabled = false,
  loading = false,
}) => {
  return (
  <div className="mb-2">
      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      {loading ? (
        <div className="p-3 border border-gray-700 rounded-lg bg-gray-800 text-center text-gray-500">Carregando...</div>
      ) : (
  <div className="w-full p-[1px] rounded-lg bg-gradient-to-r from-blue-500/30 to-purple-500/30">
          <select
            className="campo-selecao w-full p-3 bg-gray-800 text-white border-none rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            transition duration-300 ease-in-out"
            value={value}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            data-testid={`${label.toLowerCase()}-select`}
          >
            <option value="">Selecione {label.toLowerCase()}</option>
            {options.map(opt => (
              <option key={opt.codigo} value={opt.codigo}>
                {opt.nome}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default Select;