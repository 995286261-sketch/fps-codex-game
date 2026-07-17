import * as THREE from 'three';

const TRACER_LIFETIME_MS = 65;

export class WeaponEffects {
  private tracer?: THREE.Line;
  private tracerUntil = 0;

  constructor(private readonly scene: THREE.Scene) {}

  showTracer(origin: THREE.Vector3, point: THREE.Vector3, now: number) {
    this.clearTracer();

    const geometry = new THREE.BufferGeometry().setFromPoints([origin, point]);
    const material = new THREE.LineBasicMaterial({ color: 0xf6d58b, transparent: true, opacity: 0.8 });
    this.tracer = new THREE.Line(geometry, material);
    this.tracerUntil = now + TRACER_LIFETIME_MS;
    this.scene.add(this.tracer);
  }

  update(now: number) {
    if (this.tracer && this.tracerUntil <= now) {
      this.clearTracer();
    }
  }

  dispose() {
    this.clearTracer();
  }

  private clearTracer() {
    if (!this.tracer) return;

    this.scene.remove(this.tracer);
    this.tracer.geometry.dispose();
    (this.tracer.material as THREE.Material).dispose();
    this.tracer = undefined;
  }
}
