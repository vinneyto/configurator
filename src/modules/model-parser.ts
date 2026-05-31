import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { AppModule } from './types';

export const createModelParserModule: AppModule = (facade) => {
  const loader = new GLTFLoader();
  let loadedRoot: Group | null = null;

  facade.events.on('loadModel', async (event) => {
    const gltf = await loader.parseAsync(event.buffer, '');

    loadedRoot = gltf.scene;
    facade.scene.add(loadedRoot);
  });

  return () => {
    if (loadedRoot) {
      facade.scene.remove(loadedRoot);
      loadedRoot = null;
    }
  };
};
