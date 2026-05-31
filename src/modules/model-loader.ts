import { WebIO } from '@gltf-transform/core';
import type { AppModule } from './types';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import { metalRough } from '@gltf-transform/functions';

const BATHROOM_MODEL_URL = '/models/bathroom_interior.glb';

async function loadAndTransform() {
  const io = new WebIO().registerExtensions(KHRONOS_EXTENSIONS);
  const document = await io.read(BATHROOM_MODEL_URL);

  await document.transform(metalRough());

  return await io.writeBinary(document);
}

export const createModelLoaderModule: AppModule = (facade) => {
  let isDisposed = false;

  loadAndTransform()
    .then((glb) => {
      if (isDisposed) {
        return;
      }

      facade.events.emit('loadModel', { buffer: glb.buffer });
    })
    .catch((error) => {
      if (isDisposed) {
        return;
      }

      console.error(`Failed to load ${BATHROOM_MODEL_URL}`, error);
    });

  return () => {
    isDisposed = true;
  };
};
