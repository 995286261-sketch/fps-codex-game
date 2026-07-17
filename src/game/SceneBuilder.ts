import * as THREE from 'three';
import type { Target } from './types';

type SceneBuild = {
  targets: Target[];
  colliders: THREE.Box3[];
  playerSpawn: THREE.Vector3;
};

const concrete = new THREE.MeshStandardMaterial({ color: 0x8d8b82, roughness: 0.92, metalness: 0.05 });
const wornConcrete = new THREE.MeshStandardMaterial({ color: 0x6f726b, roughness: 0.96, metalness: 0.02 });
const containerBlue = new THREE.MeshStandardMaterial({ color: 0x2e5466, roughness: 0.72, metalness: 0.38 });
const containerRed = new THREE.MeshStandardMaterial({ color: 0x6d3d31, roughness: 0.74, metalness: 0.34 });
const wood = new THREE.MeshStandardMaterial({ color: 0x8a6848, roughness: 0.85, metalness: 0.02 });
const sand = new THREE.MeshStandardMaterial({ color: 0x9b8967, roughness: 0.94, metalness: 0.01 });
const metal = new THREE.MeshStandardMaterial({ color: 0x6f7676, roughness: 0.48, metalness: 0.65 });
const darkRubber = new THREE.MeshStandardMaterial({ color: 0x222726, roughness: 0.7, metalness: 0.05 });

export class SceneBuilder {
  build(scene: THREE.Scene): SceneBuild {
    scene.background = new THREE.Color(0xaeb8bc);
    scene.fog = new THREE.Fog(0xaeb8bc, 34, 86);

    this.addLighting(scene);
    this.addGround(scene);
    this.addRangeMarkings(scene);

    const colliders: THREE.Box3[] = [];
    const targets: Target[] = [];

    this.addWalls(scene, colliders);
    this.addContainers(scene, colliders);
    this.addCover(scene, colliders);
    this.addTargetBay(scene, targets);
    this.addDetails(scene);

    return {
      targets,
      colliders,
      playerSpawn: new THREE.Vector3(0, 0, 12),
    };
  }

  private addLighting(scene: THREE.Scene) {
    scene.add(new THREE.HemisphereLight(0xcfdde6, 0x5b5146, 1.3));

    const sun = new THREE.DirectionalLight(0xffe1b6, 2.5);
    sun.position.set(-12, 24, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -35;
    sun.shadow.camera.right = 35;
    sun.shadow.camera.top = 35;
    sun.shadow.camera.bottom = -35;
    scene.add(sun);

    const coolFill = new THREE.DirectionalLight(0x8fb8ff, 0.45);
    coolFill.position.set(14, 10, -20);
    scene.add(coolFill);
  }

  private addGround(scene: THREE.Scene) {
    const ground = new THREE.Mesh(new THREE.BoxGeometry(54, 0.22, 72), concrete);
    ground.position.y = -0.12;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(54, 18, 0x6f746f, 0x777b74);
    grid.position.y = 0.01;
    scene.add(grid);
  }

  private addRangeMarkings(scene: THREE.Scene) {
    const laneMaterial = new THREE.MeshBasicMaterial({ color: 0xd8c46d });
    [-8, 0, 8].forEach((x) => {
      const lane = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.025, 42), laneMaterial);
      lane.position.set(x, 0.03, -9);
      scene.add(lane);
    });

