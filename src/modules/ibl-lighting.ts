import { RoomEnvironment } from 'three/examples/jsm/Addons.js';
import { PMREMGenerator } from 'three/webgpu';
import type { AppModule } from './types';

export const createIBLLightingModule: AppModule = (facade) => {
  const environment = new RoomEnvironment();
  const pmremGenerator = new PMREMGenerator(facade.renderer);

  facade.scene.environment = pmremGenerator.fromScene(environment, 0.04).texture;
  facade.scene.environmentIntensity = 0.5;
  pmremGenerator.dispose();
  environment.dispose();

  return () => {
    facade.scene.environment = null;
  };
};
