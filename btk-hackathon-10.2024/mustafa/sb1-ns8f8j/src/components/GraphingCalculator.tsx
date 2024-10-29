import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { evaluate } from 'mathjs';

interface Graph2DProps {
  equation: string;
  xRange: [number, number];
}

interface Graph3DProps {
  equation: string;
  xRange: [number, number];
  yRange: [number, number];
}

const Graph2D: React.FC<Graph2DProps> = ({ equation, xRange }) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    try {
      const points = 1000;
      const x = Array.from({ length: points }, (_, i) => 
        xRange[0] + (i * (xRange[1] - xRange[0])) / (points - 1)
      );
      
      const y = x.map(xVal => {
        try {
          return evaluate(equation, { x: xVal });
        } catch {
          return null;
        }
      });

      setData([{
        x,
        y,
        type: 'scatter',
        mode: 'lines',
        name: equation,
        line: { color: '#1e40af' }
      }]);
    } catch (error) {
      console.error('Error plotting equation:', error);
    }
  }, [equation, xRange]);

  return (
    <Plot
      data={data}
      layout={{
        title: '2D Graph',
        xaxis: { title: 'x' },
        yaxis: { title: 'y' },
        autosize: true,
        height: 500,
        margin: { l: 50, r: 50, t: 50, b: 50 }
      }}
      useResizeHandler
      className="w-full"
    />
  );
};

const Graph3D: React.FC<Graph3DProps> = ({ equation, xRange, yRange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;

    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Create surface geometry
    const resolution = 50;
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];

    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const x = xRange[0] + (i / (resolution - 1)) * (xRange[1] - xRange[0]);
        const y = yRange[0] + (j / (resolution - 1)) * (yRange[1] - yRange[0]);
        try {
          const z = evaluate(equation, { x, y });
          vertices.push(x, y, z);
        } catch {
          vertices.push(x, y, 0);
        }
      }
    }

    // Create indices for triangles
    for (let i = 0; i < resolution - 1; i++) {
      for (let j = 0; j < resolution - 1; j++) {
        const a = i * resolution + j;
        const b = i * resolution + j + 1;
        const c = (i + 1) * resolution + j;
        const d = (i + 1) * resolution + j + 1;

        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
      color: 0x1e40af,
      side: THREE.DoubleSide,
      wireframe: true
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    camera.position.set(5, 5, 5);
    controls.update();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [equation, xRange, yRange]);

  return <div ref={containerRef} className="w-full h-[500px]" />;
};

const GraphingCalculator: React.FC = () => {
  const [equation2D, setEquation2D] = useState('x^2');
  const [equation3D, setEquation3D] = useState('sin(x) * cos(y)');
  const [mode, setMode] = useState<'2d' | '3d'>('2d');

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-6 space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setMode('2d')}
            className={`px-4 py-2 rounded-lg ${
              mode === '2d' ? 'bg-indigo-600 text-white' : 'bg-gray-100'
            }`}
          >
            2D Graph
          </button>
          <button
            onClick={() => setMode('3d')}
            className={`px-4 py-2 rounded-lg ${
              mode === '3d' ? 'bg-indigo-600 text-white' : 'bg-gray-100'
            }`}
          >
            3D Graph
          </button>
        </div>

        {mode === '2d' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2D Equation (use 'x' as variable)
            </label>
            <input
              type="text"
              value={equation2D}
              onChange={(e) => setEquation2D(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="e.g., x^2, sin(x)"
            />
            <Graph2D equation={equation2D} xRange={[-10, 10]} />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              3D Equation (use 'x' and 'y' as variables)
            </label>
            <input
              type="text"
              value={equation3D}
              onChange={(e) => setEquation3D(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="e.g., sin(x) * cos(y)"
            />
            <Graph3D equation={equation3D} xRange={[-5, 5]} yRange={[-5, 5]} />
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphingCalculator;