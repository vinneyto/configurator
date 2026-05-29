import { Clock, Color, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EventEmitter } from './events';

export class AppFacade {
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly renderer: WebGLRenderer;
  readonly events: EventEmitter;
  orbitControls: OrbitControls | null = null;

  private readonly clock: Clock;
  private isRunning = false;

  constructor(container: HTMLElement) {
    this.scene = new Scene();
    this.scene.background = new Color(0x10131a);

    this.camera = new PerspectiveCamera(60, 1, 0.1, 1000);
    this.camera.position.set(0, 0, 5);

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    container.appendChild(this.renderer.domElement);

    this.events = new EventEmitter();
    this.clock = new Clock();
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.clock.start();
    this.renderer.setAnimationLoop(this.tick);
  }

  stop(): void {
    this.isRunning = false;
    this.renderer.setAnimationLoop(null);
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private tick = (): void => {
    const deltaSeconds = this.clock.getDelta();
    const elapsedSeconds = this.clock.getElapsedTime();

    this.events.emit('update', { deltaSeconds, elapsedSeconds });
    this.renderer.render(this.scene, this.camera);
  };
}
