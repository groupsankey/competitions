import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Lighting() {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      const time = state.clock.getElapsedTime();
      lightRef.current.intensity = 0.8 + Math.sin(time * 2) * 0.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight
        ref={lightRef}
        position={[0, 3, 0]}
        intensity={0.8}
        distance={10}
        decay={2}
        color="#ff9f50"
        castShadow
      />
      <fog attach="fog" args={['#000000', 1, 20]} />
    </>
  );
}