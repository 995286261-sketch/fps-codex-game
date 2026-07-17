import * as THREE from 'three';

export type Target = {
  mesh: THREE.Mesh;
  parts: THREE.Object3D[];
  baseColor: THREE.Color;
  hitUntil: number;
  respawnAt: number;
  value: number;
};

export type ShotResult = {
  hit: boolean;
  target?: Target;
  point?: THREE.Vector3;
};
