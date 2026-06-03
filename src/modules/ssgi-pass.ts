import { UnsignedByteType } from 'three';
import { ssgi } from 'three/addons/tsl/display/SSGINode.js';
import { add, colorToDirection, sample, vec4 } from 'three/tsl';
import type { ViewportModule } from './types';

export const createSsgiPassModule: ViewportModule = (_facade, viewport) => {
  const previousNode = viewport.renderPipeline.outputNode;

  const scenePassColor = viewport.scenePass.getTextureNode('output');
  const scenePassDiffuse = viewport.scenePass.getTextureNode('diffuseColor');
  const scenePassDepth = viewport.scenePass.getTextureNode('depth');
  const scenePassNormal = viewport.scenePass.getTextureNode('normal');

  const diffuseTexture = viewport.scenePass.getTexture('diffuseColor');
  diffuseTexture.type = UnsignedByteType;

  const normalTexture = viewport.scenePass.getTexture('normal');
  normalTexture.type = UnsignedByteType;

  const sceneNormal = sample((uv) => colorToDirection(scenePassNormal.sample(uv)));

  const giPass = ssgi(scenePassColor, scenePassDepth, sceneNormal, viewport.camera);

  giPass.sliceCount.value = 2;
  giPass.stepCount.value = 8;

  const gi = giPass.rgb;
  const ao = giPass.a;

  const ssgiCompositePass = vec4(
    add(scenePassColor.rgb.mul(ao), scenePassDiffuse.rgb.mul(gi)),
    scenePassColor.a
  );

  viewport.renderPipeline.outputNode = ssgiCompositePass;
  viewport.renderPipeline.needsUpdate = true;

  const unsubscribeSceneRelaxationChanged = _facade.events.on(
    'sceneRelaxationChanged',
    ({ relaxed }) => {
      giPass.sliceCount.value = relaxed ? 2 : 1;
      giPass.stepCount.value = relaxed ? 8 : 1;
    }
  );

  return () => {
    unsubscribeSceneRelaxationChanged();
    giPass.dispose();
    viewport.renderPipeline.outputNode = previousNode;
    viewport.renderPipeline.needsUpdate = true;
  };
};
