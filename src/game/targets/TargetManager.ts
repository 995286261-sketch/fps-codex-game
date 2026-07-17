import * as THREE from 'three';
import type { Target } from '../types';

const HIT_FLASH_MS = 180;
const RESPAWN_DELAY_MS = 900;

export class TargetManager {
  constructor(private readonly targets: Target[]) {}

  getActiveMeshes() {
    return this.targets.filter((target) => target.mesh.visible).map((target) => target.mesh);
  }

  findByMesh(mesh: THREE.Object3D) {
    return this.targets.find((target) => target.mesh === mesh);
  }

  registerHit(target: Target, now: number) {
    target.hitUntil = now + HIT_FLASH_MS;

    const material = target.mesh.material as THREE.MeshStandardMaterial;
    material.color.set(0xffd25a);
    material.emissive.set(0x4f2f00);
  }

  applyDamage(target: Target, nextHealth: number, destroyed: boolean, now: number) {
    target.health = nextHealth;
    this.registerHit(target, now);

    if (destroyed) {
      target.respawnAt = now + RESPAWN_DELAY_MS;
    }
  }

  update(now: number) {
    this.targets.forEach((target) => {
      if (!target.mesh.visible && target.respawnAt <= now) {
        target.health = target.maxHealth;
        this.setTargetVisible(target, true);
      }

      if (target.hitUntil <= now) {
        if (target.respawnAt > now) {
          this.setTargetVisible(target, false);
        }

        const material = target.mesh.material as THREE.MeshStandardMaterial;
        material.color.copy(target.baseColor);
        material.emissive.set(0x000000);
      }
    });
  }

  private setTargetVisible(target: Target, visible: boolean) {
    target.parts.forEach((part) => {
      part.visible = visible;
    });
  }
}
