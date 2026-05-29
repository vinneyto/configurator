import { Box3, Vector3 } from 'three';
import type { AppModule } from './types';

export const createModelCenteringModule: AppModule = (facade) => {
  const unsubscribeModelLoaded = facade.events.on('modelLoaded', ({ rootGroup }) => {
    const bbox = new Box3().setFromObject(rootGroup);
    const center = new Vector3();
    bbox.getCenter(center);

    rootGroup.position.sub(center);
  });

  return () => {
    unsubscribeModelLoaded();
  };
};
