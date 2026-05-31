import { denoise } from 'three/addons/tsl/display/DenoiseNode.js';
import { ssgi } from 'three/addons/tsl/display/SSGINode.js';
import { vec4 } from 'three/tsl';
import type { AppModule } from './types';

export const createSsgiPassModule: AppModule = (facade) => {
  const originalOutputNode = facade.renderPipeline.outputNode;

  const scenePassColor = facade.scenePass.getTextureNode('output');
  const scenePassNormal = facade.scenePass.getTextureNode('normal');
  const scenePassDepth = facade.scenePass.getTextureNode('depth');

  const ssgiPass: any = ssgi(scenePassColor, scenePassDepth, scenePassNormal, facade.camera);
  ssgiPass.sliceCount.value = 1;
  ssgiPass.stepCount.value = 12;
  ssgiPass.useTemporalFiltering = false;

  const denoisedSsgi: any = denoise(
    ssgiPass.getTextureNode(),
    scenePassDepth,
    scenePassNormal,
    facade.camera
  );

  facade.renderPipeline.outputNode = vec4(scenePassColor.add(denoisedSsgi).rgb, scenePassColor.a);
  facade.renderPipeline.needsUpdate = true;

  return () => {
    ssgiPass.dispose();
    facade.renderPipeline.outputNode = originalOutputNode;
    facade.renderPipeline.needsUpdate = true;
  };
};
