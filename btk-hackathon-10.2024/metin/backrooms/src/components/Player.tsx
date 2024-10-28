import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';

const SPEED = 5;
const keys = {
  forward: 'KeyW',
  backward: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  sprint: 'ShiftLeft',
};

export function Player() {
  const { camera } = useThree();
  const moveRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  });
  const rotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (keys.forward === e.code) moveRef.current.forward = true;
      if (keys.backward === e.code) moveRef.current.backward = true;
      if (keys.left === e.code) moveRef.current.left = true;
      if (keys.right === e.code) moveRef.current.right = true;
      if (keys.sprint === e.code) moveRef.current.sprint = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (keys.forward === e.code) moveRef.current.forward = false;
      if (keys.backward === e.code) moveRef.current.backward = false;
      if (keys.left === e.code) moveRef.current.left = false;
      if (keys.right === e.code) moveRef.current.right = false;
      if (keys.sprint === e.code) moveRef.current.sprint = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      rotationRef.current.x -= e.movementY * 0.002;
      rotationRef.current.y -= e.movementX * 0.002;

      rotationRef.current.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, rotationRef.current.x)
      );
    };

    const handlePointerLock = () => {
      document.body.requestPointerLock();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handlePointerLock);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handlePointerLock);
    };
  }, []);

  useFrame((state, delta) => {
    // Update rotation
    camera.rotation.x = rotationRef.current.x;
    camera.rotation.y = rotationRef.current.y;

    // Calculate movement
    const speed = moveRef.current.sprint ? SPEED * 2 : SPEED;
    const forward = new THREE.Vector3(0, 0, -1)
      .applyQuaternion(camera.quaternion)
      .multiplyScalar(delta * speed);
    const right = new THREE.Vector3(1, 0, 0)
      .applyQuaternion(camera.quaternion)
      .multiplyScalar(delta * speed);

    if (moveRef.current.forward) camera.position.add(forward);
    if (moveRef.current.backward) camera.position.sub(forward);
    if (moveRef.current.right) camera.position.add(right);
    if (moveRef.current.left) camera.position.sub(right);

    // Keep player at constant height
    camera.position.y = 1.6;
  });

  return null;
}