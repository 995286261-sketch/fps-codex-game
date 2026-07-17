import * as THREE from 'three';
import { DamageSystem } from './combat/DamageSystem';
import { HitScanSystem } from './combat/HitScanSystem';
import type { WeaponController } from './combat/WeaponController';
import { WeaponEffects } from './effects/WeaponEffects';
import { TargetManager } from './targets/TargetManager';
import type { ShotResult } from './types';

export class Shooting {
  private readonly hitScan = new HitScanSystem();
  private readonly damage = new DamageSystem();
  private readonly effects: WeaponEffects;

  constructor(
    scene: THREE.Scene,
    private readonly targets: TargetManager,
    private readonly weapon: WeaponController,
  ) {
    this.effects = new WeaponEffects(scene);
  }

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

    const result = this.hitScan.traceFromCamera(
      camera,
      this.targets.getActiveMeshes(),
      this.weapon.getDefinition().range,
    );
    this.effects.showTracer(tracerOrigin, result.point, now);

    if (!result.object) {
      return { hit: false, point: result.point };
    }

    const target = this.targets.findByMesh(result.object);
    if (!target) {
      return { hit: false, point: result.point };
    }

    const damage = this.weapon.getDefinition().damage;
    const damageResult = this.damage.applyDamage(target.health, damage);
    this.targets.applyDamage(target, damageResult.nextHealth, damageResult.destroyed, now);

    return { hit: true, target, destroyed: damageResult.destroyed, point: result.point };
  }

  update(now: number) {
    this.targets.update(now);
    this.effects.update(now);
  }

  dispose() {
    this.effects.dispose();
  }
}
