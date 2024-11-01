import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  const data = useMemo(() => {
    const points = 1000; // Reduced points for better performance
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

    return [{ x, y, type: 'scatter', mode: 'lines', name: equation }];
  }, [equation, xRange]);

  return (
    <Plot
      data={data}
      layout={{
        title: '2D Graph',
        xaxis: { 
          title: 'x',
          gridcolor: '#f0f0f0',
          zerolinecolor: '#e0e0e0',
          autorange: true,
          range: [-10, 10]
        },
        yaxis: { 
          title: 'y',
          gridcolor: '#f0f0f0',
          zerolinecolor: '#e0e0e0',
          autorange: true,
          range: [-10, 10]
        },
        plot_bgcolor: '#ffffff',
        paper_bgcolor: '#ffffff',
        autosize: true,
        height: 500,
        margin: { l: 50, r: 50, t: 50, b: 50 },
        showlegend: true,
        hovermode: 'closest'
      }}
      useResizeHandler
      className="w-full"
      config={{
        scrollZoom: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToAdd: ['pan2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d'],
        toImageButtonOptions: {
          format: 'png',
          filename: '2d_graph',
          height: 1000,
          width: 1000,
          scale: 2
        }
      }}
    />
  );
};

const Graph3D: React.FC<Graph3DProps> = ({ equation, xRange, yRange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      10000
    );
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      logarithmicDepthBuffer: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance

    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.maxDistance = Infinity;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.5;

    // Optimized surface generation
    const generateSurface = () => {
      const resolution = 100; // Reduced resolution for better performance
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const indices = [];
      const colors = [];

      // Use TypedArrays for better performance
      const verticesArray = new Float32Array(resolution * resolution * 3);
      const colorsArray = new Float32Array(resolution * resolution * 3);
      let vertexIndex = 0;
      let colorIndex = 0;

      for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
          const x = xRange[0] + (i / (resolution - 1)) * (xRange[1] - xRange[0]);
          const y = yRange[0] + (j / (resolution - 1)) * (yRange[1] - yRange[0]);
          try {
            const z = evaluate(equation, { x, y });
            verticesArray[vertexIndex] = x;
            verticesArray[vertexIndex + 1] = y;
            verticesArray[vertexIndex + 2] = z;
            
            const hue = (z + 10) / 20;
            const color = new THREE.Color().setHSL(hue, 1, 0.5);
            colorsArray[colorIndex] = color.r;
            colorsArray[colorIndex + 1] = color.g;
            colorsArray[colorIndex + 2] = color.b;
          } catch {
            verticesArray[vertexIndex] = x;
            verticesArray[vertexIndex + 1] = y;
            verticesArray[vertexIndex + 2] = 0;
            colorsArray[colorIndex] = 0;
            colorsArray[colorIndex + 1] = 0;
            colorsArray[colorIndex + 2] = 0;
          }
          vertexIndex += 3;
          colorIndex += 3;
        }
      }

      // Optimized index generation
      const indexArray = new Uint32Array((resolution - 1) * (resolution - 1) * 6);
      let indexCount = 0;
      for (let i = 0; i < resolution - 1; i++) {
        for (let j = 0; j < resolution - 1; j++) {
          const a = i * resolution + j;
          const b = i * resolution + j + 1;
          const c = (i + 1) * resolution + j;
          const d = (i + 1) * resolution + j + 1;

          indexArray[indexCount++] = a;
          indexArray[indexCount++] = b;
          indexArray[indexCount++] = c;
          indexArray[indexCount++] = b;
          indexArray[indexCount++] = d;
          indexArray[indexCount++] = c;
        }
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
      geometry.setIndex(new THREE.BufferAttribute(indexArray, 1));
      geometry.computeVertexNormals();

      return geometry;
    };

    const geometry = generateSurface();
    const material = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      vertexColors: true,
      shininess: 80,
      specular: 0x444444,
      flatShading: false,
      transparent: true,
      opacity: 0.9
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(1, 1, 1);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);

    const gridHelper = new THREE.GridHelper(50, 50, 0x888888, 0x888888);
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(25);
    scene.add(axesHelper);

    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [equation, xRange, yRange]);

  return <div ref={containerRef} className="w-full h-[600px]" />;
};

const GraphingCalculator: React.FC = () => {
  const [equation2D, setEquation2D] = useState('sin(x)');
  const [equation3D, setEquation3D] = useState('sin(sqrt(x^2 + y^2))');
  const [mode, setMode] = useState<'2d' | '3d'>('3d');
  const [xRange, setXRange] = useState<[number, number]>([-10, 10]);
  const [yRange, setYRange] = useState<[number, number]>([-10, 10]);

  const handleEquationChange = (e: React.ChangeEvent<HTMLInputElement>, is3D: boolean) => {
    const value = e.target.value;
    if (is3D) {
      setEquation3D(value);
    } else {
      setEquation2D(value);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg mt-16">
      <div className="mb-6 space-y-4">
        <div className="bg-gray-50 p-6 rounded-xl">
          {mode === '2d' ? (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                2D Equation (use 'x' as variable)
              </label>
              <input
                type="text"
                value={equation2D}
                onChange={(e) => handleEquationChange(e, false)}
                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., sin(x), x^2, tan(x)"
              />
              <Graph2D equation={equation2D} xRange={xRange} />
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                3D Equation (use 'x' and 'y' as variables)
              </label>
              <input
                type="text"
                value={equation3D}
                onChange={(e) => handleEquationChange(e, true)}
                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., sin(x) * cos(y), x^2 + y^2"
              />
              <Graph3D equation={equation3D} xRange={xRange} yRange={yRange} />
            </div>
          )}
        </div>
        
        <div className="flex space-x-4 justify-center mt-6">
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
      </div>
    </div>
  );
};

export default GraphingCalculator;