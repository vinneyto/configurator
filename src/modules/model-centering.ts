import { Box3, Vector3 } from 'three';
import type { AppModule } from './types';

const box = new Box3();
const center = new Vector3();

export const createModelCenteringModule: AppModule = (facade) => {
  const unsubscribeModelAdded = facade.events.on('modelAdded', () => {
    facade.modelRoot.updateWorldMatrix(true, true);

    box.setFromObject(facade.modelRoot);

    if (box.isEmpty()) {
      return;
    }

    box.getCenter(center);
    facade.modelRoot.position.sub(center);
  });

  return () => {
    unsubscribeModelAdded();
  };
};
