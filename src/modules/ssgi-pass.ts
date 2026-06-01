import { UnsignedByteType } from 'three';
import { ssgi } from 'three/addons/tsl/display/SSGINode.js';
import { add, colorToDirection, sample, vec4 } from 'three/tsl';
import type { AppModule } from './types';

export const createSsgiPassModule: AppModule = (facade) => {
  const previousNode = facade.renderPipeline.outputNode;

  const scenePassColor = facade.scenePass.getTextureNode('output');
  const scenePassDiffuse = facade.scenePass.getTextureNode('diffuseColor');
  const scenePassDepth = facade.scenePass.getTextureNode('depth');
  const scenePassNormal = facade.scenePass.getTextureNode('normal');

  const diffuseTexture = facade.scenePass.getTexture('diffuseColor');
  diffuseTexture.type = UnsignedByteType;

  const normalTexture = facade.scenePass.getTexture('normal');
  normalTexture.type = UnsignedByteType;

  const sceneNormal = sample((uv) => colorToDirection(scenePassNormal.sample(uv)));

  const giPass = ssgi(scenePassColor, scenePassDepth, sceneNormal, facade.camera);

  type ResizableNode = {
    setSize: (width: number, height: number) => void;
  };

  const halfResGiPass = giPass as unknown as ResizableNode;
  const baseSetSize = halfResGiPass.setSize.bind(halfResGiPass);

  halfResGiPass.setSize = (width: number, height: number) => {
    baseSetSize(Math.max(1, Math.round(width * 0.5)), Math.max(1, Math.round(height * 0.5)));
  };

  giPass.sliceCount.value = 2;
  giPass.stepCount.value = 8;

  const gi = giPass.rgb;
  const ao = giPass.a;

  const ssgiCompositePass = vec4(
    add(scenePassColor.rgb.mul(ao), scenePassDiffuse.rgb.mul(gi)),
    scenePassColor.a
  );

  facade.renderPipeline.outputNode = ssgiCompositePass;
  facade.renderPipeline.needsUpdate = true;

  return () => {
    giPass.dispose();
    facade.renderPipeline.outputNode = previousNode;
    facade.renderPipeline.needsUpdate = true;
  };
};
