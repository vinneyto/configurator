import { add, float, mul, sub, vec4 } from 'three/tsl';
import { pass } from 'three/tsl';
import { TRANSPARENT_MATERIALS_LAYER } from '../core/layers';
import type { AppModule } from './types';

export const createTransparentPassModule: AppModule = (facade) => {
  const previousNode = facade.renderPipeline.outputNode;
  const previousColorNode = previousNode as ReturnType<typeof vec4>;

  const transparentScenePass = pass(facade.scene, facade.camera);
  transparentScenePass.setLayers(facade.camera.layers);
  transparentScenePass.opaque = false;
  transparentScenePass.transparent = true;

  const transparentPassLayers = transparentScenePass.getLayers();

  if (transparentPassLayers === null) {
    throw new Error('Transparent pass layers are not initialized');
  }

  transparentPassLayers.disableAll();
  transparentPassLayers.enable(TRANSPARENT_MATERIALS_LAYER);

  const transparentColorNode = transparentScenePass.getTextureNode('output');

  const oneMinusTransparentAlpha = sub(float(1), transparentColorNode.a);
  const compositePass = vec4(
    add(
      mul(previousColorNode.rgb, oneMinusTransparentAlpha),
      mul(transparentColorNode.rgb, transparentColorNode.a)
    ),
    previousColorNode.a
  );

  facade.renderPipeline.outputNode = compositePass;
  facade.renderPipeline.needsUpdate = true;

  return () => {
    transparentScenePass.dispose();
    facade.renderPipeline.outputNode = previousNode;
    facade.renderPipeline.needsUpdate = true;
  };
};
