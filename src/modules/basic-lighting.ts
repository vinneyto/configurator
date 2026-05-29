import { AmbientLight, DirectionalLight } from 'three';
import type { AppModule } from './types';

export const createBasicLightingModule: AppModule = (facade) => {
  const keyLight = new DirectionalLight(0xffffff, 1.2);
  keyLight.position.set(6, 8, 4);

  const fillLight = new AmbientLight(0xffffff, 0.45);

  facade.scene.add(keyLight, fillLight);

  return () => {
    facade.scene.remove(keyLight, fillLight);
  };
};
