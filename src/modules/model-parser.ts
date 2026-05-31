import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { AppModule } from './types';

export const createModelParserModule: AppModule = (facade) => {
  const loader = new GLTFLoader();
  let loadedRoot: Group | null = null;

  const unsubscribeLoadModel = facade.events.on('loadModel', async (event) => {
    try {
      const gltf = await loader.parseAsync(event.buffer, '');

      if (loadedRoot) {
        facade.scene.remove(loadedRoot);
      }

      loadedRoot = gltf.scene;
      facade.scene.add(loadedRoot);
    } catch (error) {
      console.error('Failed to parse loaded model buffer', error);
    }
  });

  return () => {
    unsubscribeLoadModel();

    if (loadedRoot) {
      facade.scene.remove(loadedRoot);
      loadedRoot = null;
    }
  };
};
