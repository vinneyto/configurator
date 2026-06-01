import { traa } from 'three/addons/tsl/display/TRAANode.js';
import type { AppModule } from './types';

export const createTaaPassModule: AppModule = (facade) => {
  const previousNode = facade.renderPipeline.outputNode;

  const scenePassDepth = facade.scenePass.getTextureNode('depth');
  const scenePassVelocity = facade.scenePass.getTextureNode('velocity');

  const traaPass = traa(previousNode, scenePassDepth, scenePassVelocity, facade.camera);

  facade.renderPipeline.outputNode = traaPass;
  facade.renderPipeline.needsUpdate = true;

  return () => {
    facade.renderPipeline.outputNode = previousNode;
    facade.renderPipeline.needsUpdate = true;
  };
};
