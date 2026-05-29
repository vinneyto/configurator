import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { AppModule } from './types';

export const createOrbitControlsModule: AppModule = (facade) => {
  const controls = new OrbitControls(facade.camera, facade.renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 1, 0);
  controls.update();

  const unsubscribeUpdate = facade.events.on('update', () => {
    controls.update();
  });

  return () => {
    unsubscribeUpdate();
    controls.dispose();
  };
};
