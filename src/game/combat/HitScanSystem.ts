import * as THREE from 'three';

export type HitScanResult = {
  object?: THREE.Object3D;
  point: THREE.Vector3;
};

export class HitScanSystem {
  private readonly raycaster = new THREE.Raycaster();

  traceFromCamera(camera: THREE.PerspectiveCamera, objects: THREE.Object3D[], range: number): HitScanResult {
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    this.raycaster.far = range;

    const intersections = this.raycaster.intersectObjects(objects, false);
    const point =
      intersections[0]?.point ??
      this.raycaster.ray.origin.clone().addScaledVector(this.raycaster.ray.direction, range);

    return {
      object: intersections[0]?.object,
      point,
    };
  }
}
