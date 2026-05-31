import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { CameraParams } from '../core/events';
import type { AppModule } from './types';

const MODEL_BEST_VIEW_CAMERA_PARAMS: CameraParams = {
  position: { x: 0.29504003191361994, y: 0.3295496107818005, z: -0.7445457901311194 },
  target: { x: 0, y: 0, z: 0 },
};

export const createModelParserModule: AppModule = (facade) => {
  const loader = new GLTFLoader();

  const unsubscribeLoadModel = facade.events.on('loadModel', async (event) => {
    try {
      const gltf = await loader.parseAsync(event.buffer, '');

      facade.scene.remove(facade.modelRoot);
      facade.modelRoot = gltf.scene;
      facade.scene.add(facade.modelRoot);

      facade.events.emit('modelAdded', {
        at: performance.now(),
        camera: MODEL_BEST_VIEW_CAMERA_PARAMS,
      });
    } catch (error) {
      console.error('Failed to parse loaded model buffer', error);
    }
  });

  return () => {
    unsubscribeLoadModel();
    facade.scene.remove(facade.modelRoot);
  };
};
