import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { evaluate } from 'mathjs';

interface Graph3DProps {
  equation: string;
  xRange: [number, number];
  yRange: [number, number];
}

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.maxDistance = Infinity;
    controls.minDistance = 0.1;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.5;

    const generateSurface = () => {
      const resolution = 150;
      const geometry = new THREE.BufferGeometry();

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

    const gridHelper = new THREE.GridHelper(200, 200, 0x888888, 0x888888);
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);

    camera.position.set(50, 50, 50);
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

export default Graph3D;