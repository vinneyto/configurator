import { UnsignedByteType } from 'three';
import { ssr } from 'three/addons/tsl/display/SSRNode.js';
import { add, colorToDirection, sample, vec4 } from 'three/tsl';
import type { AppModule } from './types';

type ColorLikeNode = {
  rgb: unknown;
  a: unknown;
};

export const createSsrPassModule: AppModule = (facade) => {
  const previousNode = facade.renderPipeline.outputNode;
  const previousColorNode = previousNode as unknown as ColorLikeNode;

  const scenePassDepth = facade.scenePass.getTextureNode('depth');
  const scenePassNormal = facade.scenePass.getTextureNode('normal');
  const scenePassMetalRough = facade.scenePass.getTextureNode('metalrough');

  const normalTexture = facade.scenePass.getTexture('normal');
  normalTexture.type = UnsignedByteType;

  const metalRoughTexture = facade.scenePass.getTexture('metalrough');
  metalRoughTexture.type = UnsignedByteType;

  const sceneNormal = sample((uv) => colorToDirection(scenePassNormal.sample(uv)));

  const ssrPass = ssr(
    previousNode,
    scenePassDepth,
    sceneNormal,
    scenePassMetalRough.r,
    scenePassMetalRough.g,
    facade.camera
  );

  const ssrCompositePass = vec4(
    add(previousColorNode.rgb as never, ssrPass.rgb as never),
    previousColorNode.a as never
  );

  facade.renderPipeline.outputNode = ssrCompositePass;
  facade.renderPipeline.needsUpdate = true;

  return () => {
    ssrPass.dispose();
    facade.renderPipeline.outputNode = previousNode;
    facade.renderPipeline.needsUpdate = true;
  };
};
