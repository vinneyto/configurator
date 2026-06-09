import { pass, sample, select, uniform, vec2 } from 'three/tsl';
import type { AppModule } from './types';
import { type PassNode } from 'three/webgpu';

export const createSplitPassModule: AppModule = (facade) => {
  const previousNode = facade.renderPipeline.outputNode;
  const previousColorNode = previousNode as PassNode;

  const rawScenePass = pass(facade.scene, facade.camera);

  const rawColor = rawScenePass.getTextureNode('output');
  const sceneColor = previousColorNode.getTextureNode();

  const ratio = uniform(0.5);

  const verticalSplit = sample((uv) => {
    const x = (uv as ReturnType<typeof vec2>).x;

    return select(x.greaterThan(ratio), sceneColor.sample(uv), rawColor.sample(uv));
  });

  facade.renderPipeline.outputNode = verticalSplit;
  facade.renderPipeline.needsUpdate = true;

  return () => {};
};
