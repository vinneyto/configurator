import { Box3, Sphere, Vector3 } from 'three';
import type { AppModule } from './types';

export const createOrbitRadiusFromModelModule: AppModule = (facade) => {
  const unsubscribeModelLoaded = facade.events.on('modelLoaded', ({ rootGroup }) => {
    const controls = facade.orbitControls;
    if (!controls) {
      return;
    }

    const bbox = new Box3().setFromObject(rootGroup);
    const sphere = new Sphere();
    bbox.getBoundingSphere(sphere);

    const radius = Math.max(sphere.radius, 0.1);
    const orbitDistanceFactor = 0.3;
    const minDistance = Math.max(radius * orbitDistanceFactor, 0.1);
    const maxDistance = Math.max(radius * 8, minDistance + 1);

    controls.minDistance = minDistance;
    controls.maxDistance = maxDistance;

    const viewDirection = new Vector3()
      .subVectors(facade.camera.position, controls.target)
      .normalize();
    const cameraDistance = radius * 2.5;

    facade.camera.position.copy(
      controls.target.clone().add(viewDirection.multiplyScalar(cameraDistance))
    );
    controls.update();
  });

  return () => {
    unsubscribeModelLoaded();
  };
};
