import type { WeaponDefinition } from './CombatTypes';

export class WeaponController {
  private lastShotAt = -Infinity;

  constructor(private readonly definition: WeaponDefinition) {}

  canFire(now: number) {
    return now - this.lastShotAt > this.definition.fireIntervalMs;
  }

  fire(now: number) {
    if (!this.canFire(now)) {
      return false;
    }

    this.lastShotAt = now;
    return true;
  }

  getCooldown(now: number) {
    return Math.max(0, this.definition.fireIntervalMs - (now - this.lastShotAt));
  }

  getDefinition() {
    return this.definition;
  }
}
