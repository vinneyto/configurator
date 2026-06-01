import { PerspectiveCamera } from 'three';
import { add, float, mul, sub, vec4 } from 'three/tsl';
import { pass } from 'three/tsl';
import { TRANSPARENT_MATERIALS_LAYER } from '../core/layers';
import type { AppModule } from './types';

export const createTransparentPassModule: AppModule = (facade) => {
  const previousNode = facade.renderPipeline.outputNode;
  const previousColorNode = previousNode as ReturnType<typeof vec4>;

  const transparentCamera = new PerspectiveCamera();
  transparentCamera.layers.disableAll();
  transparentCamera.layers.enable(TRANSPARENT_MATERIALS_LAYER);

  const syncTransparentCamera = () => {
    transparentCamera.copy(facade.camera, false);
    transparentCamera.layers.disableAll();
    transparentCamera.layers.enable(TRANSPARENT_MATERIALS_LAYER);
    transparentCamera.matrixWorld.copy(facade.camera.matrixWorld);
    transparentCamera.matrixWorldInverse.copy(facade.camera.matrixWorldInverse);
    transparentCamera.projectionMatrix.copy(facade.camera.projectionMatrix);
    transparentCamera.projectionMatrixInverse.copy(facade.camera.projectionMatrixInverse);
  };

  syncTransparentCamera();

  const transparentScenePass = pass(facade.scene, transparentCamera);
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

  const unsubscribeUpdate = facade.events.on('update', () => {
    syncTransparentCamera();
  });

  return () => {
    unsubscribeUpdate();
    transparentScenePass.dispose();
    facade.renderPipeline.outputNode = previousNode;
    facade.renderPipeline.needsUpdate = true;
  };
};
