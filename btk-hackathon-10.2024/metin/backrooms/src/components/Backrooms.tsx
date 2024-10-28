import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function Backrooms() {
  const floorRef = useRef<THREE.Mesh>(null);
  const wallTexture = useTexture({
    map: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=512',
  });

  // Repeat the texture
  wallTexture.map.wrapS = wallTexture.map.wrapT = THREE.RepeatWrapping;
  wallTexture.map.repeat.set(5, 5);

  useFrame((state) => {
    if (floorRef.current) {
      const time = state.clock.getElapsedTime();
      floorRef.current.position.y = Math.sin(time * 0.5) * 0.005;
    }
  });

  return (
    <group>
      {/* Floor */}
      <mesh
        ref={floorRef}
        rotation-x={-Math.PI * 0.5}
        position-y={0}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={2048}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050505"
          metalness={0.5}
        />
      </mesh>

      {/* Walls */}
      {Array.from({ length: 20 }).map((_, i) => (
        <group key={i} position-x={i * 4 - 40}>
          {/* Left wall */}
          <mesh position={[0, 2, -4]} castShadow receiveShadow>
            <boxGeometry args={[0.2, 4, 8]} />
            <meshStandardMaterial
              {...wallTexture}
              color="#454545"
              roughness={0.8}
            />
          </mesh>
          {/* Right wall */}
          <mesh position={[0, 2, 4]} castShadow receiveShadow>
            <boxGeometry args={[0.2, 4, 8]} />
            <meshStandardMaterial
              {...wallTexture}
              color="#454545"
              roughness={0.8}
            />
          </mesh>
        </group>
      ))}

      {/* Ceiling */}
      <mesh position={[0, 4, 0]} rotation-x={Math.PI * 0.5}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1a1a1a" roughness={1} />
      </mesh>
    </group>
  );
}