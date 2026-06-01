import { TRANSPARENT_MATERIALS_LAYER } from '../core/layers';
import type { AppModule } from './types';

export const createTransparentPostRenderModule: AppModule = (facade) => {
  const unsubscribePostRender = facade.events.on('postRender', () => {
    const originalLayerMask = facade.camera.layers.mask;
    const originalAutoClearColor = facade.renderer.autoClearColor;

    facade.camera.layers.disableAll();
    facade.camera.layers.enable(TRANSPARENT_MATERIALS_LAYER);

    facade.renderer.autoClearColor = false;
    facade.renderer.render(facade.scene, facade.camera);

    facade.renderer.autoClearColor = originalAutoClearColor;
    facade.camera.layers.mask = originalLayerMask;
  });

  return () => {
    unsubscribePostRender();
  };
};
