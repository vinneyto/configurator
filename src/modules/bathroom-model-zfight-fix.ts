import { FrontSide, Mesh } from 'three';
import type { AppModule } from './types';

export const createBathroomModelZFightFixModule: AppModule = (facade) => {
  const unsubscribeModelAdded = facade.events.on('modelAdded', () => {
    facade.modelRoot.traverse((obj) => {
      obj.scale.multiplyScalar(1.0001);

      if (obj instanceof Mesh) {
        obj.material.side = FrontSide;
      }
    });
  });

  return () => {
    unsubscribeModelAdded();
  };
};
