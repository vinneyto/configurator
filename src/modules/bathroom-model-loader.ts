import { WebIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import { metalRough } from '@gltf-transform/functions';
import type { AppModule } from './types';

const BATHROOM_MODEL_URL = '/models/bathroom_interior.glb';

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException('The operation was aborted', 'AbortError');
  }
}

async function loadAndTransform(signal?: AbortSignal) {
  throwIfAborted(signal);

  const io = new WebIO().registerExtensions(KHRONOS_EXTENSIONS);
  const document = await io.read(BATHROOM_MODEL_URL);

  throwIfAborted(signal);
  await document.transform(metalRough());

  throwIfAborted(signal);
  return await io.writeBinary(document);
}

export const createBathroomModelLoaderModule: AppModule = (facade) => {
  const abortController = new AbortController();

  loadAndTransform(abortController.signal)
    .then((glb) => {
      facade.events.emit('loadModel', { buffer: glb.buffer });
    })
    .catch((error) => {
      console.error(`Failed to load ${BATHROOM_MODEL_URL}`, error);
    });

  return () => {
    abortController.abort();
  };
};
