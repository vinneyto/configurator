import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { AppModule } from './types';

const BATHROOM_MODEL_URL = '/models/bathroom-interior.glb';

export const createModelLoaderModule: AppModule = (facade) => {
  const loader = new GLTFLoader();
  let loadedRoot: Group | null = null;

  loader.load(
    BATHROOM_MODEL_URL,
    (gltf) => {
      loadedRoot = gltf.scene;
      facade.scene.add(loadedRoot);
    },
    undefined,
    (error) => {
      console.error(`Failed to load ${BATHROOM_MODEL_URL}`, error);
    }
  );

  return () => {
    if (loadedRoot) {
      facade.scene.remove(loadedRoot);
      loadedRoot = null;
    }
  };
};
