import { ao } from 'three/addons/tsl/display/GTAONode.js';
import { colorToDirection, sample, vec3, vec4 } from 'three/tsl';
import type { AppModule } from './types';

export const createSsaoPassModule: AppModule = (facade) => {
  const previousNode = facade.renderPipeline.outputNode;
  const previousColorNode = previousNode as ReturnType<typeof vec4>;

  const scenePassDepth = facade.scenePass.getTextureNode('depth');
  const scenePassNormal = facade.scenePass.getTextureNode('normal');
  const sceneNormal = sample((uv) => colorToDirection(scenePassNormal.sample(uv)));

  const aoPass = ao(scenePassDepth, sceneNormal, facade.camera);
  aoPass.resolutionScale = 0.5;

  const aoFactor = vec3(aoPass);
  const ssaoCompositePass = vec4(previousColorNode.rgb.mul(aoFactor), previousColorNode.a);

  facade.renderPipeline.outputNode = ssaoCompositePass;
  facade.renderPipeline.needsUpdate = true;

  return () => {
    aoPass.dispose();
    facade.renderPipeline.outputNode = previousNode;
    facade.renderPipeline.needsUpdate = true;
  };
};
