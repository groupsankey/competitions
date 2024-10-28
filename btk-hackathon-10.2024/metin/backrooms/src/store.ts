import { create } from 'zustand';
import * as THREE from 'three';

interface GameStore {
  moveForward: boolean;
  moveBackward: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  velocity: THREE.Vector3;
  setMovement: (direction: string, value: boolean) => void;
}

export const useStore = create<GameStore>((set) => ({
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,
  velocity: new THREE.Vector3(),
  setMovement: (direction, value) =>
    set((state) => ({ ...state, [direction]: value })),
}));