import * as THREE from 'three';

const PLAYER_RADIUS = 0.45;
const EYE_HEIGHT = 1.62;

export class PlayerController {
  readonly group = new THREE.Group();

  private readonly keys = new Set<string>();
  private readonly velocity = new THREE.Vector3();
  private yaw = 0;
  private pitch = 0;
  private isPointerLocked = false;

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly domElement: HTMLElement,
    private readonly colliders: THREE.Box3[],
  ) {
    this.group.visible = false;
    this.group.add(this.camera);
    this.camera.position.set(0, EYE_HEIGHT, 0);
    this.bindInput();
  }

  setPosition(position: THREE.Vector3) {
    this.group.position.copy(position);
  }

  getMuzzleWorldPosition(target = new THREE.Vector3()) {
    return this.camera.getWorldPosition(target);
  }

  update(delta: number) {
    this.updateMovement(delta);
    this.updateCamera();
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
  }

  private bindInput() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    this.domElement.addEventListener('click', () => {
      if (!this.isPointerLocked) {
        this.domElement.requestPointerLock().catch(() => {
          this.isPointerLocked = false;
        });
      }
    });
  }

  private updateMovement(delta: number) {
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const input = new THREE.Vector3();

    if (this.keys.has('KeyW')) input.add(forward);
    if (this.keys.has('KeyS')) input.sub(forward);
    if (this.keys.has('KeyD')) input.add(right);
    if (this.keys.has('KeyA')) input.sub(right);

    if (input.lengthSq() > 0) {
      input.normalize();
      this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, input.x * 9.2, 0.24);
      this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, input.z * 9.2, 0.24);
    } else {
      this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, 0, 0.2);
      this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, 0, 0.2);
    }

    const nextPosition = this.group.position.clone().addScaledVector(this.velocity, delta);
    nextPosition.x = THREE.MathUtils.clamp(nextPosition.x, -24.5, 24.5);
    nextPosition.z = THREE.MathUtils.clamp(nextPosition.z, -35.5, 17.5);

    if (!this.collides(nextPosition)) {
      this.group.position.copy(nextPosition);
    }
  }

  private updateCamera() {
    this.group.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
    this.camera.rotation.y = 0;
    this.camera.rotation.z = 0;
  }

  private collides(position: THREE.Vector3) {
    const playerBox = new THREE.Box3(
      new THREE.Vector3(position.x - PLAYER_RADIUS, 0, position.z - PLAYER_RADIUS),
      new THREE.Vector3(position.x + PLAYER_RADIUS, EYE_HEIGHT, position.z + PLAYER_RADIUS),
    );

    return this.colliders.some((collider) => collider.intersectsBox(playerBox));
  }

  private readonly onKeyDown = (event: KeyboardEvent) => {
    this.keys.add(event.code);
  };

  private readonly onKeyUp = (event: KeyboardEvent) => {
    this.keys.delete(event.code);
  };

  private readonly onMouseMove = (event: MouseEvent) => {
    if (!this.isPointerLocked) return;
    this.yaw -= event.movementX * 0.0021;
    this.pitch = THREE.MathUtils.clamp(this.pitch - event.movementY * 0.0018, -1.3, 1.3);
  };

  private readonly onPointerLockChange = () => {
    this.isPointerLocked = document.pointerLockElement === this.domElement;
  };
}
