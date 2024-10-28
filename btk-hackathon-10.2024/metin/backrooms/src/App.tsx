import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import Experience from './components/Experience';
import { useStore } from './store';

function App() {
  const setMovement = useStore((state) => state.setMovement);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
          setMovement('moveForward', true);
          break;
        case 'KeyS':
          setMovement('moveBackward', true);
          break;
        case 'KeyA':
          setMovement('moveLeft', true);
          break;
        case 'KeyD':
          setMovement('moveRight', true);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
          setMovement('moveForward', false);
          break;
        case 'KeyS':
          setMovement('moveBackward', false);
          break;
        case 'KeyA':
          setMovement('moveLeft', false);
          break;
        case 'KeyD':
          setMovement('moveRight', false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [setMovement]);

  return (
    <div className="h-screen w-screen">
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 1000 }}
        className="bg-black"
      >
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        <div className="bg-black/80 text-white p-4 rounded-lg max-w-md text-center">
          <h1 className="text-xl font-bold mb-2">The Backrooms</h1>
          <p className="mb-4">Click to start exploring</p>
          <div className="text-sm opacity-75">
            WASD to move | Mouse to look around
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;