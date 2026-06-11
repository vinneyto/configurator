import { convertToTexture, sample, vec3, vec4 } from 'three/tsl';
import type { AppModule } from './types';

export const createCoolBrightPassModule: AppModule = (facade) => {
  const previousNode = facade.renderPipeline.outputNode;
  const sceneColor = convertToTexture(previousNode);

  const coolBrightPass = sample((uv) => {
    const color = sceneColor.sample(uv) as any;

    return vec4(color.rgb.mul(vec3(0.97, 1.0, 1.06)).add(vec3(0.02, 0.02, 0.025)), color.a);
  });

  facade.renderPipeline.outputNode = coolBrightPass;
  facade.renderPipeline.needsUpdate = true;

  return () => {
    facade.renderPipeline.outputNode = previousNode;
    facade.renderPipeline.needsUpdate = true;
  };
};
