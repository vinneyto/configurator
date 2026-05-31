import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { AppModule } from './types';

export const createModelParserModule: AppModule = (facade) => {
  const loader = new GLTFLoader();

  const unsubscribeLoadModel = facade.events.on('loadModel', async (event) => {
    try {
      const gltf = await loader.parseAsync(event.buffer, '');

      facade.scene.remove(facade.modelRoot);
      facade.modelRoot = gltf.scene;
      facade.scene.add(facade.modelRoot);

      facade.events.emit('modelAdded', { at: performance.now() });
    } catch (error) {
      console.error('Failed to parse loaded model buffer', error);
    }
  });

  return () => {
    unsubscribeLoadModel();
    facade.scene.remove(facade.modelRoot);
  };
};
