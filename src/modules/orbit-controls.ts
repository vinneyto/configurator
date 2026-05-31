import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { AppModule } from './types';
import { Vector3 } from 'three';

const INITIAL_CAMERA_PARAMS = {
  position: new Vector3(0.29504003191361994, 0.3295496107818005, -0.7445457901311194),
  target: new Vector3(0, 0, 0),
};

export const createOrbitControlsModule: AppModule = (facade) => {
  const controls = new OrbitControls(facade.camera, facade.renderer.domElement);
  controls.enableDamping = true;
  facade.camera.position.copy(INITIAL_CAMERA_PARAMS.position);
  controls.target.copy(INITIAL_CAMERA_PARAMS.target);
  controls.update();

  const unsubscribeUpdate = facade.events.on('update', () => {
    controls.update();
  });

  return () => {
    unsubscribeUpdate();
    controls.dispose();
  };
};
