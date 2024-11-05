import React from 'react';

interface ModeSelectorProps {
  mode: '2d' | '3d';
  setMode: (mode: '2d' | '3d') => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, setMode }) => {
  return (
    <div className="flex space-x-4 justify-center">
      <button
        onClick={() => setMode('2d')}
        className={`px-6 py-3 rounded-lg transition-colors duration-200 font-medium ${
          mode === '2d' 
            ? 'bg-indigo-600 text-white shadow-lg' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        2D Graph
      </button>
      <button
        onClick={() => setMode('3d')}
        className={`px-6 py-3 rounded-lg transition-colors duration-200 font-medium ${
          mode === '3d' 
            ? 'bg-indigo-600 text-white shadow-lg' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        3D Graph
      </button>
    </div>
  );
};

export default ModeSelector;