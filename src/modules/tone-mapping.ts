import { ACESFilmicToneMapping } from 'three';
import type { AppModule } from './types';

export const createToneMappingModule: AppModule = (facade) => {
  facade.renderer.toneMapping = ACESFilmicToneMapping;
  facade.renderer.toneMappingExposure = 1;

  return () => {};
};
