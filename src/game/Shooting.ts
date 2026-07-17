import * as THREE from 'three';
import type { WeaponController } from './combat/WeaponController';
import type { ShotResult, Target } from './types';

export class Shooting {
  private readonly raycaster = new THREE.Raycaster();
  private lastShotAt = -Infinity;
  private tracer?: THREE.Line;

  constructor(
    private readonly scene: THREE.Scene,
    private readonly targets: Target[],
    private readonly weapon: WeaponController,
  ) {}

  canShoot(now: number) {
    return this.weapon.canFire(now);
  }

  getCooldown(now: number) {
    return this.weapon.getCooldown(now);
  }

  shoot(camera: THREE.PerspectiveCamera, tracerOrigin: THREE.Vector3, now: number): ShotResult {
    if (!this.weapon.fire(now)) {
      return { hit: false };
    }

    this.lastShotAt = now;
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    this.raycaster.far = this.weapon.getDefinition().range;

    const activeTargets = this.targets.filter((target) => target.mesh.visible);
    const intersections = this.raycaster.intersectObjects(activeTargets.map((target) => target.mesh), false);
    const point =
      intersections[0]?.point ??
      this.raycaster.ray.origin.clone().addScaledVector(this.raycaster.ray.direction, 45);
    this.showTracer(tracerOrigin, point);

    if (!intersections.length) {
      return { hit: false, point };
    }

    const target = this.targets.find((candidate) => candidate.mesh === intersections[0].object);
    if (!target) {
      return { hit: false, point };
    }

    target.hitUntil = now + 180;
    target.respawnAt = now + 900;
    const material = target.mesh.material as THREE.MeshStandardMaterial;
    material.color.set(0xffd25a);
    material.emissive.set(0x4f2f00);
    return { hit: true, target, point };
  }

  update(now: number) {
    this.targets.forEach((target) => {
      if (!target.mesh.visible && target.respawnAt <= now) {
        target.parts.forEach((part) => {
          part.visible = true;
        });
      }

      if (target.hitUntil <= now) {
        if (target.respawnAt > now) {
          target.parts.forEach((part) => {
            part.visible = false;
          });
        }

        const material = target.mesh.material as THREE.MeshStandardMaterial;
        material.color.copy(target.baseColor);
        material.emissive.set(0x000000);
      }
    });

    if (this.tracer && now - this.lastShotAt > 65) {
      this.scene.remove(this.tracer);
      this.tracer.geometry.dispose();
      this.tracer = undefined;
    }
  }

  private showTracer(origin: THREE.Vector3, point: THREE.Vector3) {
    if (this.tracer) {
      this.scene.remove(this.tracer);
      this.tracer.geometry.dispose();
    }

    const geometry = new THREE.BufferGeometry().setFromPoints([origin, point]);
    const material = new THREE.LineBasicMaterial({ color: 0xf6d58b, transparent: true, opacity: 0.8 });
    this.tracer = new THREE.Line(geometry, material);
    this.scene.add(this.tracer);
  }
}
