import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import type { AppModule } from './types';

export const createGlowPassModule: AppModule = (facade) => {
  const previousNode = facade.renderPipeline.outputNode;
  const glowPass = bloom(previousNode, 0.08, 0.18, 0.88);
  const compositeNode = (previousNode as any).add(glowPass as any);

  facade.renderPipeline.outputNode = compositeNode;
  facade.renderPipeline.needsUpdate = true;

  return () => {
    (glowPass as { dispose?: () => void }).dispose?.();
    facade.renderPipeline.outputNode = previousNode;
    facade.renderPipeline.needsUpdate = true;
  };
};
