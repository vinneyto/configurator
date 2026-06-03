import { ACESFilmicToneMapping, Color, Group, PerspectiveCamera, Scene, Timer } from 'three';
import { screenUV, step, vec4 } from 'three/tsl';
import { RenderPipeline, WebGPURenderer } from 'three/webgpu';
import { createEventBus, type EventBus } from './events';
import {
  createViewportContext,
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
  private readonly screenRenderPipeline: RenderPipeline;
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

    this.canvasWidth = Math.max(1, Math.round(container.clientWidth));
    this.canvasHeight = Math.max(1, Math.round(container.clientHeight));
    this.renderer.setSize(this.canvasWidth, this.canvasHeight);

    container.appendChild(this.renderer.domElement);

    this.events = createEventBus();
    this.modelRoot = new Group();
    this.scene.add(this.modelRoot);

    this.viewports = viewportDefinitions.map((definition) =>
      createViewportContext(definition, this.scene, this.renderer)
    );
    this.primaryViewport = this.viewports[0];
    this.viewportById = new Map(this.viewports.map((viewport) => [viewport.id, viewport]));
    this.screenRenderPipeline = new RenderPipeline(this.renderer, this.composeViewportOutputs());

    this.viewports.forEach((viewport) => {
      this.updateViewportCameraAspect(viewport);
    });

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
    this.screenRenderPipeline.dispose();
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

    this.renderer.setRenderTarget(null);
    this.renderer.setScissorTest(false);
    this.renderer.setViewport(0, 0, this.canvasWidth, this.canvasHeight);

    const previousAutoClear = this.renderer.autoClear;
    this.renderer.autoClear = true;
    this.renderer.clear();
    this.renderer.autoClear = false;

    this.screenRenderPipeline.render();

    this.renderer.autoClear = previousAutoClear;
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

  private updateViewportCameraAspect(viewport: ViewportContext): void {
    const aspect = this.canvasWidth / this.canvasHeight;

    if (viewport.camera.aspect !== aspect) {
      viewport.camera.aspect = aspect;
      viewport.camera.updateProjectionMatrix();
    }
  }

  private composeViewportOutputs() {
    const [leftViewport, rightViewport] = this.viewports;

    if (!leftViewport || !rightViewport) {
      throw new Error('Split viewport demo requires exactly two viewports');
    }

    const leftOutputNode = leftViewport.renderPipeline.outputNode as ReturnType<typeof vec4>;
    const rightOutputNode = rightViewport.renderPipeline.outputNode as ReturnType<typeof vec4>;
    const leftMask = this.createViewportMaskNode(leftViewport.bounds);
    const rightMask = this.createViewportMaskNode(rightViewport.bounds);

    return leftOutputNode.mul(leftMask).add(rightOutputNode.mul(rightMask));
  }

  private createViewportMaskNode(bounds: RelativeViewportBounds) {
    const bottom = 1 - bounds.top - bounds.height;
    const right = bounds.left + bounds.width;
    const top = bottom + bounds.height;

    return step(bounds.left, screenUV.x)
      .mul(step(screenUV.x, right))
      .mul(step(bottom, screenUV.y))
      .mul(step(screenUV.y, top));
  }
}
