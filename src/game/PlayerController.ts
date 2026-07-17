import * as THREE from 'three';

const PLAYER_RADIUS = 0.45;
const EYE_HEIGHT = 1.62;
const CROUCH_EYE_HEIGHT = 1.05;
const STANDING_HEIGHT = 1.8;
const CROUCH_HEIGHT = 1.18;
const GRAVITY = 24;
const JUMP_SPEED = 7.4;

export class PlayerController {
  readonly group = new THREE.Group();

  private readonly keys = new Set<string>();
  private readonly velocity = new THREE.Vector3();
  private verticalVelocity = 0;
  private eyeHeight = EYE_HEIGHT;
  private isGrounded = true;
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
    const isCrouching = this.keys.has('ControlLeft') || this.keys.has('ControlRight');
    const isWalking = this.keys.has('ShiftLeft');
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const input = new THREE.Vector3();
    const targetSpeed = isCrouching ? 3.4 : isWalking ? 4.6 : 9.2;

    if (this.keys.has('KeyW')) input.add(forward);
    if (this.keys.has('KeyS')) input.sub(forward);
    if (this.keys.has('KeyD')) input.add(right);
    if (this.keys.has('KeyA')) input.sub(right);

    if (input.lengthSq() > 0) {
      input.normalize();
      this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, input.x * targetSpeed, 0.28);
      this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, input.z * targetSpeed, 0.28);
    } else {
      this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, 0, 0.26);
      this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, 0, 0.26);
    }

    if (this.keys.has('Space') && this.isGrounded && !isCrouching) {
      this.verticalVelocity = JUMP_SPEED;
      this.isGrounded = false;
    }

    const nextPosition = this.group.position.clone().addScaledVector(this.velocity, delta);
    this.verticalVelocity -= GRAVITY * delta;
    nextPosition.y += this.verticalVelocity * delta;

    if (nextPosition.y <= 0) {
      nextPosition.y = 0;
      this.verticalVelocity = 0;
      this.isGrounded = true;
    }

    nextPosition.x = THREE.MathUtils.clamp(nextPosition.x, -24.5, 24.5);
    nextPosition.z = THREE.MathUtils.clamp(nextPosition.z, -35.5, 17.5);

    if (!this.collides(nextPosition)) {
      this.group.position.copy(nextPosition);
    } else {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }

    const targetEyeHeight = isCrouching ? CROUCH_EYE_HEIGHT : EYE_HEIGHT;
    this.eyeHeight = THREE.MathUtils.lerp(this.eyeHeight, targetEyeHeight, 1 - Math.pow(0.0005, delta));
    this.camera.position.y = this.eyeHeight;
  }

  private updateCamera() {
    this.group.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
    this.camera.rotation.y = 0;
    this.camera.rotation.z = 0;
  }

  private collides(position: THREE.Vector3) {
    const height = this.keys.has('ControlLeft') || this.keys.has('ControlRight') ? CROUCH_HEIGHT : STANDING_HEIGHT;
    const playerBox = new THREE.Box3(
      new THREE.Vector3(position.x - PLAYER_RADIUS, 0, position.z - PLAYER_RADIUS),
      new THREE.Vector3(position.x + PLAYER_RADIUS, height, position.z + PLAYER_RADIUS),
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
