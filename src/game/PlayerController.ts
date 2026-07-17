import * as THREE from 'three';

const PLAYER_RADIUS = 0.45;
const UP = new THREE.Vector3(0, 1, 0);

export class PlayerController {
  readonly group = new THREE.Group();
  readonly aimDirection = new THREE.Vector3(0, 0, -1);

  private readonly muzzle = new THREE.Object3D();
  private readonly keys = new Set<string>();
  private readonly velocity = new THREE.Vector3();
  private readonly desiredCameraPosition = new THREE.Vector3();
  private readonly torsoPivot = new THREE.Group();
  private readonly riflePivot = new THREE.Group();
  private readonly aimPivot = new THREE.Group();
  private readonly aimTarget = new THREE.Vector3();
  private yaw = 0;
  private pitch = 0.12;
  private isPointerLocked = false;

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly domElement: HTMLElement,
    private readonly colliders: THREE.Box3[],
  ) {
    this.buildPlayerRig();
    this.bindInput();
  }

  setPosition(position: THREE.Vector3) {
    this.group.position.copy(position);
  }

  getMuzzleWorldPosition(target = new THREE.Vector3()) {
    return this.muzzle.getWorldPosition(target);
  }

  update(delta: number) {
    this.updateMovement(delta);
    this.updateCamera(delta);
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
  }

  private buildPlayerRig() {
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3f4844, roughness: 0.72, metalness: 0.05 });
    const vestMaterial = new THREE.MeshStandardMaterial({ color: 0x202826, roughness: 0.85, metalness: 0.03 });
    const visorMaterial = new THREE.MeshStandardMaterial({ color: 0x14191a, roughness: 0.28, metalness: 0.4 });
    const weaponMaterial = new THREE.MeshStandardMaterial({ color: 0x0d1112, roughness: 0.34, metalness: 0.55 });
    const gloveMaterial = new THREE.MeshStandardMaterial({ color: 0x171d1b, roughness: 0.8, metalness: 0.04 });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.95, 8, 16), bodyMaterial);
    body.position.y = 0.88;
    body.castShadow = true;
    this.group.add(body);

    this.torsoPivot.position.y = 1.08;
    this.group.add(this.torsoPivot);

    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.72, 0.42), vestMaterial);
    vest.position.set(0, 0.03, -0.02);
    vest.castShadow = true;
    this.torsoPivot.add(vest);

    const shoulderBar = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.18, 0.22), vestMaterial);
    shoulderBar.position.set(0, 0.37, -0.04);
    shoulderBar.castShadow = true;
    this.torsoPivot.add(shoulderBar);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 14), bodyMaterial);
    head.position.y = 0.76;
    head.castShadow = true;
    this.torsoPivot.add(head);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.08), visorMaterial);
    visor.position.set(0, 0.78, -0.21);
    visor.castShadow = true;
    this.torsoPivot.add(visor);

    this.aimPivot.position.set(0.26, 0.34, -0.1);
    this.torsoPivot.add(this.aimPivot);

    this.riflePivot.position.set(0.1, -0.05, -0.32);
    this.riflePivot.rotation.set(0, -0.08, -0.04);
    this.aimPivot.add(this.riflePivot);

    const rifle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.13, 1.52), weaponMaterial);
    rifle.position.set(-0.05, 0, -0.76);
    rifle.castShadow = true;
    this.riflePivot.add(rifle);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.58, 12), weaponMaterial);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(-0.05, 0.02, -1.62);
    barrel.castShadow = true;
    this.riflePivot.add(barrel);

    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 0.38), weaponMaterial);
    stock.position.set(0.02, 0.04, 0.08);
    stock.castShadow = true;
    this.riflePivot.add(stock);

    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.36, 0.13), weaponMaterial);
    grip.position.set(0.03, -0.2, -0.22);
    grip.rotation.x = -0.28;
    grip.castShadow = true;
    this.riflePivot.add(grip);

    const rightArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.72, 6, 10), gloveMaterial);
    rightArm.rotation.x = Math.PI / 2;
    rightArm.rotation.z = -0.28;
    rightArm.position.set(0.1, -0.12, -0.18);
    rightArm.castShadow = true;
    this.riflePivot.add(rightArm);

    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 8), gloveMaterial);
    rightHand.position.set(0.05, -0.24, -0.22);
    rightHand.castShadow = true;
    this.riflePivot.add(rightHand);

    const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.88, 6, 10), gloveMaterial);
    leftArm.rotation.x = Math.PI / 2;
    leftArm.rotation.z = 0.26;
    leftArm.position.set(-0.2, -0.06, -0.55);
    leftArm.castShadow = true;
    this.riflePivot.add(leftArm);

    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), gloveMaterial);
    leftHand.position.set(-0.1, -0.04, -0.82);
    leftHand.castShadow = true;
    this.riflePivot.add(leftHand);

    this.muzzle.position.set(-0.05, 0.02, -1.93);
    this.riflePivot.add(this.muzzle);
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
    const forward = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw) * -1).normalize();
    const right = new THREE.Vector3(forward.z * -1, 0, forward.x);
    const input = new THREE.Vector3();

    if (this.keys.has('KeyW')) input.add(forward);
    if (this.keys.has('KeyS')) input.sub(forward);
    if (this.keys.has('KeyD')) input.add(right);
    if (this.keys.has('KeyA')) input.sub(right);

    if (input.lengthSq() > 0) {
      input.normalize();
      this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, input.x * 8.5, 0.2);
      this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, input.z * 8.5, 0.2);
    } else {
      this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, 0, 0.18);
      this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, 0, 0.18);
    }

    const nextPosition = this.group.position.clone().addScaledVector(this.velocity, delta);
    nextPosition.x = THREE.MathUtils.clamp(nextPosition.x, -24.5, 24.5);
    nextPosition.z = THREE.MathUtils.clamp(nextPosition.z, -35.5, 17.5);

    if (!this.collides(nextPosition)) {
      this.group.position.copy(nextPosition);
    }
  }

  private updateCamera(delta: number) {
    const cameraDirection = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch),
    ).normalize();

    this.aimDirection.copy(cameraDirection);
    this.aimTarget.copy(this.camera.position).addScaledVector(cameraDirection, 14);
    const characterAim = this.aimTarget.clone().sub(this.group.position);
    characterAim.y = 0;
    if (characterAim.lengthSq() > 0.0001) {
      characterAim.normalize();
      this.group.rotation.y = Math.atan2(characterAim.x, -characterAim.z);
    }
    this.torsoPivot.rotation.x = this.pitch * 0.1;
    this.aimPivot.rotation.x = this.pitch * 0.85;

    const shoulderOffset = new THREE.Vector3(0.56, 1.48, 0.14).applyAxisAngle(UP, this.yaw);
    const shoulder = this.group.position.clone().add(shoulderOffset);
    this.desiredCameraPosition.copy(shoulder).addScaledVector(cameraDirection, -4.75);
    this.desiredCameraPosition.y += 0.46;

    this.camera.position.lerp(this.desiredCameraPosition, 1 - Math.pow(0.001, delta));
    this.camera.lookAt(shoulder.clone().addScaledVector(cameraDirection, 10));
    this.camera.updateMatrixWorld();
  }

  private collides(position: THREE.Vector3) {
    const playerBox = new THREE.Box3(
      new THREE.Vector3(position.x - PLAYER_RADIUS, 0, position.z - PLAYER_RADIUS),
      new THREE.Vector3(position.x + PLAYER_RADIUS, 2.0, position.z + PLAYER_RADIUS),
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
    this.yaw += event.movementX * 0.0021;
    this.pitch = THREE.MathUtils.clamp(this.pitch - event.movementY * 0.0018, -0.72, 0.38);
  };

  private readonly onPointerLockChange = () => {
    this.isPointerLocked = document.pointerLockElement === this.domElement;
  };
}
