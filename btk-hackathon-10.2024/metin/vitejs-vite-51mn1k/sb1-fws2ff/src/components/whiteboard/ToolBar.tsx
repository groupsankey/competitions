import React from 'react';
import { Square, Circle, Triangle, Type, Pencil, Eraser } from 'lucide-react';

interface ToolBarProps {
  selectedTool: string;
  color: string;
  brushSize: number;
  onToolSelect: (tool: string) => void;
  onColorSelect: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onClear: () => void;
}

const ToolBar: React.FC<ToolBarProps> = ({
  selectedTool,
  color,
  brushSize,
  onToolSelect,
  onColorSelect,
  onBrushSizeChange,
  onClear
}) => {
  const tools = [
    { id: 'pen', icon: Pencil, label: 'Pen' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'triangle', icon: Triangle, label: 'Triangle' },
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'
  ];

  return (
    <div className="flex flex-col p-4 bg-white shadow-md w-64 mt-16 space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium text-gray-700">Tools</h3>
        <div className="grid grid-cols-3 gap-2">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={`p-2 rounded-lg flex flex-col items-center justify-center ${
                selectedTool === tool.id ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'
              }`}
              title={tool.label}
            >
              <tool.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium text-gray-700">Colors</h3>
        <div className="grid grid-cols-5 gap-2">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => onColorSelect(c)}
              className={`w-8 h-8 rounded-full border-2 ${
                color === c ? 'border-gray-400' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium text-gray-700">Brush Size</h3>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => onBrushSizeChange(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="text-sm text-gray-500 text-center">{brushSize}px</div>
      </div>

      <button
        onClick={onClear}
        className="mt-auto w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
      >
        Clear Canvas
      </button>
    </div>
  );
};

export default ToolBar;