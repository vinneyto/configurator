import { ACESFilmicToneMapping, Color, Group, PerspectiveCamera, Scene, Timer } from 'three';
import { WebGPURenderer } from 'three/webgpu';
import { createEventBus, type EventBus } from './events';
import {
  createViewportContext,
  type PixelViewportBounds,
  type RelativeViewportBounds,
  type ViewportContext,
  type ViewportDefinition,
} from './viewport';

export class AppFacade {
  readonly scene: Scene;
  readonly renderer: WebGPURenderer;
  readonly events: EventBus;
  readonly viewports: ViewportContext[];
  readonly primaryViewport: ViewportContext;
  modelRoot: Group;
  sceneRelaxed = false;

  private readonly timer: Timer;
  private readonly viewportById: Map<string, ViewportContext>;
  private canvasWidth = 1;
  private canvasHeight = 1;
  private isRunning = false;

  constructor(container: HTMLElement, viewportDefinitions: ViewportDefinition[]) {
    if (viewportDefinitions.length === 0) {
      throw new Error('At least one viewport definition is required');
    }

    this.scene = new Scene();
    this.scene.background = new Color(0x10131a);

    this.renderer = new WebGPURenderer({
      antialias: false,
      requiredLimits: { maxColorAttachmentBytesPerSample: 128 },
    });
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    container.appendChild(this.renderer.domElement);

    this.events = createEventBus();
    this.modelRoot = new Group();
    this.scene.add(this.modelRoot);

    this.viewports = viewportDefinitions.map((definition) =>
      createViewportContext(definition, this.scene, this.renderer)
    );
    this.primaryViewport = this.viewports[0];
    this.viewportById = new Map(this.viewports.map((viewport) => [viewport.id, viewport]));

    this.timer = new Timer();
    this.timer.connect(document);
  }

  get camera(): PerspectiveCamera {
    return this.primaryViewport.camera;
  }

  getViewport(id: string): ViewportContext {
    const viewport = this.viewportById.get(id);

    if (!viewport) {
      throw new Error(`Viewport not found: ${id}`);
    }

    return viewport;
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
    this.viewports.forEach((viewport) => {
      viewport.renderPipeline.dispose();
    });
  }

  resize(width: number, height: number): void {
    this.canvasWidth = Math.max(1, Math.round(width));
    this.canvasHeight = Math.max(1, Math.round(height));

    this.renderer.setSize(this.canvasWidth, this.canvasHeight);

    this.viewports.forEach((viewport) => {
      this.updateViewportCameraAspect(viewport);
    });
  }

  setSceneRelaxed(relaxed: boolean): void {
    if (this.sceneRelaxed === relaxed) return;

    this.sceneRelaxed = relaxed;
    this.events.emit('sceneRelaxationChanged', { relaxed });
  }

  private tick = (time: number): void => {
    this.timer.update(time);

    const deltaSeconds = this.timer.getDelta();
    const elapsedSeconds = this.timer.getElapsed();

    this.events.emit('update', { deltaSeconds, elapsedSeconds });
    this.syncSecondaryViewportsFromPrimary();

    this.renderer.setScissorTest(true);

    this.viewports.forEach((viewport) => {
      const bounds = this.resolvePixelViewportBounds(viewport.bounds);
      this.updateViewportCameraAspect(viewport, bounds);
      this.renderer.setViewport(bounds.left, bounds.bottom, bounds.width, bounds.height);
      this.renderer.setScissor(bounds.left, bounds.bottom, bounds.width, bounds.height);
      viewport.renderPipeline.render();
    });

    this.renderer.setScissorTest(false);
  };

  private syncSecondaryViewportsFromPrimary(): void {
    const primaryCamera = this.primaryViewport.camera;

    this.viewports.forEach((viewport) => {
      if (viewport === this.primaryViewport) {
        return;
      }

      const camera = viewport.camera;
      camera.position.copy(primaryCamera.position);
      camera.quaternion.copy(primaryCamera.quaternion);
      camera.up.copy(primaryCamera.up);
      camera.fov = primaryCamera.fov;
      camera.near = primaryCamera.near;
      camera.far = primaryCamera.far;
      camera.zoom = primaryCamera.zoom;
      camera.focus = primaryCamera.focus;
      camera.filmGauge = primaryCamera.filmGauge;
      camera.filmOffset = primaryCamera.filmOffset;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
    });
  }

  private updateViewportCameraAspect(
    viewport: ViewportContext,
    pixelBounds = this.resolvePixelViewportBounds(viewport.bounds)
  ): void {
    const aspect = Math.max(1, pixelBounds.width) / Math.max(1, pixelBounds.height);

    if (viewport.camera.aspect !== aspect) {
      viewport.camera.aspect = aspect;
      viewport.camera.updateProjectionMatrix();
    }
  }

  private resolvePixelViewportBounds(bounds: RelativeViewportBounds): PixelViewportBounds {
    const left = Math.round(bounds.left * this.canvasWidth);
    const top = Math.round(bounds.top * this.canvasHeight);
    const width = Math.max(1, Math.round(bounds.width * this.canvasWidth));
    const height = Math.max(1, Math.round(bounds.height * this.canvasHeight));
    const bottom = this.canvasHeight - top - height;

    return {
      left,
      bottom,
      width,
      height,
    };
  }
}
