import * as THREE from 'three';
import { SceneBuilder } from './SceneBuilder';
import { PlayerController } from './PlayerController';
import { Shooting } from './Shooting';
import { Hud } from '../ui/Hud';

export class Game {
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(62, 1, 0.1, 140);
  private readonly renderer = new THREE.WebGLRenderer({ antialias: true });
  private readonly clock = new THREE.Clock();
  private readonly hud: Hud;
  private readonly player: PlayerController;
  private readonly shooting: Shooting;
  private animationFrame = 0;

  constructor(private readonly root: HTMLElement) {
    this.root.className = 'game-shell';
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.root.appendChild(this.renderer.domElement);

    const sceneBuild = new SceneBuilder().build(this.scene);
    this.player = new PlayerController(this.camera, this.renderer.domElement, sceneBuild.colliders);
    this.player.setPosition(sceneBuild.playerSpawn);
    this.scene.add(this.player.group);

    this.shooting = new Shooting(this.scene, sceneBuild.targets);
    this.hud = new Hud(this.root);

    this.bindEvents();
    this.resize();
  }

  start() {
    this.clock.start();
    this.loop();
  }

  private loop = () => {
    const delta = Math.min(this.clock.getDelta(), 0.033);
    const now = performance.now();

    this.player.update(delta);
    this.shooting.update(now);
    this.hud.update(now, this.shooting.getCooldown(now));
    this.renderer.render(this.scene, this.camera);

    this.animationFrame = window.requestAnimationFrame(this.loop);
  };

  private bindEvents() {
    window.addEventListener('resize', this.resize);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('beforeunload', this.dispose);
  }

  private readonly onMouseDown = (event: MouseEvent) => {
    if (event.button !== 0) return;

    const now = performance.now();
    if (!this.shooting.canShoot(now)) return;

    const muzzle = this.player.getMuzzleWorldPosition();
    const result = this.shooting.shoot(this.camera, muzzle, now);

    if (result.hit && result.target) {
      this.hud.addScore(result.target.value, now);
    } else {
      this.hud.showMiss(now);
    }
  };

  private readonly resize = () => {
    const width = this.root.clientWidth;
    const height = this.root.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };

  private readonly dispose = () => {
    window.cancelAnimationFrame(this.animationFrame);
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('mousedown', this.onMouseDown);
    this.player.dispose();
    this.renderer.dispose();
  };
}
