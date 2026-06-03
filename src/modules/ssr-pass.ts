import { FrontSide, Mesh, MeshPhysicalMaterial, UnsignedByteType } from 'three';
import { ssr } from 'three/addons/tsl/display/SSRNode.js';
import { add, colorToDirection, sample, vec4 } from 'three/tsl';
import type { ViewportModule } from './types';

export const createSsrPassModule: ViewportModule = (facade, viewport) => {
  const previousNode = viewport.renderPipeline.outputNode;
  const previousColorNode = previousNode as ReturnType<typeof vec4>;

  const scenePassColor = viewport.scenePass.getTextureNode('output');
  const scenePassDepth = viewport.scenePass.getTextureNode('depth');
  const scenePassNormal = viewport.scenePass.getTextureNode('normal');
  const scenePassMetalRough = viewport.scenePass.getTextureNode('metalrough');

  const normalTexture = viewport.scenePass.getTexture('normal');
  normalTexture.type = UnsignedByteType;

  const metalRoughTexture = viewport.scenePass.getTexture('metalrough');
  metalRoughTexture.type = UnsignedByteType;

  const sceneNormal = sample((uv) => colorToDirection(scenePassNormal.sample(uv)));

  const ssrPass = ssr(
    scenePassColor,
    scenePassDepth,
    sceneNormal,
    scenePassMetalRough.r,
    scenePassMetalRough.g,
    viewport.camera
  );
  ssrPass.resolutionScale = 0.5;
  ssrPass.maxDistance.value = 15;

  const ssrCompositePass = vec4(add(previousColorNode.rgb, ssrPass.rgb), previousColorNode.a);

  viewport.renderPipeline.outputNode = ssrCompositePass;
  viewport.renderPipeline.needsUpdate = true;

  const unsubscribeModelAdded = facade.events.on('modelAdded', () => {
    facade.modelRoot.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.material.side = FrontSide;
        if (obj.material instanceof MeshPhysicalMaterial) {
          obj.material.metalness = 0.2;
        }
      }
    });
  });

  return () => {
    unsubscribeModelAdded();
    ssrPass.dispose();
    viewport.renderPipeline.outputNode = previousNode;
    viewport.renderPipeline.needsUpdate = true;
  };
};
