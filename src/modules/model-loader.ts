import { Box3, Group, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { AppModule } from './types';

const BATHROOM_MODEL_URL = '/models/bathroom_interior.glb';

export const createModelLoaderModule: AppModule = (facade) => {
  const loader = new GLTFLoader();
  const rootGroup = new Group();
  rootGroup.name = 'ModelRootGroup';
  facade.scene.add(rootGroup);

  let loadedPivot: Group | null = null;

  loader.load(
    BATHROOM_MODEL_URL,
    (gltf) => {
      const pivotGroup = new Group();
      pivotGroup.name = 'ModelPivotGroup';

      const model = gltf.scene;
      model.name = model.name || 'LoadedModel';

      const bbox = new Box3().setFromObject(model);
      const center = new Vector3();
      bbox.getCenter(center);
      model.position.sub(center);

      pivotGroup.add(model);
      rootGroup.add(pivotGroup);
      loadedPivot = pivotGroup;

      facade.events.emit('modelLoaded', {
        rootGroup,
        pivotGroup,
        model,
      });
    },
    undefined,
    (error) => {
      console.error(`Failed to load ${BATHROOM_MODEL_URL}`, error);
    }
  );

  return () => {
    if (loadedPivot) {
      rootGroup.remove(loadedPivot);
      loadedPivot = null;
    }

    facade.scene.remove(rootGroup);
  };
};