    const firingLine = new THREE.Mesh(new THREE.BoxGeometry(24, 0.03, 0.2), laneMaterial);
    firingLine.position.set(0, 0.035, 8.6);
    scene.add(firingLine);
  }

  private addWalls(scene: THREE.Scene, colliders: THREE.Box3[]) {
    this.box(scene, colliders, new THREE.Vector3(-27.5, 2.2, -6), new THREE.Vector3(1, 4.4, 58), wornConcrete);
    this.box(scene, colliders, new THREE.Vector3(27.5, 2.2, -6), new THREE.Vector3(1, 4.4, 58), wornConcrete);
    this.box(scene, colliders, new THREE.Vector3(0, 2.4, -42), new THREE.Vector3(56, 4.8, 1), wornConcrete);

    const backSign = new THREE.Mesh(new THREE.BoxGeometry(12, 1.2, 0.12), darkRubber);
    backSign.position.set(0, 3.6, -41.42);
    backSign.castShadow = true;
    scene.add(backSign);
  }

  private addContainers(scene: THREE.Scene, colliders: THREE.Box3[]) {
    this.container(scene, colliders, new THREE.Vector3(-17, 1.65, -13), containerBlue);
    this.container(scene, colliders, new THREE.Vector3(16, 1.65, -19), containerRed);
    this.container(scene, colliders, new THREE.Vector3(-18, 1.65, -30), containerRed);
  }

  private addCover(scene: THREE.Scene, colliders: THREE.Box3[]) {
    [
      [-8, 0.75, 0],
      [8, 0.75, 1],
      [-12, 0.75, -8],
      [12, 0.75, -9],
    ].forEach(([x, y, z]) => {
      this.box(scene, colliders, new THREE.Vector3(x, y, z), new THREE.Vector3(3.1, 1.5, 2.4), wood);
    });

    [-4, 4].forEach((x) => {
      const bag = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 2.2, 6, 12), sand);
      bag.rotation.z = Math.PI / 2;
      bag.position.set(x, 0.45, 5.2);
      bag.castShadow = true;
      bag.receiveShadow = true;
      scene.add(bag);
      colliders.push(new THREE.Box3().setFromObject(bag));
    });

    [-10, 10].forEach((x) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.2, 12), metal);
      rail.position.set(x, 0.9, -4);
      rail.castShadow = true;
      scene.add(rail);
    });
  }

  private addTargetBay(scene: THREE.Scene, targets: Target[]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(24, 5, 0.45), wornConcrete);
    wall.position.set(0, 2.5, -31);
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);

    const targetMaterial = new THREE.MeshStandardMaterial({ color: 0xd9d2c0, roughness: 0.68, metalness: 0.02 });
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x21201d });
    const bullseyeMaterial = new THREE.MeshBasicMaterial({ color: 0x9c2f27 });

    [
      [-7.5, 1.7, 60],
      [0, 2.3, 100],
      [7.5, 1.7, 60],
      [-3.8, 3.25, 80],
      [3.8, 3.25, 80],
    ].forEach(([x, y, value], index) => {
      const target = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.13, 48), targetMaterial.clone());
      target.rotation.x = Math.PI / 2;
      target.position.set(x, y, -30.68);
      target.castShadow = true;
      scene.add(target);

      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.035, 8, 48), ringMaterial);
      ring.position.set(x, y, -30.58);
      scene.add(ring);

      const bullseye = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 32), bullseyeMaterial);
      bullseye.rotation.x = Math.PI / 2;
      bullseye.position.set(x, y, -30.5);
      scene.add(bullseye);

      targets.push({
        id: `target-${index + 1}`,
        mesh: target,
        parts: [target, ring, bullseye],
        baseColor: new THREE.Color(0xd9d2c0),
        maxHealth: 100,
        health: 100,
        hitUntil: 0,
        respawnAt: 0,
        value,
      });
    });
  }

  private addDetails(scene: THREE.Scene) {
    const barrelMaterial = new THREE.MeshStandardMaterial({ color: 0x394141, roughness: 0.5, metalness: 0.72 });
    [-21, 22].forEach((x) => {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.45, 24), barrelMaterial);
      barrel.position.set(x, 0.72, 7);
      barrel.castShadow = true;
      barrel.receiveShadow = true;
      scene.add(barrel);
    });
  }

  private container(scene: THREE.Scene, colliders: THREE.Box3[], position: THREE.Vector3, material: THREE.Material) {
    const body = this.box(scene, colliders, position, new THREE.Vector3(7.5, 3.3, 3.1), material);
    for (let i = -3; i <= 3; i += 1.5) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.45, 3.22), metal);
      rib.position.set(i, 0, 0);
      rib.castShadow = true;
      body.add(rib);
    }
  }

  private box(
    scene: THREE.Scene,
    colliders: THREE.Box3[],
    position: THREE.Vector3,
    size: THREE.Vector3,
    material: THREE.Material,
  ) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    colliders.push(new THREE.Box3().setFromObject(mesh));
    return mesh;
  }
}
