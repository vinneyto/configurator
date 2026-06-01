import { Mesh, type Material } from 'three';
import { TRANSPARENT_MATERIALS_LAYER } from '../core/layers';
import type { AppModule } from './types';

function hasTransparentMaterial(material: Material | Material[]): boolean {
  if (Array.isArray(material)) {
    return material.some((entry) => entry.transparent);
  }

  return material.transparent;
}

export const createTransparentMaterialLayerModule: AppModule = (facade) => {
  facade.camera.layers.disable(TRANSPARENT_MATERIALS_LAYER);

  const unsubscribeModelAdded = facade.events.on('modelAdded', () => {
    facade.modelRoot.traverse((obj) => {
      if (!(obj instanceof Mesh)) {
        return;
      }

      if (!hasTransparentMaterial(obj.material)) {
        return;
      }

      obj.layers.set(TRANSPARENT_MATERIALS_LAYER);
    });
  });

  return () => {
    unsubscribeModelAdded();
    facade.camera.layers.enable(TRANSPARENT_MATERIALS_LAYER);
  };
};
