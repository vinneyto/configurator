import { PerspectiveCamera, Scene } from 'three';
import { RenderPipeline, WebGPURenderer } from 'three/webgpu';
import {
  diffuseColor,
  directionToColor,
  metalness,
  mrt,
  normalView,
  output,
  pass,
  roughness,
  vec2,
  velocity,
} from 'three/tsl';

export type RelativeViewportBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type PixelViewportBounds = {
  left: number;
  bottom: number;
  width: number;
  height: number;
};

export type ViewportDefinition = {
  id: string;
  bounds: RelativeViewportBounds;
};

export type ViewportContext = {
  id: string;
  bounds: RelativeViewportBounds;
  camera: PerspectiveCamera;
  renderPipeline: RenderPipeline;
  scenePass: ReturnType<typeof pass>;
};

export const createViewportContext = (
  definition: ViewportDefinition,
  scene: Scene,
  renderer: WebGPURenderer
): ViewportContext => {
  const camera = new PerspectiveCamera(60, 1, 0.1, 20);
  camera.position.set(0, 0, 5);

  const scenePass = pass(scene, camera);
  scenePass.setMRT(
    mrt({
      output,
      diffuseColor,
      normal: directionToColor(normalView),
      metalrough: vec2(metalness, roughness),
      velocity,
    })
  );

  const renderPipeline = new RenderPipeline(renderer);
  renderPipeline.outputNode = scenePass.getTextureNode('output');

  return {
    id: definition.id,
    bounds: definition.bounds,
    camera,
    renderPipeline,
    scenePass,
  };
};
