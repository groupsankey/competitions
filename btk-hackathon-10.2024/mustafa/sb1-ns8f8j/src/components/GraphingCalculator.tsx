import React, { useEffect, useRef, useState } from 'react';
import * as Plotly from 'plotly.js-dist';
import { evaluate } from 'mathjs';
import { ChevronDown, Cube, Grid } from 'lucide-react';

const GraphingCalculator: React.FC = () => {
  const plot2DRef = useRef<HTMLDivElement>(null);
  const plot3DRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'2d' | '3d'>('2d');
  const [equation, setEquation] = useState('x^2');
  const [xRange, setXRange] = useState([-10, 10]);
  const [yRange, setYRange] = useState([-10, 10]);
  const [error, setError] = useState('');

  const plot2D = () => {
    try {
      if (!plot2DRef.current) return;

      const xValues = [];
      const yValues = [];
      
      for (let x = xRange[0]; x <= xRange[1]; x += 0.1) {
        try {
          const y = evaluate(equation, { x });
          xValues.push(x);
          yValues.push(y);
        } catch {
          xValues.push(x);
          yValues.push(null);
        }
      }

      const trace = {
        x: xValues,
        y: yValues,
        type: 'scatter',
        mode: 'lines',
        line: { color: '#2563eb' }
      };

      const layout = {
        title: '2D Graph',
        width: plot2DRef.current.clientWidth,
        height: 500,
        xaxis: {
          range: xRange,
          title: 'x'
        },
        yaxis: {
          range: yRange,
          title: 'y'
        }
      };

      Plotly.newPlot(plot2DRef.current, [trace], layout);
      setError('');
    } catch (err) {
      setError('Invalid equation for 2D plotting');
    }
  };

  const plot3D = () => {
    try {
      if (!plot3DRef.current) return;

      const xValues = [];
      const yValues = [];
      const zValues = [];

      const xStep = (xRange[1] - xRange[0]) / 50;
      const yStep = (yRange[1] - yRange[0]) / 50;

      for (let x = xRange[0]; x <= xRange[1]; x += xStep) {
        const zRow = [];
        const xRow = [];
        const yRow = [];
        
        for (let y = yRange[0]; y <= yRange[1]; y += yStep) {
          try {
            const z = evaluate(equation, { x, y });
            zRow.push(z);
            xRow.push(x);
            yRow.push(y);
          } catch {
            zRow.push(null);
            xRow.push(x);
            yRow.push(y);
          }
        }
        
        zValues.push(zRow);
        xValues.push(xRow);
        yValues.push(yRow);
      }

      const data = [{
        type: 'surface',
        x: xValues,
        y: yValues,
        z: zValues,
        colorscale: 'Viridis'
      }];

      const layout = {
        title: '3D Graph',
        width: plot3DRef.current.clientWidth,
        height: 500,
        scene: {
          camera: {
            eye: { x: 1.5, y: 1.5, z: 1.5 }
          }
        }
      };

      Plotly.newPlot(plot3DRef.current, data, layout);
      setError('');
    } catch (err) {
      setError('Invalid equation for 3D plotting');
    }
  };

  const handlePlot = () => {
    if (mode === '2d') {
      plot2D();
    } else {
      plot3D();
    }
  };

  useEffect(() => {
    handlePlot();
  }, [mode]);

  useEffect(() => {
    const handleResize = () => {
      handlePlot();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [equation, xRange, yRange, mode]);

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mathematical Graphing Calculator</h2>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setMode('2d')}
              className={`flex items-center px-4 py-2 rounded-lg ${
                mode === '2d' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Grid className="w-5 h-5 mr-2" />
              2D Graph
            </button>
            <button
              onClick={() => setMode('3d')}
              className={`flex items-center px-4 py-2 rounded-lg ${
                mode === '3d' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Cube className="w-5 h-5 mr-2" />
              3D Graph
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Enter equation {mode === '2d' ? 'f(x)' : 'f(x,y)'}:
            </label>
            <input
              type="text"
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
              placeholder={mode === '2d' ? 'e.g., x^2' : 'e.g., x^2 + y^2'}
              className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                X Range:
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={xRange[0]}
                  onChange={(e) => setXRange([Number(e.target.value), xRange[1]])}
                  className="w-24 px-2 py-1 border rounded"
                />
                <span className="self-center">to</span>
                <input
                  type="number"
                  value={xRange[1]}
                  onChange={(e) => setXRange([xRange[0], Number(e.target.value)])}
                  className="w-24 px-2 py-1 border rounded"
                />
              </div>
            </div>

            {mode === '3d' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Y Range:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={yRange[0]}
                    onChange={(e) => setYRange([Number(e.target.value), yRange[1]])}
                    className="w-24 px-2 py-1 border rounded"
                  />
                  <span className="self-center">to</span>
                  <input
                    type="number"
                    value={yRange[1]}
                    onChange={(e) => setYRange([yRange[0], Number(e.target.value)])}
                    className="w-24 px-2 py-1 border rounded"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handlePlot}
            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Plot Graph
          </button>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {mode === '2d' ? (
          <div ref={plot2DRef} className="w-full h-[500px] border rounded-lg p-4" />
        ) : (
          <div ref={plot3DRef} className="w-full h-[500px] border rounded-lg p-4" />
        )}
      </div>
    </div>
  );
};

export default GraphingCalculator;