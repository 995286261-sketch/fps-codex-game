import * as THREE from 'three';

export type Target = {
  id: string;
  mesh: THREE.Mesh;
  parts: THREE.Object3D[];
  baseColor: THREE.Color;
  maxHealth: number;
  health: number;
  hitUntil: number;
  respawnAt: number;
  value: number;
};

export type ShotResult = {
  hit: boolean;
  target?: Target;
  destroyed?: boolean;
  point?: THREE.Vector3;
};

export type HitResult = {
  target: Target;
  point: THREE.Vector3;
};
