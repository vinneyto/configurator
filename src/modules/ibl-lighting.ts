import { PMREMGenerator } from 'three/webgpu';
import { StudioRoomEnvironment } from '../environments/studio-room-environment';
import type { AppModule } from './types';

export const createIBLLightingModule: AppModule = (facade) => {
  const environment = new StudioRoomEnvironment({
    lightColor: 0xffe6f2,
    emissiveColor: 0xffeef8,
    pointLightIntensityMultiplier: 1,
    emissiveIntensityMultiplier: 1,
  });

  const pmremGenerator = new PMREMGenerator(facade.renderer);

  facade.scene.environment = pmremGenerator.fromScene(environment, 0.04).texture;
  facade.scene.environmentIntensity = 0.5;

  pmremGenerator.dispose();
  environment.dispose();

  return () => {
    facade.scene.environment = null;
  };
};
