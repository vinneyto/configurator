import type { AppModule } from './types';

export const createSceneRelaxationModule: AppModule = (facade) => {
  facade.setSceneRelaxed(true);

  const unsubscribeOrbitInteractionChanged = facade.events.on(
    'orbitInteractionChanged',
    ({ active }) => {
      facade.setSceneRelaxed(!active);
    }
  );

  return () => {
    unsubscribeOrbitInteractionChanged();
  };
};
