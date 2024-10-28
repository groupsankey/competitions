import { useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';

export default function Experience() {
  const { camera } = useThree();
  const { moveForward, moveBackward, moveLeft, moveRight, velocity } = useStore();
  
  useEffect(() => {
    camera.position.set(0, 1.7, 5);
  }, [camera]);

  useFrame((state, delta) => {
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3();
    const sideVector = new THREE.Vector3();
    const speed = 5;

    const { camera } = state;

    frontVector.setFromMatrixColumn(camera.matrix, 0);
    frontVector.crossVectors(camera.up, frontVector);

    direction.x = Number(moveLeft) - Number(moveRight);
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.normalize();

    if (moveForward || moveBackward) velocity.add(frontVector.multiplyScalar(-direction.z * speed * delta));
    if (moveLeft || moveRight) velocity.add(sideVector.multiplyScalar(-direction.x * speed * delta));

    camera.position.addScaledVector(velocity, delta);
    velocity.multiplyScalar(Math.pow(0.9, delta * 60));
  });

  return (
    <>
      <PointerLockControls />
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 2, 0]} intensity={0.1} color="#ff9000" />
      
      {/* Walls */}
      <mesh position={[0, 2, -5]}>
        <boxGeometry args={[10, 4, 0.2]} />
        <meshStandardMaterial color="#e0c080" roughness={0.8} />
      </mesh>
      <mesh position={[5, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[10, 4, 0.2]} />
        <meshStandardMaterial color="#e0c080" roughness={0.8} />
      </mesh>
      <mesh position={[-5, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[10, 4, 0.2]} />
        <meshStandardMaterial color="#e0c080" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2, 5]}>
        <boxGeometry args={[10, 4, 0.2]} />
        <meshStandardMaterial color="#e0c080" roughness={0.8} />
      </mesh>

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#c0a060" roughness={0.7} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#a08040" roughness={0.9} />
      </mesh>
    </>
  );
}