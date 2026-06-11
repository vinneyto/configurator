import { ao } from 'three/addons/tsl/display/GTAONode.js';
import { vec3, vec4 } from 'three/tsl';
import type { AppModule } from './types';
import type { PassNode } from 'three/webgpu';

export const createSsaoPassModule: AppModule = (facade) => {
  const previousNode = facade.renderPipeline.outputNode;
  const previousColorNode = previousNode as PassNode;

  const scenePassDepth = facade.scenePass.getTextureNode('depth');

  // @ts-expect-error
  const aoPass = ao(scenePassDepth, null, facade.camera);
  aoPass.resolutionScale = 0.5;
  aoPass.scale.value = 0.75;

  const aoFactor = vec3(aoPass);
  const ssaoCompositePass = vec4(previousColorNode.rgb.mul(aoFactor.x), previousColorNode.a);

  facade.renderPipeline.outputNode = ssaoCompositePass;
  facade.renderPipeline.needsUpdate = true;

  return () => {
    aoPass.dispose();
    facade.renderPipeline.outputNode = previousNode;
    facade.renderPipeline.needsUpdate = true;
  };
};
