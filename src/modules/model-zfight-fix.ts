import type { AppModule } from './types';

export const createModelZFightFixModule: AppModule = (facade) => {
  const unsubscribeModelAdded = facade.events.on('modelAdded', () => {
    facade.modelRoot.traverse((obj) => {
      obj.scale.multiplyScalar(1.0001);
    });
  });

  return () => {
    unsubscribeModelAdded();
  };
};
