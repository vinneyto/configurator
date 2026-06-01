import { FrontSide, Mesh, MeshPhysicalMaterial, UnsignedByteType } from 'three';
import { ssr } from 'three/addons/tsl/display/SSRNode.js';
import { add, colorToDirection, sample, vec4 } from 'three/tsl';
import type { AppModule } from './types';

export const createSsrPassModule: AppModule = (facade) => {
  const previousNode = facade.renderPipeline.outputNode;
  const previousColorNode = previousNode as ReturnType<typeof vec4>;

  const scenePassColor = facade.scenePass.getTextureNode('output');
  const scenePassDepth = facade.scenePass.getTextureNode('depth');
  const scenePassNormal = facade.scenePass.getTextureNode('normal');
  const scenePassMetalRough = facade.scenePass.getTextureNode('metalrough');

  const normalTexture = facade.scenePass.getTexture('normal');
  normalTexture.type = UnsignedByteType;

  const metalRoughTexture = facade.scenePass.getTexture('metalrough');
  metalRoughTexture.type = UnsignedByteType;

  const sceneNormal = sample((uv) => colorToDirection(scenePassNormal.sample(uv)));

  const ssrPass = ssr(
    scenePassColor,
    scenePassDepth,
    sceneNormal,
    scenePassMetalRough.r,
    scenePassMetalRough.g,
    facade.camera
  );
  ssrPass.resolutionScale = 0.5;
  ssrPass.maxDistance.value = 15;

  const ssrCompositePass = vec4(add(previousColorNode.rgb, ssrPass.rgb), previousColorNode.a);

  facade.renderPipeline.outputNode = ssrCompositePass;
  facade.renderPipeline.needsUpdate = true;

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
    facade.renderPipeline.outputNode = previousNode;
    facade.renderPipeline.needsUpdate = true;
  };
};
