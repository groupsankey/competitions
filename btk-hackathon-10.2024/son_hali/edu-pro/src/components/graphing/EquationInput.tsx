import React from 'react';
import { X } from 'lucide-react';

interface Equation {
  id: string;
  expression: string;
  color: string;
}

interface EquationInputProps {
  mode: '2d' | '3d';
  equation: Equation;
  onChange: (value: string) => void;
  onRemove?: () => void;
}

const EquationInput: React.FC<EquationInputProps> = ({
  mode,
  equation,
  onChange,
  onRemove,
}) => {
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {mode === '2d' ? '2D Equation (use x as variable)' : '3D Equation (use x and y as variables)'}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={equation.expression}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={mode === '2d' ? 'e.g., sin(x), x^2, tan(x)' : 'e.g., sin(x) * cos(y), x^2 + y^2'}
          style={{ borderColor: equation.color }}
        />
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove equation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default EquationInput;