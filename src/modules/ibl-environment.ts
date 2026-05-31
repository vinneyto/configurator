import { EquirectangularReflectionMapping, PMREMGenerator, type Texture } from 'three';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import type { AppModule } from './types';

const IBL_HDR_URL = '/hdr/environment.hdr';

export const createIblEnvironmentModule: AppModule = (facade) => {
  const pmremGenerator = new PMREMGenerator(facade.renderer);
  pmremGenerator.compileEquirectangularShader();

  let isDisposed = false;
  let environmentTexture: Texture | null = null;

  new HDRLoader().load(
    IBL_HDR_URL,
    (hdrTexture) => {
      if (isDisposed) {
        hdrTexture.dispose();
        return;
      }

      hdrTexture.mapping = EquirectangularReflectionMapping;

      const envMapTexture = pmremGenerator.fromEquirectangular(hdrTexture).texture;
      hdrTexture.dispose();

      environmentTexture = envMapTexture;
      facade.scene.environment = envMapTexture;
    },
    undefined,
    (error) => {
      console.error(`Failed to load HDRI from "${IBL_HDR_URL}"`, error);
    }
  );

  return () => {
    isDisposed = true;

    if (facade.scene.environment === environmentTexture) {
      facade.scene.environment = null;
    }

    environmentTexture?.dispose();
    pmremGenerator.dispose();
  };
};
