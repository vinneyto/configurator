import { Matrix4 } from 'three';
import type { AppModule } from './types';

const EPSILON = 1e-6;

const matricesEqual = (a: Matrix4, b: Matrix4, epsilon = EPSILON): boolean => {
  const ae = a.elements;
  const be = b.elements;

  for (let i = 0; i < 16; i += 1) {
    if (Math.abs(ae[i] - be[i]) > epsilon) {
      return false;
    }
  }

  return true;
};

export const createSceneRelaxationModule: AppModule = (facade) => {
  const previousCameraMatrixWorld = new Matrix4().copy(facade.camera.matrixWorld);
  const previousCameraProjectionMatrix = new Matrix4().copy(facade.camera.projectionMatrix);

  let stableFrames = 0;
  let resizedSinceLastFrame = false;

  facade.setSceneRelaxed(false);

  const unsubscribeResize = facade.events.on('rendererResized', () => {
    resizedSinceLastFrame = true;
    stableFrames = 0;
    facade.setSceneRelaxed(false);
  });

  const unsubscribeModelAdded = facade.events.on('modelAdded', () => {
    stableFrames = 0;
    facade.setSceneRelaxed(false);
  });

  const unsubscribeUpdate = facade.events.on('update', () => {
    const cameraUnchanged =
      matricesEqual(previousCameraMatrixWorld, facade.camera.matrixWorld) &&
      matricesEqual(previousCameraProjectionMatrix, facade.camera.projectionMatrix);

    if (!resizedSinceLastFrame && cameraUnchanged) {
      stableFrames += 1;
    } else {
      stableFrames = 0;
      facade.setSceneRelaxed(false);
    }

    if (stableFrames >= 2) {
      facade.setSceneRelaxed(true);
    }

    previousCameraMatrixWorld.copy(facade.camera.matrixWorld);
    previousCameraProjectionMatrix.copy(facade.camera.projectionMatrix);
    resizedSinceLastFrame = false;
  });

  return () => {
    unsubscribeUpdate();
    unsubscribeModelAdded();
    unsubscribeResize();
  };
};
