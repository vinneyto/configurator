import { Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { AppModule } from './types';

const CAMERA_ANIMATION_DURATION_SECONDS = 0.8;

type CameraAnimationState = {
  startTimeSeconds: number | null;
  fromPosition: Vector3;
  toPosition: Vector3;
  fromTarget: Vector3;
  toTarget: Vector3;
};

export const createOrbitControlsModule: AppModule = (facade) => {
  const controls = new OrbitControls(facade.camera, facade.renderer.domElement);
  controls.enableDamping = true;

  let cameraAnimation: CameraAnimationState | null = null;

  const unsubscribeModelAdded = facade.events.on('modelAdded', ({ camera }) => {
    const fromPosition = facade.camera.position.clone();
    const fromTarget = controls.target.clone();

    const toPosition = new Vector3(camera.position.x, camera.position.y, camera.position.z);
    const toTarget = new Vector3(camera.target.x, camera.target.y, camera.target.z);

    cameraAnimation = {
      startTimeSeconds: null,
      fromPosition,
      toPosition,
      fromTarget,
      toTarget,
    };
  });

  const unsubscribeUpdate = facade.events.on('update', ({ elapsedSeconds }) => {
    if (cameraAnimation) {
      if (cameraAnimation.startTimeSeconds === null) {
        cameraAnimation.startTimeSeconds = elapsedSeconds;
      }

      const startTimeSeconds = cameraAnimation.startTimeSeconds ?? elapsedSeconds;
      cameraAnimation.startTimeSeconds = startTimeSeconds;

      const elapsed = elapsedSeconds - startTimeSeconds;
      const progress = Math.min(Math.max(elapsed / CAMERA_ANIMATION_DURATION_SECONDS, 0), 1);

      facade.camera.position.lerpVectors(
        cameraAnimation.fromPosition,
        cameraAnimation.toPosition,
        progress
      );
      controls.target.lerpVectors(cameraAnimation.fromTarget, cameraAnimation.toTarget, progress);

      if (progress >= 1) {
        cameraAnimation = null;
      }
    }

    controls.update();
  });

  return () => {
    unsubscribeModelAdded();
    unsubscribeUpdate();
    controls.dispose();
  };
};
