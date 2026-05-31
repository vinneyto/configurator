import { Color, Group, PerspectiveCamera, Scene, Timer, WebGLRenderer } from 'three';
import { createEventBus, type EventBus } from './events';

export class AppFacade {
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly renderer: WebGLRenderer;
  readonly events: EventBus;
  modelRoot: Group;

  private readonly timer: Timer;
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

    this.events = createEventBus();
    this.modelRoot = new Group();
    this.scene.add(this.modelRoot);

    this.timer = new Timer();
    this.timer.connect(document);
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
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

  private tick = (time: number): void => {
    this.timer.update(time);

    const deltaSeconds = this.timer.getDelta();
    const elapsedSeconds = this.timer.getElapsed();

    this.events.emit('update', { deltaSeconds, elapsedSeconds });
    this.renderer.render(this.scene, this.camera);
  };
}
