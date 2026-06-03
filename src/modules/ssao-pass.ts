import { ao } from 'three/addons/tsl/display/GTAONode.js';
import { vec3, vec4 } from 'three/tsl';
import type { ViewportModule } from './types';

export const createSsaoPassModule: ViewportModule = (_facade, viewport) => {
  const previousNode = viewport.renderPipeline.outputNode;
  const previousColorNode = previousNode as ReturnType<typeof vec4>;

  const scenePassDepth = viewport.scenePass.getTextureNode('depth');

  // @ts-expect-error
  const aoPass = ao(scenePassDepth, null, viewport.camera);
  aoPass.resolutionScale = 0.5;

  const aoFactor = vec3(aoPass);
  const ssaoCompositePass = vec4(previousColorNode.rgb.mul(aoFactor.x), previousColorNode.a);

  viewport.renderPipeline.outputNode = ssaoCompositePass;
  viewport.renderPipeline.needsUpdate = true;

  return () => {
    aoPass.dispose();
    viewport.renderPipeline.outputNode = previousNode;
    viewport.renderPipeline.needsUpdate = true;
  };
};
