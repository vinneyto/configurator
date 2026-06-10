import { Raycaster, Vector2 } from 'three';
import type { AppModule } from './types';

export const createObjectPickDebugModule: AppModule = (facade) => {
  const raycaster = new Raycaster();
  const pointer = new Vector2();

  const handleClick = (event: MouseEvent) => {
    if (!event.metaKey || event.button !== 0) {
      return;
    }

    const rect = facade.renderer.domElement.getBoundingClientRect();

    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, facade.camera);

    const pickedObject = raycaster.intersectObject(facade.modelRoot, true)[0]?.object;

    if (!pickedObject) {
      console.info('[pick-debug] No object hit');
      return;
    }

    console.info('[pick-debug]', pickedObject);
  };

  facade.renderer.domElement.addEventListener('click', handleClick);

  return () => {
    facade.renderer.domElement.removeEventListener('click', handleClick);
  };
};
