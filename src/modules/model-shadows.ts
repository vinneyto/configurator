import {
  Box3,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  ShadowMaterial,
  Vector3,
} from 'three';
import type { AppModule } from './types';

const box = new Box3();
const size = new Vector3();

const isMeshObject = (object: Object3D): object is Mesh => object instanceof Mesh;

export const createModelShadowsModule: AppModule = (facade) => {
  const shadowCatcher = new Mesh(
    new PlaneGeometry(1, 1),
    new ShadowMaterial({ color: 0x000000, opacity: 0.22 })
  );

  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.receiveShadow = true;
  shadowCatcher.visible = false;
  shadowCatcher.renderOrder = -1;

  const glowPlate = new Mesh(
    new PlaneGeometry(1.1, 1.1),
    new MeshBasicMaterial({ color: 0x1f2330 })
  );
  glowPlate.rotation.x = -Math.PI / 2;
  glowPlate.position.y = -0.002;
  glowPlate.receiveShadow = true;
  shadowCatcher.add(glowPlate);

  facade.scene.add(shadowCatcher);

  const unsubscribeModelAdded = facade.events.on('modelAdded', () => {
    facade.modelRoot.updateWorldMatrix(true, true);
    box.setFromObject(facade.modelRoot);

    if (box.isEmpty()) {
      shadowCatcher.visible = false;
      return;
    }

    box.getSize(size);

    const planeSize = Math.max(size.x, size.z, 1) * 1.55;

    shadowCatcher.visible = true;
    shadowCatcher.scale.set(planeSize, planeSize, 1);
    shadowCatcher.position.set(0, box.min.y - 0.018, 0);

    facade.modelRoot.traverse((object) => {
      if (!isMeshObject(object)) {
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;
    });
  });

  return () => {
    unsubscribeModelAdded();
    facade.scene.remove(shadowCatcher);
    shadowCatcher.geometry.dispose();
    shadowCatcher.material.dispose();
    glowPlate.geometry.dispose();
    glowPlate.material.dispose();
  };
};
