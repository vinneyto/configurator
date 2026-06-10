import { WebIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import { metalRough } from '@gltf-transform/functions';
import type { AppModule } from './types';

const WALL_LAMP_MODEL_URL = '/models/wall_lamp.glb';

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException('The operation was aborted', 'AbortError');
  }
}

async function loadAndTransform(signal?: AbortSignal) {
  throwIfAborted(signal);

  const io = new WebIO().registerExtensions(KHRONOS_EXTENSIONS);
  const document = await io.read(WALL_LAMP_MODEL_URL);

  throwIfAborted(signal);
  await document.transform(metalRough());

  throwIfAborted(signal);
  return await io.writeBinary(document);
}

export const createWallLampModelLoaderModule: AppModule = (facade) => {
  const abortController = new AbortController();

  loadAndTransform(abortController.signal)
    .then((glb) => {
      facade.events.emit('loadModel', { buffer: glb.buffer });
    })
    .catch((error) => {
      console.error(`Failed to load ${WALL_LAMP_MODEL_URL}`, error);
    });

  return () => {
    abortController.abort();
  };
};
