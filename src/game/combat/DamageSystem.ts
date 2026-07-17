export type DamageResult = {
  damage: number;
  nextHealth: number;
  destroyed: boolean;
};

export class DamageSystem {
  applyDamage(currentHealth: number, damage: number): DamageResult {
    const nextHealth = Math.max(0, currentHealth - damage);

    return {
      damage,
      nextHealth,
      destroyed: nextHealth <= 0,
    };
  }
}
