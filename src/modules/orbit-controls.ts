import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { AppModule } from './types';

export const createOrbitControlsModule: AppModule = (facade) => {
  const controls = new OrbitControls(facade.camera, facade.renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0, 0);
  controls.update();

  facade.orbitControls = controls;

  const unsubscribeModelLoaded = facade.events.on('modelLoaded', ({ rootGroup }) => {
    controls.target.copy(rootGroup.position);
    controls.update();
  });

  const unsubscribeUpdate = facade.events.on('update', () => {
    controls.update();
  });

  return () => {
    unsubscribeModelLoaded();
    unsubscribeUpdate();
    facade.orbitControls = null;
    controls.dispose();
  };
};
