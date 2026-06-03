import { traa } from 'three/addons/tsl/display/TRAANode.js';
import type { ViewportModule } from './types';

export const createTaaPassModule: ViewportModule = (_facade, viewport) => {
  const previousNode = viewport.renderPipeline.outputNode;

  const scenePassDepth = viewport.scenePass.getTextureNode('depth');
  const scenePassVelocity = viewport.scenePass.getTextureNode('velocity');

  const traaPass = traa(previousNode, scenePassDepth, scenePassVelocity, viewport.camera);

  viewport.renderPipeline.outputNode = traaPass;
  viewport.renderPipeline.needsUpdate = true;

  return () => {
    viewport.renderPipeline.outputNode = previousNode;
    viewport.renderPipeline.needsUpdate = true;
  };
};
