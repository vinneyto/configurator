import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { AppModule } from './types';

export const createOrbitControlsModule: AppModule = (facade) => {
  const controls = new OrbitControls(facade.camera, facade.renderer.domElement);
  controls.enableDamping = true;

  const unsubscribeModelAdded = facade.events.on('modelAdded', ({ camera }) => {
    facade.camera.position.set(camera.position.x, camera.position.y, camera.position.z);
    controls.target.set(camera.target.x, camera.target.y, camera.target.z);
    controls.update();
  });

  const unsubscribeUpdate = facade.events.on('update', () => {
    controls.update();
  });

  return () => {
    unsubscribeModelAdded();
    unsubscribeUpdate();
    controls.dispose();
  };
};
