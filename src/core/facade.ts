import { Color, Group, PerspectiveCamera, Scene, Timer } from 'three';
import { RenderPipeline, WebGPURenderer } from 'three/webgpu';
import { diffuseColor, directionToColor, mrt, normalView, output, pass, velocity } from 'three/tsl';
import { createEventBus, type EventBus } from './events';

export class AppFacade {
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly renderer: WebGPURenderer;
  readonly renderPipeline: RenderPipeline;
  readonly scenePass: ReturnType<typeof pass>;
  readonly events: EventBus;
  modelRoot: Group;

  private readonly timer: Timer;
  private isRunning = false;

  constructor(container: HTMLElement) {
    this.scene = new Scene();
    this.scene.background = new Color(0x10131a);

    this.camera = new PerspectiveCamera(60, 1, 0.1, 20);
    this.camera.position.set(0, 0, 5);

    this.renderer = new WebGPURenderer({ antialias: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    container.appendChild(this.renderer.domElement);

    this.scenePass = pass(this.scene, this.camera);
    this.scenePass.setMRT(
      mrt({
        output,
        diffuseColor,
        normal: directionToColor(normalView),
        velocity,
      })
    );

    this.renderPipeline = new RenderPipeline(this.renderer);
    this.renderPipeline.outputNode = this.scenePass.getTextureNode('output');

    this.events = createEventBus();
    this.modelRoot = new Group();
    this.scene.add(this.modelRoot);

    this.timer = new Timer();
    this.timer.connect(document);
  }

  async start(): Promise<void> {
    if (this.isRunning) return;

    await this.renderer.init();
    this.events.emit('rendererInitialized', { at: performance.now() });

    this.isRunning = true;
    this.renderer.setAnimationLoop(this.tick);
  }

  stop(): void {
    this.isRunning = false;
    this.renderer.setAnimationLoop(null);
    this.renderPipeline.dispose();
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
    this.renderPipeline.render();
  };
}
