import * as THREE from 'three';

export type Target = {
  mesh: THREE.Mesh;
  baseColor: THREE.Color;
  hitUntil: number;
  value: number;
};

export type ShotResult = {
  hit: boolean;
  target?: Target;
  point?: THREE.Vector3;
};
