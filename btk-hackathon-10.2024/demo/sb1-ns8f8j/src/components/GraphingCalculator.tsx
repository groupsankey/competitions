import React, { useState } from 'react';
import Graph2D from './graphing/Graph2D';
import Graph3D from './graphing/Graph3D';
import ModeSelector from './graphing/ModeSelector';
import EquationInput from './graphing/EquationInput';
import { Plus } from 'lucide-react';

interface Equation2D {
  id: string;
  expression: string;
  color: string;
}

const GraphingCalculator: React.FC = () => {
  const [equations2D, setEquations2D] = useState<Equation2D[]>([
    { id: '1', expression: 'sin(x)', color: '#1e40af' }
  ]);
  const [equation3D, setEquation3D] = useState('sin(sqrt(x^2 + y^2))');
  const [mode, setMode] = useState<'2d' | '3d'>('3d');
  const [xRange, setXRange] = useState<[number, number]>([-100, 100]);
  const [yRange, setYRange] = useState<[number, number]>([-100, 100]);

  const handleEquationChange = (id: string, value: string) => {
    if (mode === '2d') {
      setEquations2D(prev => prev.map(eq => 
        eq.id === id ? { ...eq, expression: value } : eq
      ));
    } else {
      setEquation3D(value);
    }
  };

  const addNewEquation = () => {
    const newId = (equations2D.length + 1).toString();
    const colors = ['#1e40af', '#047857', '#b91c1c', '#7c2d12', '#6b21a8', '#1e3a8a'];
    const newColor = colors[equations2D.length % colors.length];
    
    setEquations2D(prev => [...prev, {
      id: newId,
      expression: '',
      color: newColor
    }]);
  };

  const removeEquation = (id: string) => {
    setEquations2D(prev => prev.filter(eq => eq.id !== id));
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg mt-20">
      <div className="mb-6 space-y-4">
        <ModeSelector mode={mode} setMode={setMode} />
        
        <div className="bg-gray-50 p-6 rounded-xl">
          {mode === '2d' ? (
            <div className="space-y-4">
              {equations2D.map((eq) => (
                <EquationInput
                  key={eq.id}
                  mode="2d"
                  equation={eq}
                  onChange={(value) => handleEquationChange(eq.id, value)}
                  onRemove={equations2D.length > 1 ? () => removeEquation(eq.id) : undefined}
                />
              ))}
              
              {equations2D.length < 6 && (
                <button
                  onClick={addNewEquation}
                  className="flex items-center justify-center w-full p-2 mt-4 text-indigo-600 border-2 border-dashed border-indigo-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Another Equation
                </button>
              )}
              
              <Graph2D equations={equations2D} xRange={xRange} />
            </div>
          ) : (
            <div>
              <EquationInput
                mode="3d"
                equation={{ id: '3d', expression: equation3D, color: '#1e40af' }}
                onChange={(value) => setEquation3D(value)}
              />
              <Graph3D equation={equation3D} xRange={xRange} yRange={yRange} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphingCalculator;